/* ---------------- shared components ---------------- */
function Header(){
  const s = state.session;
  return `
  <header class="site">
    <div class="header-inner">
      <div class="brand" data-nav="home">
        <div class="logo-mark">${LOGO_SVG}</div>
        <div>
          <div class="brand-name">MK BARBERSHOP</div>
          <div class="brand-sub">CORTES &amp; ESTILO</div>
        </div>
      </div>
      <nav class="top">
        ${s ? `
          ${s.role==='admin' ? `<button class="nav-btn" data-nav="admin"><span class="nav-label">Painel</span></button>` : `<button class="nav-btn" data-nav="account"><span class="nav-label">Minha Conta</span></button>`}
          <button class="nav-btn" data-action="logout"><span class="nav-label">Sair</span></button>
        ` : `
          <button class="nav-btn" data-nav="login"><span class="nav-label">Entrar</span></button>
        `}
        <button class="nav-btn cta" data-action="start-booking">Agendar agora</button>
      </nav>
    </div>
    <div class="stripes thin"></div>
  </header>`;
}

function Footer(){
  return `
  <div class="stripes"></div>
  <footer>
    <div class="footer-inner">
      <div>© ${new Date().getFullYear()} MK Barbershop — Todos os direitos reservados.</div>
      <div>Seg–Dom · 09:00 às 20:00</div>
    </div>
  </footer>`;
}

function ProgressBar(current){
  const items = [
    {k:'service', l:'Serviço'},
    {k:'date', l:'Data'},
    {k:'time', l:'Horário'},
    {k:'confirm', l:'Confirmar'},
    {k:'payment', l:'Pagamento'},
  ];
  const idx = items.findIndex(i=>i.k===current);
  return `<div class="progress">${items.map((it,i)=>{
    const cls = i<idx ? 'done' : (i===idx ? 'active' : '');
    return `<div class="pnode ${cls}">${i<idx?'✓ ':''}${i+1}. ${it.l}</div>` + (i<items.length-1?'<div class="sep"></div>':'');
  }).join('')}</div>`;
}
