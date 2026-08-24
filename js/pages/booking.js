/* ================= BOOKING FLOW ================= */


function Page_BookService(){
  const locked = isBookingLocked();
  const b = state.booking;
  return `
  <section><div class="container narrow">
    ${ProgressBar('service')}
    ${locked ? `<div class="banner-lock">⏰ Após às 21:00 não é possível iniciar novos agendamentos. Volte a partir de amanhã, a partir das 00:00.</div>` : ''}
    <div class="section-head" style="margin-bottom:18px;">
      <h2 style="font-size:24px;">Escolha o serviço</h2>
      <p>Selecione o que você deseja fazer hoje.</p>
    </div>
    <div class="grid" style="grid-template-columns:1fr;">
      ${state.services.filter(s=>s.active).map(s=>{
        const selected = b.serviceId===s.id;
        return `
        <div class="card service-card ${selected?'selected':''} ${locked?'disabled':''}" ${locked?'':`data-action="pick-service" data-id="${s.id}"`}>
          <div class="service-top">
            <div class="service-name">${s.name}</div>
            <div class="service-price">${fmtBRL(s.price)}</div>
          </div>
          <div class="service-desc">${s.description}</div>
          <div class="service-meta">
            <span>⏱ ${s.duration} min</span>
            ${s.promoOnly ? '<span class="badge red">Só quartas-feiras</span>' : ''}
          </div>
        </div>`;
      }).join('')}
    </div>
  </div></section>`;
}

function Page_BookDate(){
  if(!state.booking.serviceId) return redirect('book-service');
  const svc = state.services.find(s=>s.id===state.booking.serviceId);
  const days = nextDays(21);
  return `
  <section><div class="container narrow">
    ${ProgressBar('date')}
    <div class="section-head" style="margin-bottom:10px;">
      <h2 style="font-size:24px;">Escolha a data</h2>
      <p>Serviço selecionado: <b>${svc.name}</b>${svc.promoOnly? ' — disponível apenas às quartas-feiras.' : ''}</p>
    </div>
    <div class="date-scroller">
      ${days.map(d=>{
        const iso = fmtDateISO(d);
        const okForService = serviceAvailableOnDate(svc, iso);
        const fullyBlocked = isDateFullyBlocked(iso);
        const hasSlots = availableSlotsFor(iso).some(s=>!s.disabled);
        const disabled = !okForService || fullyBlocked || !hasSlots;
        const selected = state.booking.date===iso;
        return `<div class="date-pill ${selected?'selected':''} ${disabled?'disabled':''}" ${disabled?'':`data-action="pick-date" data-iso="${iso}"`}>
          <div class="dow">${DAY_NAMES[d.getDay()]}</div>
          <div class="dnum">${d.getDate()}</div>
          <div class="mon">${MONTH_NAMES[d.getMonth()]}</div>
        </div>`;
      }).join('')}
    </div>
    <div style="margin-top:14px;">
      <button class="btn btn-outline sm" data-nav="book-service">← Voltar</button>
    </div>
  </div></section>`;
}

function Page_BookTime(){
  if(!state.booking.date) return redirect('book-date');
  const iso = state.booking.date;
  const svc = state.services.find(s=>s.id===state.booking.serviceId);
  const slots = availableSlotsFor(iso);
  const d = new Date(iso+'T12:00:00');
  return `
  <section><div class="container narrow">
    ${ProgressBar('time')}
    <div class="section-head" style="margin-bottom:10px;">
      <h2 style="font-size:24px;">Escolha o horário</h2>
      <p>${svc.name} — ${DAY_NAMES[d.getDay()]} ${d.getDate()}/${d.getMonth()+1}</p>
    </div>
    <div class="time-grid">
      ${slots.map(s=>{
        const selected = state.booking.time===s.time;
        return `<div class="time-slot ${selected?'selected':''} ${s.disabled?'taken':''}" ${s.disabled?'':`data-action="pick-time" data-time="${s.time}"`}>${s.time}</div>`;
      }).join('')}
    </div>
    <div style="margin-top:16px;">
      <button class="btn btn-outline sm" data-nav="book-date">← Voltar</button>
    </div>
  </div></section>`;
}

