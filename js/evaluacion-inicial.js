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
  if (!formEl) return;

  var REQUIRED = ['nombre', 'telefono'];

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

  formEl.addEventListener('submit', function (event) {
    event.preventDefault();

    var data = {
      nombre: (formEl.elements.nombre.value || '').trim(),
      telefono: (formEl.elements.telefono.value || '').trim(),
      email: (formEl.elements.email.value || '').trim(),
      mensaje: (formEl.elements.mensaje.value || '').trim(),
      servicio: 'Evaluación inicial'
    };

    var invalid = REQUIRED.filter(function (name) { return !data[name]; });
    REQUIRED.forEach(function (name) { setFieldError(name, invalid.indexOf(name) !== -1); });
    if (formError) formError.hidden = invalid.length === 0;

    if (invalid.length) {
      var first = formEl.elements[invalid[0]];
      if (first) first.focus();
      return;
    }

    /* TODO(Supabase): insert into "leads" (nombre, telefono, email, mensaje, servicio).
       Mientras no haya backend el lead no se persiste: el estado de éxito ofrece
       WhatsApp para que el paciente pueda contactarse igual. */

    if (successName) successName.textContent = data.nombre.split(' ')[0];
    if (formPanel) formPanel.hidden = true;
    if (successPanel) {
      successPanel.hidden = false;
      successPanel.focus();
    }
  });
})();
