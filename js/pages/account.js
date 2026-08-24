/* ================= ACCOUNT (client) ================= */
function Page_Account(){
  if(!state.session) return redirect('login');
  const s = state.session;
  const mine = state.appointments.filter(a=>a.clientEmail===s.email).sort((a,b)=> (a.date+a.time).localeCompare(b.date+b.time));
  const now = new Date();
  const upcoming = mine.filter(a => a.status!=='Cancelado' && new Date(a.date+'T'+a.time) >= now);
  const history = mine.filter(a => a.status==='Cancelado' || new Date(a.date+'T'+a.time) < now);
  const list = state.accountTab==='upcoming' ? upcoming : history;

  return `
  <div class="container">
    <div class="dash-layout">
      <div class="side">
        <div class="side-item ${state.accountTab==='upcoming'?'active':''}" data-action="account-tab" data-tab="upcoming">📅 Próximos agendamentos</div>
        <div class="side-item ${state.accountTab==='history'?'active':''}" data-action="account-tab" data-tab="history">🕘 Histórico</div>
        <div class="side-item ${state.accountTab==='profile'?'active':''}" data-action="account-tab" data-tab="profile">👤 Meus dados</div>
      </div>
      <div>
        <h2 style="font-size:24px;color:var(--navy);margin-bottom:16px;">Olá, ${s.name.split(' ')[0]}</h2>
        ${state.accountTab==='profile' ? `
          <div class="card">
            <div class="summary-row"><span class="lbl">Nome</span><span class="val">${s.name}</span></div>
            <div class="summary-row"><span class="lbl">E-mail</span><span class="val">${s.email}</span></div>
            <div class="summary-row"><span class="lbl">Telefone</span><span class="val">${s.phone||'-'}</span></div>
          </div>
        ` : `
          ${list.length===0 ? `
            <div class="empty-state card"><div class="ic">✂️</div>Nenhum agendamento ${state.accountTab==='upcoming'?'futuro':'no histórico'} por aqui.
              ${state.accountTab==='upcoming' ? `<div style="margin-top:14px;"><button class="btn btn-primary sm" data-action="start-booking">Agendar agora</button></div>` : ''}
            </div>
          ` : `
            <div class="appt-list">
              ${list.map(a=>{
                const d = new Date(a.date+'T12:00:00');
                return `
                <div class="appt-item">
                  <div class="appt-left">
                    <div class="svc">${a.serviceName}</div>
                    <div class="meta">${DAY_NAMES[d.getDay()]}, ${d.getDate()}/${d.getMonth()+1} às ${a.time} · ${fmtBRL(a.price)}</div>
                  </div>
                  <div style="display:flex;align-items:center;gap:10px;">
                    <span class="status-pill ${a.status.toLowerCase()}">${a.status}</span>
                    ${state.accountTab==='upcoming' && a.status!=='Cancelado' ? `<button class="btn btn-outline sm" data-action="cancel-appt" data-id="${a.id}">Cancelar</button>` : ''}
                  </div>
                </div>`;
              }).join('')}
            </div>
          `}
        `}
      </div>
    </div>
  </div>`;
}

