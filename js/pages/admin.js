/* ================= ADMIN ================= */
function Page_Admin(){
  if(!state.session || state.session.role!=='admin'){ return redirect('home'); }
  const tab = state.adminTab;
  return `
  <div class="container">
    <div class="dash-layout">
      <div class="side">
        <div class="side-item ${tab==='dashboard'?'active':''}" data-action="admin-tab" data-tab="dashboard">📊 Painel</div>
        <div class="side-item ${tab==='appointments'?'active':''}" data-action="admin-tab" data-tab="appointments">📋 Agendamentos</div>
        <div class="side-item ${tab==='services'?'active':''}" data-action="admin-tab" data-tab="services">✂️ Serviços</div>
        <div class="side-item ${tab==='schedule'?'active':''}" data-action="admin-tab" data-tab="schedule">🔒 Horários bloqueados</div>
      </div>
      <div>${
        tab==='dashboard' ? Admin_Dashboard() :
        tab==='appointments' ? Admin_Appointments() :
        tab==='services' ? Admin_Services() :
        Admin_Schedule()
      }</div>
    </div>
  </div>`;
}

function Admin_Dashboard(){
  const today = todayISO();
  const todays = state.appointments.filter(a=>a.date===today && a.status!=='Cancelado').sort((a,b)=>a.time.localeCompare(b.time));
  const now = new Date();
  const next = todays.find(a => new Date(today+'T'+a.time) >= now);
  const revenueToday = todays.reduce((sum,a)=>sum+Number(a.price),0);
  const countByService = {};
  state.appointments.filter(a=>a.status!=='Cancelado').forEach(a=>{ countByService[a.serviceName]=(countByService[a.serviceName]||0)+1; });
  const topService = Object.entries(countByService).sort((a,b)=>b[1]-a[1])[0];

  return `
  <h2 style="font-size:24px;color:var(--navy);margin-bottom:16px;">Painel administrativo</h2>
  <div class="stat-cards">
    <div class="stat-card"><div class="num">${todays.length}</div><div class="lbl">Agendamentos hoje</div></div>
    <div class="stat-card accent"><div class="num">${next?next.time:'—'}</div><div class="lbl">Próximo cliente${next?': '+next.clientName:''}</div></div>
    <div class="stat-card"><div class="num">${fmtBRL(revenueToday)}</div><div class="lbl">Faturamento estimado hoje</div></div>
    <div class="stat-card"><div class="num" style="font-size:16px;">${topService?topService[0]:'—'}</div><div class="lbl">Serviço mais escolhido</div></div>
  </div>
  <h3 style="font-size:16px;color:var(--navy);margin-bottom:10px;">Agendamentos de hoje</h3>
  ${todays.length===0 ? `<div class="empty-state card"><div class="ic">📭</div>Nenhum agendamento para hoje.</div>` : `
  <table class="data">
    <thead><tr><th>Horário</th><th>Cliente</th><th>Serviço</th><th>Status</th></tr></thead>
    <tbody>
      ${todays.map(a=>`<tr><td>${a.time}</td><td>${a.clientName}</td><td>${a.serviceName}</td><td><span class="status-pill ${a.status.toLowerCase()}">${a.status}</span></td></tr>`).join('')}
    </tbody>
  </table>`}
  `;
}

function Admin_Appointments(){
  const all = [...state.appointments].sort((a,b)=> (b.date+b.time).localeCompare(a.date+a.time));
  return `
  <h2 style="font-size:24px;color:var(--navy);margin-bottom:16px;">Todos os agendamentos</h2>
  ${all.length===0 ? `<div class="empty-state card"><div class="ic">📭</div>Nenhum agendamento ainda.</div>` : `
  <table class="data">
    <thead><tr><th>Data</th><th>Horário</th><th>Cliente</th><th>Serviço</th><th>Valor</th><th>Status</th></tr></thead>
    <tbody>
      ${all.map(a=>{
        const d = new Date(a.date+'T12:00:00');
        return `<tr><td>${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}</td><td>${a.time}</td><td>${a.clientName}</td><td>${a.serviceName}</td><td>${fmtBRL(a.price)}</td><td><span class="status-pill ${a.status.toLowerCase()}">${a.status}</span></td></tr>`;
      }).join('')}
    </tbody>
  </table>`}
  `;
}

function Admin_Services(){
  return `
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
    <h2 style="font-size:24px;color:var(--navy);">Gerenciar serviços</h2>
    <button class="btn btn-primary sm" data-action="new-service">+ Novo serviço</button>
  </div>
  <div class="grid" style="grid-template-columns:1fr;">
    ${state.services.map(s=>`
      <div class="card">
        <div class="service-top">
          <div>
            <div class="service-name">${s.name} ${s.promoOnly?'<span class="badge red">Só quartas</span>':''}</div>
            <div class="service-desc" style="max-width:520px;">${s.description}</div>
            <div class="service-meta"><span>⏱ ${s.duration} min</span><span>${fmtBRL(s.price)}</span></div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:10px;">
            <div class="toggle ${s.active?'on':''}" data-action="toggle-service" data-id="${s.id}"><div class="dot"></div></div>
            <div style="display:flex;gap:8px;">
              <button class="btn btn-outline sm" data-action="edit-service" data-id="${s.id}">Editar</button>
              <button class="btn btn-outline sm" data-action="delete-service" data-id="${s.id}">Excluir</button>
            </div>
          </div>
        </div>
      </div>
    `).join('')}
  </div>
  `;
}

function Admin_Schedule(){
  const days = nextDays(21);
  const sel = state.adminScheduleDate || todayISO();
  const slots = ALL_SLOTS;
  const blockedT = blockedTimesFor(sel);
  const taken = takenTimesFor(sel);
  const fullyBlocked = isDateFullyBlocked(sel);
  return `
  <h2 style="font-size:24px;color:var(--navy);margin-bottom:16px;">Bloquear horários</h2>
  <div class="date-scroller">
    ${days.map(d=>{
      const iso = fmtDateISO(d);
      const selected = sel===iso;
      return `<div class="date-pill ${selected?'selected':''}" data-action="admin-pick-date" data-iso="${iso}">
        <div class="dow">${DAY_NAMES[d.getDay()]}</div><div class="dnum">${d.getDate()}</div><div class="mon">${MONTH_NAMES[d.getMonth()]}</div>
      </div>`;
    }).join('')}
  </div>
  <div class="card" style="margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;">
    <div><b>Bloquear o dia inteiro</b><div style="color:var(--muted);font-size:13px;">Nenhum horário ficará disponível nesta data.</div></div>
    <div class="toggle ${fullyBlocked?'on':''}" data-action="toggle-fullday" data-iso="${sel}"><div class="dot"></div></div>
  </div>
  <div class="time-grid">
    ${slots.map(t=>{
      const isTaken = taken.includes(t);
      const isBlocked = blockedT.includes(t);
      const cls = isTaken ? 'taken' : (isBlocked ? 'selected' : '');
      return `<div class="time-slot ${cls}" ${isTaken?'':`data-action="toggle-slot-block" data-iso="${sel}" data-time="${t}"`}>${t}${isTaken?' 🔒':''}</div>`;
    }).join('')}
  </div>
  <p style="color:var(--muted);font-size:12.5px;margin-top:10px;">Vermelho = bloqueado pelo admin · Cinza riscado = já reservado por cliente. Clique num horário livre para bloquear/desbloquear.</p>
  `;
}

