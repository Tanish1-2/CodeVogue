// User UI helpers: populate avatar, settings, profile, and simple page features
(function(){
  function initials(name){
    if (!name) return '??';
    return name.split(' ').map(s=>s[0]||'').slice(0,2).join('').toUpperCase();
  }

  function populateUI(){
    if (typeof AuthSystem === 'undefined') return;
    const user = AuthSystem.getCurrentUser();
    if (!user) return;

    // Avatar
    document.querySelectorAll('.avatar').forEach(a=>{ try{ a.textContent = initials(user.displayName); }catch(e){} });

    // Settings: populate inputs by name attribute if present
    try{
      const displayInput = document.querySelector('input[value="Kael Xander"]') || document.querySelector('input[placeholder="Kael Xander"]');
      // better: select by known labels
      document.querySelectorAll('input').forEach(inp=>{
        if (inp.previousElementSibling && inp.previousElementSibling.tagName === 'LABEL'){
          const lbl = inp.previousElementSibling.textContent.trim().toLowerCase();
          if (lbl.includes('display')) inp.value = user.displayName || inp.value;
          if (lbl.includes('email')) inp.value = user.email || inp.value;
        }
      });
    }catch(e){}

    // Profile page: try to set fields
    try{
      const nameField = document.querySelector('input[name="displayName"]') || document.querySelector('input[placeholder="Kael Xander"]');
      if (nameField) nameField.value = user.displayName || nameField.value;
    }catch(e){}
  }

  // Expose for manual invocation
  window.UserUI = { populateUI };

  // Run on DOM ready
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', populateUI); else populateUI();
})();
