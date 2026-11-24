/* Bild · comportamiento del sitio */
document.documentElement.classList.add('js');

/* aparición suave al hacer scroll */
(function(){
  var els = document.querySelectorAll('.reveal');
  if(!('IntersectionObserver' in window)) return;
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.remove('pre'); io.unobserve(e.target); } });
  },{rootMargin:'0px 0px -8% 0px'});
  els.forEach(function(el){
    var r = el.getBoundingClientRect();
    if(r.top > window.innerHeight * .92){ el.classList.add('pre'); io.observe(el); }
  });
})();

/* cerrar el menú móvil al elegir una opción */
document.querySelectorAll('.menu .panel a').forEach(function(a){
  a.addEventListener('click', function(){ var d = a.closest('details'); if(d) d.removeAttribute('open'); });
});

/* FORMULARIOS · Web3Forms (envío al correo de Bild) con protección anti-spam */
document.querySelectorAll('form.lead').forEach(function(form){
  var t = Date.now();
  var ts = form.querySelector('input[name="_t"]'), js = form.querySelector('input[name="_js"]');
  if(ts) ts.value = t;
  var human = function(){ if(js) js.value = 'bild-' + t; };
  ['focusin','keydown','pointerdown','touchstart'].forEach(function(ev){ form.addEventListener(ev, human, {once:true, passive:true}); });

  form.addEventListener('submit', function(ev){
    ev.preventDefault();
    if(!form.checkValidity()){ form.reportValidity(); return; }
    human();
    var btn = form.querySelector('button[type="submit"]');
    var label = btn ? btn.innerHTML : '';
    var err = form.querySelector('.err');
    if(!err){ err = document.createElement('p'); err.className = 'err'; err.setAttribute('role','alert'); if(btn) btn.insertAdjacentElement('afterend', err); }
    err.textContent = '';
    var done = function(){
      form.classList.add('sent');
      if(btn){ btn.disabled = true; btn.textContent = 'Recibido'; }
      var ok = form.querySelector('.ok'); if(ok){ ok.setAttribute('tabindex','-1'); ok.focus(); }
    };
    var fail = function(msg){
      if(btn){ btn.disabled = false; btn.innerHTML = label; }
      err.textContent = msg || 'No pudimos enviar sus datos. Intente de nuevo o escríbanos por WhatsApp.';
    };
    var endpoint = form.getAttribute('data-endpoint');
    /* fuera de bild.one (vista previa) el formulario solo muestra la confirmación */
    if(!endpoint || !/(^|\.)(bild\.one|github\.io)$/.test(location.hostname)){ done(); return; }
    if(btn){ btn.disabled = true; btn.textContent = 'Enviando…'; }
    /* filtros anti-robot en el navegador: tiempo mínimo y verificación de interacción */
    var fd = new FormData(form);
    if(fd.get('website') || fd.get('_js') !== 'bild-' + t || Date.now() - t < 4000){ done(); return; }
    var body = new URLSearchParams(); fd.forEach(function(v,k){ if(k !== '_t' && k !== '_js' && k !== 'website') body.append(k, v); });
    body.append('botcheck', '');
    body.delete('redirect');
    fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded','Accept':'application/json'},body:body.toString()})
      .then(function(r){ return r.json().catch(function(){ return {success:false}; }); })
      .then(function(j){ j && j.success ? done() : fail(); })
      .catch(function(){ fail(); });
  });
});
