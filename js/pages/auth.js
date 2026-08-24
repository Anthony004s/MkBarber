/* ================= AUTH ================= */
function Page_Login(){
  return `
  <div class="auth-wrap"><div class="container narrow">
    <div class="auth-card">
      <h2>Entrar</h2>
      <div class="sub">Acesse sua conta para agendar e ver seus horários.</div>
      ${state.authError ? `<div class="error-box">${state.authError}</div>` : ''}
      <form id="login-form">
        <div class="field"><label>E-mail</label><input type="email" name="email" required placeholder="voce@email.com"></div>
        <div class="field"><label>Senha</label><input type="password" name="password" required placeholder="••••••••"></div>
        <button class="btn btn-primary btn-block" type="submit">Entrar</button>
      </form>
      <div class="switch-line">Não tem conta? <b data-nav="signup">Cadastre-se</b></div>
      <div class="switch-line" style="margin-top:6px;font-size:12px;">Demo admin: admin@mkbarbershop.com / admin123</div>
    </div>
  </div></div>`;
}

function Page_Signup(){
  return `
  <div class="auth-wrap"><div class="container narrow">
    <div class="auth-card">
      <h2>Criar conta</h2>
      <div class="sub">Cadastre-se para agendar seus horários na MK Barbershop.</div>
      ${state.authError ? `<div class="error-box">${state.authError}</div>` : ''}
      <form id="signup-form">
        <div class="field"><label>Nome completo</label><input type="text" name="name" required placeholder="Seu nome"></div>
        <div class="field"><label>E-mail</label><input type="email" name="email" required placeholder="voce@email.com"></div>
        <div class="field"><label>Telefone</label><input type="tel" name="phone" required placeholder="(11) 90000-0000"></div>
        <div class="field"><label>Senha</label><input type="password" name="password" required placeholder="Mínimo 4 caracteres"></div>
        <button class="btn btn-primary btn-block" type="submit">Criar conta</button>
      </form>
      <div class="switch-line">Já tem conta? <b data-nav="login">Entrar</b></div>
    </div>
  </div></div>`;
}