function Page_BookConfirm(){
  if(!state.booking.time) return redirect('book-time');
  if(!state.session) return redirect('login');
  const svc = state.services.find(s=>s.id===state.booking.serviceId);
  const d = new Date(state.booking.date+'T12:00:00');
  const s = state.session;
  return `
  <section><div class="container narrow">
    ${ProgressBar('confirm')}
    <div class="section-head" style="margin-bottom:10px;">
      <h2 style="font-size:24px;">Confirme seus dados</h2>
      <p>Revise as informações antes de prosseguir para o pagamento.</p>
    </div>
    <div class="card">
      <div class="summary-row"><span class="lbl">Serviço</span><span class="val">${svc.name}</span></div>
      <div class="summary-row"><span class="lbl">Data</span><span class="val">${DAY_NAMES[d.getDay()]}, ${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}</span></div>
      <div class="summary-row"><span class="lbl">Horário</span><span class="val">${state.booking.time}</span></div>
      <div class="summary-row"><span class="lbl">Cliente</span><span class="val">${s.name}</span></div>
      <div class="summary-row"><span class="lbl">Telefone</span><span class="val">${s.phone||'-'}</span></div>
      <div class="summary-total"><span class="lbl">Total</span><span class="val">${fmtBRL(svc.price)}</span></div>
    </div>
    <div style="display:flex;gap:10px;margin-top:16px;">
      <button class="btn btn-outline sm" data-nav="book-time">← Voltar</button>
      <button class="btn btn-primary" style="flex:1;" data-action="go-payment">Ir para pagamento →</button>
    </div>
  </div></section>`;
}

function Page_BookPayment(){
  if(!state.booking.time || !state.session) return redirect('book-confirm');
  const svc = state.services.find(s=>s.id===state.booking.serviceId);
  const pixCode = state.booking.pixCode || (state.booking.pixCode = '00020126360014BR.GOV.BCB.PIX0114MKBARBERSHOP520400005303986540' + svc.price.toFixed(2).replace('.','') + '5802BR5913MK BARBERSHOP6009SAO PAULO62070503***6304' + Math.random().toString(16).slice(2,6).toUpperCase());
  return `
  <section><div class="container narrow">
    ${ProgressBar('payment')}
    <div class="section-head" style="margin-bottom:10px;">
      <h2 style="font-size:24px;">Pagamento via PIX</h2>
      <p>Ambiente de demonstração — nenhuma cobrança real será feita.</p>
    </div>
    <div class="pix-box">
      <div style="font-size:13px;letter-spacing:.1em;color:#9fb0e0;">VALOR A PAGAR</div>
      <div style="font-family:'Oswald';font-size:32px;margin-top:4px;">${fmtBRL(svc.price)}</div>
      <div class="pix-qr"></div>
      <div class="pix-code">${pixCode}</div>
      <button class="btn btn-ghost sm" data-action="copy-pix">Copiar código PIX</button>
    </div>
    <button class="btn btn-primary btn-block" style="margin-top:16px;" data-action="confirm-payment">Confirmar pagamento</button>
    <div style="margin-top:10px;text-align:center;">
      <button class="btn btn-outline sm" data-nav="book-confirm">← Voltar</button>
    </div>
  </div></section>`;
}

function Page_BookSuccess(){
  const a = state.booking.lastAppointment;
  if(!a) return redirect('home');
  const d = new Date(a.date+'T12:00:00');
  return `
  <section><div class="container narrow">
    <div class="card success-box">
      <div class="success-icon">✓</div>
      <h2 style="font-size:24px;color:var(--navy);">Agendamento confirmado com sucesso!</h2>
      <p style="color:var(--muted);margin-top:8px;">O barbeiro foi notificado sobre o seu horário.</p>
      <div style="text-align:left;margin-top:22px;">
        <div class="summary-row"><span class="lbl">Serviço</span><span class="val">${a.serviceName}</span></div>
        <div class="summary-row"><span class="lbl">Data</span><span class="val">${DAY_NAMES[d.getDay()]}, ${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}</span></div>
        <div class="summary-row"><span class="lbl">Horário</span><span class="val">${a.time}</span></div>
        <div class="summary-total"><span class="lbl">Total pago</span><span class="val">${fmtBRL(a.price)}</span></div>
      </div>
      <div style="display:flex;gap:10px;margin-top:22px;">
        <button class="btn btn-outline" style="flex:1;" data-nav="home">Início</button>
        <button class="btn btn-primary" style="flex:1;" data-nav="account">Meus agendamentos</button>
      </div>
    </div>
  </div></section>`;
}

