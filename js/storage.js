/* ---------------- storage helpers ---------------- */
async function storeGet(key, shared){
  try{
    const r = await window.storage.get(key, shared);
    return r ? JSON.parse(r.value) : null;
  }catch(e){ return null; }
}
async function storeSet(key, val, shared){
  try{ await window.storage.set(key, JSON.stringify(val), shared); }
  catch(e){ console.error('storage set failed', key, e); }
}
