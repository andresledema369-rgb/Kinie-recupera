(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Reveals al entrar en viewport — mismo patrón que js/main.js */
  var revealEls = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* Header sólido al scrollear, parallax del hero y FAB de reserva */
  var bar = document.getElementById('evBar');
  var heroImg = document.getElementById('evHeroImg');
  var fab = document.getElementById('evFab');
  var form = document.getElementById('reservar');
  var ticking = false;

  function handleScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      var y = window.scrollY || 0;

      if (bar) bar.classList.toggle('ev-bar--solid', y > 40);

      /* Sin parallax en móvil: ahí la foto arranca en top:0 y desplazarla
         destaparía el borde superior. */
      if (heroImg && !reduceMotion && window.innerWidth > 640 && y < window.innerHeight * 1.2) {
        heroImg.style.transform = 'translateY(' + (y * 0.16).toFixed(1) + 'px)';
      }

      if (fab && form) {
        var rect = form.getBoundingClientRect();
        fab.classList.toggle('is-visible', y > 520 && rect.top > window.innerHeight * 0.9);
      }

      ticking = false;
    });
  }
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  /* Formulario de reserva */
  var formEl = document.getElementById('evForm');
  var formPanel = document.getElementById('evFormPanel');
  var successPanel = document.getElementById('evSuccess');
  var successName = document.getElementById('evSuccessName');
  var formError = document.getElementById('evFormError');
  var failPanel = document.getElementById('evFormFail');
  var failWhatsapp = document.getElementById('evFailWhatsapp');
  if (!formEl) return;

  var REQUIRED = ['nombre', 'telefono'];
  var WHATSAPP = 'https://wa.me/5493515550182';
  var SERVICIO = 'Evaluación inicial';

  /* La anon key es pública por diseño: la tabla "leads" tiene RLS con una
     política que solo habilita INSERT al rol anon, así que desde el frontend
     no se puede leer nada. */
  var SUPABASE_URL = 'https://ocdtgrwnofpgijgumijg.supabase.co';
  var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jZHRncndub2ZwZ2lqZ3VtaWpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5MjU5NTQsImV4cCI6MjEwMzUwMTk1NH0.sIqL6PQKI-n3Yl3tTeMxWHl0ixDXcu1lmDHSr2B6yik';

  var db = (window.supabase && window.supabase.createClient)
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;
  if (!db) {
    console.error('[Recupera] No se pudo inicializar Supabase: el cliente del CDN no está disponible.');
  }

  function setFieldError(name, invalid) {
    var field = formEl.elements[name];
    var message = document.getElementById('evError-' + name);
    if (field) field.setAttribute('aria-invalid', invalid ? 'true' : 'false');
    if (message) message.hidden = !invalid;
  }

  REQUIRED.forEach(function (name) {
    var field = formEl.elements[name];
    if (field) {
      field.addEventListener('input', function () {
        if (field.value.trim()) setFieldError(name, false);
      });
    }
  });

  var submitBtn = formEl.querySelector('button[type="submit"]');
  var submitMarkup = submitBtn ? submitBtn.innerHTML : '';
  var sending = false;

  function setSending(on) {
    sending = on;
    if (!submitBtn) return;
    submitBtn.disabled = on;
    submitBtn.setAttribute('aria-busy', on ? 'true' : 'false');
    if (on) submitBtn.textContent = 'Enviando…';
    else submitBtn.innerHTML = submitMarkup;
  }

  /* supabase-js no rechaza la promesa ante un error de la API: devuelve
     { data, error }. Hay que mirar `error` explícitamente, si no un INSERT
     rechazado por RLS pasaría por exitoso. */
  function guardarLead(data) {
    if (!db) return Promise.reject(new Error('Cliente de Supabase no disponible'));
    return db.from('leads').insert([data]).then(function (res) {
      if (res.error) throw res.error;
      return res;
    });
  }

  function mostrarExito(data) {
    if (successName) successName.textContent = data.nombre.split(' ')[0];
    if (formPanel) formPanel.hidden = true;
    if (successPanel) {
      successPanel.hidden = false;
      successPanel.focus();
    }
  }

  /* Si el lead no se pudo guardar, el formulario queda como está y se ofrece
     WhatsApp con el mensaje ya redactado: es la vía de recuperación, no un
     simple aviso de error. */
  function mostrarFallo(data) {
    if (failWhatsapp) {
      var texto = 'Hola Recupera, quiero reservar una ' + SERVICIO.toLowerCase() + '.'
        + '\nNombre: ' + data.nombre
        + '\nTeléfono: ' + data.telefono
        + (data.email ? '\nEmail: ' + data.email : '')
        + (data.mensaje ? '\nMotivo: ' + data.mensaje : '');
      failWhatsapp.href = WHATSAPP + '?text=' + encodeURIComponent(texto);
    }
    if (failPanel) {
      failPanel.hidden = false;
      failPanel.focus();
    }
  }

  formEl.addEventListener('submit', function (event) {
    event.preventDefault();
    if (sending) return;

    /* La tabla `leads` tiene solo: id, nombre, telefono, email, mensaje.
       No existe la columna `servicio`, y PostgREST rechaza el INSERT entero
       (PGRST204) si se le manda una columna que no está en el esquema, así que
       no se envía. Para registrarla, en Supabase:
         alter table leads add column servicio text;
       y agregar `servicio: SERVICIO` a este objeto. */
    var data = {
      nombre: (formEl.elements.nombre.value || '').trim(),
      telefono: (formEl.elements.telefono.value || '').trim(),
      email: (formEl.elements.email.value || '').trim(),
      mensaje: (formEl.elements.mensaje.value || '').trim()
    };

    var invalid = REQUIRED.filter(function (name) { return !data[name]; });
    REQUIRED.forEach(function (name) { setFieldError(name, invalid.indexOf(name) !== -1); });
    if (formError) formError.hidden = invalid.length === 0;

    if (invalid.length) {
      var first = formEl.elements[invalid[0]];
      if (first) first.focus();
      return;
    }

    if (failPanel) failPanel.hidden = true;
    setSending(true);

    guardarLead(data)
      .then(function () {
        mostrarExito(data);
      })
      .catch(function (err) {
        console.error('[Recupera] No se pudo guardar el lead en Supabase:', err);
        mostrarFallo(data);
      })
      .then(function () {
        setSending(false);
      });
  });
})();
