(function () {
  var nav = document.querySelector('.nav');
  var panel = document.getElementById('mobilePanel');
  var openBtn = document.getElementById('menuOpenBtn');
  var closeBtn = document.getElementById('menuCloseBtn');

  function openMenu() {
    if (!panel) return;
    panel.classList.add('is-open');
    if (openBtn) openBtn.setAttribute('aria-expanded', 'true');
  }
  function closeMenu() {
    if (!panel) return;
    panel.classList.remove('is-open');
    if (openBtn) openBtn.setAttribute('aria-expanded', 'false');
  }
  if (openBtn) openBtn.addEventListener('click', openMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  if (panel) {
    panel.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
  }

  function handleScroll() {
    if (!nav) return;
    if (window.scrollY > 40) nav.classList.add('nav--scrolled');
    else nav.classList.remove('nav--scrolled');
  }
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  var revealEls = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
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
})();
