// HunterOS — shared JS
(function(){
  // Active nav link
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav a').forEach(a=>{
    if(a.getAttribute('href') === path) a.classList.add('active');
  });

  // Mobile sidebar
  const sb = document.querySelector('.sidebar');
  const scrim = document.querySelector('.scrim');
  document.querySelector('.menu-toggle')?.addEventListener('click',()=>{
    sb.classList.add('open'); scrim.classList.add('show');
  });
  scrim?.addEventListener('click',()=>{ sb.classList.remove('open'); scrim.classList.remove('show'); });

  // Toast helper
  window.toast = function(msg){
    let t = document.querySelector('.toast');
    if(!t){ t = document.createElement('div'); t.className='toast'; document.body.appendChild(t); }
    t.textContent = msg; requestAnimationFrame(()=>t.classList.add('show'));
    clearTimeout(window.__tt); window.__tt = setTimeout(()=>t.classList.remove('show'),2200);
  };

  // Mission toggles
  document.querySelectorAll('.mission').forEach(m=>{
    m.querySelector('.check')?.addEventListener('click',()=>{
      m.classList.toggle('done');
      const xp = m.dataset.xp || '25';
      window.toast(m.classList.contains('done') ? `+${xp} XP gained` : 'Mission reopened');
    });
  });

  // Animate XP bar on load
  document.querySelectorAll('.xp-fill[data-pct]').forEach(el=>{
    const pct = el.dataset.pct;
    requestAnimationFrame(()=>{ el.style.width = pct + '%'; });
  });
  document.querySelectorAll('.attr-bar > i[data-pct]').forEach(el=>{
    const pct = el.dataset.pct;
    requestAnimationFrame(()=>{ el.style.width = pct + '%'; });
  });
})();
