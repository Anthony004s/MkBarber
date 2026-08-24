const state = {
  route: 'home',
  routeParams: {},
  session: null,        // {email,name,role}
  services: [],
  appointments: [],
  blocked: [],           // [{date:'YYYY-MM-DD', fullDay:bool, times:[]}]
  booking: {},            // in-progress booking selections
  loading: true,
  authError: '',
  adminTab: 'dashboard',
  accountTab: 'upcoming',
  toast: null,
};
