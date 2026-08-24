/* ================= actions / handlers ================= */
function attachGlobalHandlers(){
  document.querySelectorAll('[data-nav]').forEach(el=>{
    el.addEventListener('click', ()=> go(el.getAttribute('data-nav')));
  });
  document.querySelectorAll('[data-action]').forEach(el=>{
    el.addEventListener('click', (e)=> handleAction(el, e));
  });
  const loginForm = document.getElementById('login-form');
  if(loginForm) loginForm.addEventListener('submit', handleLoginSubmit);
  const signupForm = document.getElementById('signup-form');
  if(signupForm) signupForm.addEventListener('submit', handleSignupSubmit);
}

async function handleAction(el, e){
  const action = el.getAttribute('data-action');
  switch(action){
    case 'start-booking':
      state.booking = {};
      go('book-service');
      break;
    case 'pick-service':
      state.booking.serviceId = el.getAttribute('data-id');
      state.booking.date = null; state.booking.time = null;
      go('book-date');
      break;
    case 'pick-date':
      state.booking.date = el.getAttribute('data-iso');
      state.booking.time = null;
      go('book-time');
      break;
    case 'pick-time':
      state.booking.time = el.getAttribute('data-time');
      go('book-confirm');
      break;
    case 'go-payment':
      go('book-payment');
      break;
    case 'copy-pix':
      try{ await navigator.clipboard.writeText(state.booking.pixCode||''); }catch(err){}
      el.textContent = 'Código copiado ✓';
      setTimeout(render, 1200);
      break;
    case 'confirm-payment': {
      if(el.disabled) break; // evita duplo clique
      const originalLabel = el.textContent;
      el.disabled = true;
      el.textContent = 'Confirmando...';
      try{
        const ok = await finalizeBooking();
        if(!ok){
          // finalizeBooking já tratou o erro/redirecionamento; apenas reabilita o botão se ele ainda existir na tela
          el.disabled = false;
          el.textContent = originalLabel;
        }
      }catch(error){
        console.error('Erro ao confirmar agendamento:', error);
        alert('Ocorreu um erro ao confirmar seu agendamento. Tente novamente.');
        el.disabled = false;
        el.textContent = originalLabel;
      }
      break;
    }
    case 'logout':
      state.session = null;
      await storeSet('session', null, false);
      go('home');
      break;
    case 'account-tab':
      state.accountTab = el.getAttribute('data-tab');
      render();
      break;
    case 'cancel-appt':
      await cancelAppointment(el.getAttribute('data-id'));
      break;
    case 'admin-tab':
      state.adminTab = el.getAttribute('data-tab');
      render();
      break;
    case 'toggle-service':
      await toggleService(el.getAttribute('data-id'));
      break;
    case 'new-service':
      openServiceModal(null);
      break;
    case 'edit-service':
      openServiceModal(el.getAttribute('data-id'));
      break;
    case 'delete-service':
      await deleteService(el.getAttribute('data-id'));
      break;
    case 'admin-pick-date':
      state.adminScheduleDate = el.getAttribute('data-iso');
      render();
      break;
    case 'toggle-fullday':
      await toggleFullDayBlock(el.getAttribute('data-iso'));
      break;
    case 'toggle-slot-block':
      await toggleSlotBlock(el.getAttribute('data-iso'), el.getAttribute('data-time'));
      break;
  }
}

async function handleLoginSubmit(e){
  e.preventDefault();
  const fd = new FormData(e.target);
  const email = fd.get('email').trim().toLowerCase();
  const password = fd.get('password');
  const users = await getUsers();
  const u = users.find(x=>x.email.toLowerCase()===email && x.password===password);
  if(!u){ state.authError = 'E-mail ou senha incorretos.'; render(); return; }
  state.session = {email:u.email, name:u.name, role:u.role, phone:u.phone};
  state.authError = '';
  await storeSet('session', {email:u.email}, false);
  go(u.role==='admin' ? 'admin' : (state.booking.time ? 'book-confirm' : 'home'));
}

async function handleSignupSubmit(e){
  e.preventDefault();
  const fd = new FormData(e.target);
  const name = fd.get('name').trim();
  const email = fd.get('email').trim().toLowerCase();
  const phone = fd.get('phone').trim();
  const password = fd.get('password');
  if(password.length<4){ state.authError='A senha deve ter pelo menos 4 caracteres.'; render(); return; }
  const users = await getUsers();
  if(users.some(u=>u.email.toLowerCase()===email)){ state.authError='Já existe uma conta com esse e-mail.'; render(); return; }
  const newUser = {id:uid(), name, email, phone, password, role:'client'};
  users.push(newUser);
  await saveUsers(users);
  state.session = {email, name, role:'client', phone};
  state.authError = '';
  await storeSet('session', {email}, false);
  go(state.booking.time ? 'book-confirm' : 'home');
}

