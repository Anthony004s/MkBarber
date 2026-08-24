const DAY_NAMES = ['DOM','SEG','TER','QUA','QUI','SEX','SÁB'];
const MONTH_NAMES = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'];

function fmtDateISO(d){ return d.toISOString().slice(0,10); }
function fmtBRL(n){ return 'R$ ' + Number(n).toFixed(2).replace('.',','); }
function todayISO(){ return fmtDateISO(new Date()); }
function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,8); }

function nextDays(count){
  const days = [];
  const start = new Date();
  start.setHours(12,0,0,0);
  for(let i=0;i<count;i++){
    const d = new Date(start);
    d.setDate(start.getDate()+i);
    days.push(d);
  }
  return days;
}

function serviceAvailableOnDate(service, iso){
  if(!service) return false;
  if(!service.promoOnly) return true;
  const d = new Date(iso+'T12:00:00');
  return d.getDay() === 3;
}
