/* ---------------- routing ---------------- */
function go(route, params){
  state.route = route;
  state.routeParams = params || {};
  window.scrollTo(0,0);
  render();
}

/* Used INSIDE page-render functions (e.g. Page_BookConfirm) instead of go().
   go() triggers a full nested render() + DOM write while the outer render()
   is still building its own HTML string, and the outer call then overwrites
   the inner one with blank content. redirect() just updates the route and
   recurses into renderRoute() to produce the right markup inline, with no
   extra DOM writes. */
function redirect(route, params){
  state.route = route;
  state.routeParams = params || {};
  return renderRoute();
}
/* ---------------- render dispatcher ---------------- */
function render(){
  const app = document.getElementById('app');
  if(state.loading){
    app.innerHTML = `<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;color:#6b7280;font-family:Inter">Carregando...</div>`;
    return;
  }
  app.innerHTML = Header() + `<main>` + renderRoute() + `</main>` + Footer();
  attachGlobalHandlers();
}

function renderRoute(){
  switch(state.route){
    case 'home': return Page_Home();
    case 'login': return Page_Login();
    case 'signup': return Page_Signup();
    case 'book-service': return Page_BookService();
    case 'book-date': return Page_BookDate();
    case 'book-time': return Page_BookTime();
    case 'book-confirm': return Page_BookConfirm();
    case 'book-payment': return Page_BookPayment();
    case 'book-success': return Page_BookSuccess();
    case 'account': return Page_Account();
    case 'admin': return Page_Admin();
    default: return Page_Home();
  }
}