async function finalizeBooking(){
  // Retorna true em caso de sucesso (já navegou para book-success),
  // ou false quando o erro já foi tratado (alerta exibido / usuário redirecionado).
  // Nunca deixa uma exceção escapar sem feedback visual.
  try{
    // 1. validar login
    if(!state.session || !state.session.email){
      throw new Error('Você precisa estar logado para concluir o agendamento. Faça login novamente.');
    }
    // 2. validar serviço selecionado
    if(!state.booking.serviceId){
      throw new Error('Nenhum serviço foi selecionado. Volte e escolha um serviço.');
    }
    // 3. validar data selecionada
    if(!state.booking.date){
      throw new Error('Nenhuma data foi selecionada. Volte e escolha uma data.');
    }
    // 4. validar horário selecionado
    if(!state.booking.time){
      throw new Error('Nenhum horário foi selecionado. Volte e escolha um horário.');
    }

    // 5. regra de corte: nada de novos agendamentos após 21:00
    if(isBookingLocked()){
      alert('Após às 21:00 não é possível concluir novos agendamentos. Tente novamente amanhã.');
      go('home');
      return false;
    }

    // 6. localizar o serviço pelo id (nunca assumir que existe)
    const svc = state.services.find(s => s.id === state.booking.serviceId);
    if(!svc){
      throw new Error('O serviço selecionado não foi encontrado. Por favor, escolha novamente.');
    }

    const iso = state.booking.date;
    const time = state.booking.time;

    // 7. reconferir se o horário continua disponível (pode ter sido reservado por outro cliente)
    const stillFree = availableSlotsFor(iso).find(s => s.time === time && !s.disabled);
    if(!stillFree){
      alert('Esse horário acabou de ser reservado por outro cliente. Escolha outro horário.');
      go('book-time');
      return false;
    }

    // 8. criar o objeto do agendamento
    const appt = {
      id: uid(),
      clientEmail: state.session.email,
      clientName: state.session.name,
      clientPhone: state.session.phone || '',
      serviceId: svc.id,
      serviceName: svc.name,
      date: iso,
      time: time,
      price: svc.price,
      status: 'Confirmado',
      createdAt: new Date().toISOString(),
    };

    // 9. adicionar ao estado em memória (atualiza "Meus agendamentos" e o painel admin imediatamente)
    state.appointments.push(appt);

    // 10. persistir no armazenamento — se falhar, desfazemos a alteração em memória e avisamos o usuário
    try{
      await saveAppointments();
    }catch(storageError){
      state.appointments.pop();
      throw new Error('Não foi possível salvar o agendamento. Verifique sua conexão e tente novamente.');
    }

    // notificação simulada para o barbeiro (estrutura pronta para integração futura com WhatsApp/e-mail)
    console.log('[Notificação Barbeiro]', `${appt.clientName} agendou ${appt.serviceName} em ${appt.date} às ${appt.time} — ${fmtBRL(appt.price)}`);

    // 11. guardar o último agendamento para a tela de sucesso e limpar o código PIX usado
    state.booking.lastAppointment = appt;
    state.booking.pixCode = null;

    // 12. redirecionar para a tela de sucesso
    go('book-success');
    return true;

  }catch(error){
    console.error('Erro em finalizeBooking:', error);
    alert(error && error.message ? error.message : 'Não foi possível concluir o agendamento. Tente novamente.');
    return false;
  }
}

async function cancelAppointment(id){
  const a = state.appointments.find(x=>x.id===id);
  if(!a) return;
  if(!confirm('Cancelar este agendamento?')) return;
  a.status = 'Cancelado';
  await saveAppointments();
  render();
}

async function toggleService(id){
  const s = state.services.find(x=>x.id===id);
  s.active = !s.active;
  await saveServices();
  render();
}

async function deleteService(id){
  if(!confirm('Excluir este serviço permanentemente?')) return;
  state.services = state.services.filter(s=>s.id!==id);
  await saveServices();
  render();
}

function openServiceModal(id){
  const existing = id ? state.services.find(s=>s.id===id) : null;
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <h3>${existing?'Editar serviço':'Novo serviço'}</h3>
      <div class="field"><label>Nome</label><input id="m-name" value="${existing?existing.name:''}"></div>
      <div class="field"><label>Descrição</label><textarea id="m-desc" rows="3">${existing?existing.description:''}</textarea></div>
      <div class="field"><label>Preço (R$)</label><input id="m-price" type="number" step="0.01" value="${existing?existing.price:''}"></div>
      <div class="field"><label>Duração (min)</label><input id="m-dur" type="number" value="${existing?existing.duration:30}"></div>
      <div class="field" style="display:flex;align-items:center;gap:10px;">
        <input id="m-promo" type="checkbox" style="width:auto;" ${existing&&existing.promoOnly?'checked':''}>
        <label style="margin:0;">Disponível apenas às quartas-feiras</label>
      </div>
      <div class="row">
        <button class="btn btn-outline sm" id="m-cancel">Cancelar</button>
        <button class="btn btn-primary sm" id="m-save">Salvar</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.querySelector('#m-cancel').onclick = ()=> overlay.remove();
  overlay.querySelector('#m-save').onclick = async ()=>{
    const name = overlay.querySelector('#m-name').value.trim();
    const description = overlay.querySelector('#m-desc').value.trim();
    const price = parseFloat(overlay.querySelector('#m-price').value)||0;
    const duration = parseInt(overlay.querySelector('#m-dur').value)||30;
    const promoOnly = overlay.querySelector('#m-promo').checked;
    if(!name){ return; }
    if(existing){
      Object.assign(existing, {name,description,price,duration,promoOnly});
    }else{
      state.services.push({id:uid(), name, description, price, duration, promoOnly, active:true});
    }
    await saveServices();
    overlay.remove();
    render();
  };
}

async function toggleFullDayBlock(iso){
  let b = state.blocked.find(x=>x.date===iso);
  if(!b){ b = {date:iso, fullDay:true, times:[]}; state.blocked.push(b); }
  else{ b.fullDay = !b.fullDay; }
  await saveBlocked();
  render();
}

async function toggleSlotBlock(iso, time){
  let b = state.blocked.find(x=>x.date===iso);
  if(!b){ b = {date:iso, fullDay:false, times:[]}; state.blocked.push(b); }
  const idx = b.times.indexOf(time);
  if(idx>=0) b.times.splice(idx,1); else b.times.push(time);
  await saveBlocked();
  render();
}

/* ---------------- init ---------------- */
loadAll();
