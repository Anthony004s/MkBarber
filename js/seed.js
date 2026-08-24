/* ---------------- seed & load ---------------- */
async function seedIfNeeded(){
  let services = await storeGet('services:list', true);
  if(!services){
    services = [
      {id:uid(), name:'Corte de Cabelo', description:'Corte tradicional com acabamento na navalha.', price:40, duration:30, active:true, promoOnly:false},
      {id:uid(), name:'Sobrancelha', description:'Sobrancelha feita com cuidado e maestria.', price:15, duration:5, active:true, promoOnly:false},
      {id:uid(), name:'Barba', description:'Barba modelada com toalha quente e navalha.', price:30, duration:20, active:true, promoOnly:false},
      {id:uid(), name:'Barba + Cabelo', description:'Combo completo: corte e barba na régua.', price:65, duration:50, active:true, promoOnly:false},
      {id:uid(), name:'Corte Promocional', description:'Corte especial com preço promocional — disponível somente às quartas-feiras.', price:35, duration:30, active:true, promoOnly:true},
    ];
    await storeSet('services:list', services, true);
  }
  let appointments = await storeGet('appointments:list', true);
  if(!appointments){ appointments = []; await storeSet('appointments:list', appointments, true); }
  let blocked = await storeGet('blocked:list', true);
  if(!blocked){ blocked = []; await storeSet('blocked:list', blocked, true); }
  let users = await storeGet('users:list', true);
  if(!users){
    users = [{id:uid(), name:'Barbeiro Admin', email:'admin@mkbarbershop.com', phone:'(11) 90000-0000', password:'admin123', role:'admin'}];
    await storeSet('users:list', users, true);
  }
  return {services, appointments, blocked, users};
}

async function loadAll(){
  const seeded = await seedIfNeeded();
  state.services = seeded.services;
  state.appointments = seeded.appointments;
  state.blocked = seeded.blocked;
  const sess = await storeGet('session', false);
  if(sess){
    const users = await storeGet('users:list', true) || [];
    const u = users.find(x=>x.email===sess.email);
    if(u) state.session = {email:u.email, name:u.name, role:u.role, phone:u.phone};
  }
  state.loading = false;
  render();
}

async function getUsers(){ return await storeGet('users:list', true) || []; }
async function saveUsers(list){ await storeSet('users:list', list, true); }
async function saveServices(){ await storeSet('services:list', state.services, true); }
async function saveAppointments(){ await storeSet('appointments:list', state.appointments, true); }
async function saveBlocked(){ await storeSet('blocked:list', state.blocked, true); }
