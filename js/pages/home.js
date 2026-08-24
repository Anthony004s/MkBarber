/* ================= HOME ================= */
function Page_Home(){
  const activeServices = state.services.filter(s=>s.active);
  return `
  <section class="hero">
    <div class="hero-inner">
      <div>
        <div class="eyebrow">★ BARBEARIA MODERNA &amp; URBANA</div>
        <h1>SEU PRÓXIMO <span>CORTE</span> COMEÇA AQUI</h1>
        <p class="lead">Agende seu horário na MK Barbershop em poucos toques. Escolha o serviço, o dia e o horário — sem filas, sem ligações.</p>
        <div class="hero-actions">
          <button class="btn btn-primary" data-action="start-booking">Agendar agora →</button>
          <button class="btn btn-ghost" data-nav="login">Já tenho conta</button>
        </div>
      </div>
      <div class="hero-card">
        <h3>COMO FUNCIONA</h3>
        <div class="hstep"><div class="n">1</div> Escolher serviço</div>
        <div class="hstep"><div class="n">2</div> Escolher data</div>
        <div class="hstep"><div class="n">3</div> Escolher horário</div>
        <div class="hstep"><div class="n">4</div> Confirmar dados</div>
        <div class="hstep"><div class="n">5</div> Pagar via PIX</div>
        <div class="hstep"><div class="n">6</div> Agendamento confirmado ✓</div>
      </div>
    </div>
  </section>

  <section>
    <div class="container">
      <div class="section-head">
        <div class="eyebrow">NOSSOS SERVIÇOS</div>
        <h2>Escolha o que combina com você</h2>
        <p>Preços e durações — o corte promocional é exclusivo de quarta-feira.</p>
      </div>
      <div class="grid cols-3">
        ${activeServices.map(s=>`
          <div class="card">
            <div class="service-top">
              <div class="service-name">${s.name}</div>
              <div class="service-price">${fmtBRL(s.price)}</div>
            </div>
            <div class="service-desc">${s.description}</div>
            <div class="service-meta">
              <span>⏱ ${s.duration} min</span>
              ${s.promoOnly ? '<span class="badge red">Só quartas-feiras</span>' : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>

  <section style="background:var(--white);">
    <div class="container">
      <div class="grid cols-2" style="align-items:center;">
        <div>
          <div class="section-head" style="margin-bottom:16px;">
            <div class="eyebrow">FUNCIONAMENTO</div>
            <h2>Horário de atendimento</h2>
          </div>
          <div class="card">
            ${DAY_NAMES.map(d=>`<div class="hours-row"><span>${d==='DOM'?'Domingo':d==='SEG'?'Segunda':d==='TER'?'Terça':d==='QUA'?'Quarta':d==='QUI'?'Quinta':d==='SEX'?'Sexta':'Sábado'}</span><span><b>09:00 – 20:00</b></span></div>`).join('')}
          </div>
        </div>
        <div>
          <div class="section-head" style="margin-bottom:16px;">
            <div class="eyebrow">PASSO A PASSO</div>
            <h2>Agendamento rápido</h2>
          </div>
          <div class="steps-strip">
            ${['Serviço','Data','Horário','Dados','Pix','Pronto'].map((l,i)=>`<div class="step-item"><div class="num">${String(i+1).padStart(2,'0')}</div><div class="lbl">${l}</div></div>`).join('')}
          </div>
        </div>
      </div>
    </div>
  </section>

  <section>
    <div class="container" style="text-align:center;">
      <h2 style="font-size:26px;color:var(--navy);">Pronto para marcar seu horário?</h2>
      <p style="color:var(--muted);margin-top:8px;">Leva menos de um minuto.</p>
      <button class="btn btn-primary" style="margin-top:18px;" data-action="start-booking">Agendar agora →</button>
    </div>
  </section>
  `;
}
