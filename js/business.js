/* ---------------- business rules ---------------- */
function generateSlots(){
  const slots = [];

  for(let h=9; h<=20; h++){
    slots.push(String(h).padStart(2,'0')+':00');

    if(h<20){
      slots.push(String(h).padStart(2,'0')+':30');
    }
  }

  return slots;
}

const ALL_SLOTS = generateSlots();

function isBookingLocked(){
  const now = new Date();
  const hour = now.getHours();

  // Bloqueia das 21:00 até 09:59 do dia seguinte.
  // Libera novamente às 10:00.
  return hour >= 21 || hour < 10;
}

function isDateFullyBlocked(iso){
  return state.blocked.some(b => b.date===iso && b.fullDay);
}

function blockedTimesFor(iso){
  const b = state.blocked.find(x=>x.date===iso);
  return b ? (b.times||[]) : [];
}

function takenTimesFor(iso){
  return state.appointments
    .filter(a => a.date===iso && a.status!=='Cancelado')
    .map(a => a.time);
}

function availableSlotsFor(iso, serviceDurationIgnored){
  if(isDateFullyBlocked(iso)) return [];

  const blockedT = blockedTimesFor(iso);
  const taken = takenTimesFor(iso);
  const now = new Date();
  const isToday = iso === todayISO();

  return ALL_SLOTS.map(t => {
    let disabled = blockedT.includes(t) || taken.includes(t);

    if(isToday){
      const [hh,mm] = t.split(':').map(Number);
      const slotDate = new Date();
      slotDate.setHours(hh,mm,0,0);

      if(slotDate.getTime() <= now.getTime()){
        disabled = true;
      }
    }

    return {
      time: t,
      disabled
    };
  });
}
