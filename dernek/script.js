// Yalnızca ilerleyici iyileştirme: JS kapalıyken sayfa eksiksiz.
(function () {
  if (!('IntersectionObserver' in window)) return;
  document.documentElement.classList.add('js');

  // Menü: okunan bölümü işaretle.
  var links = {};
  document.querySelectorAll('.nav a').forEach(function (a) { links[a.hash.slice(1)] = a; });
  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      var a = links[e.target.id];
      if (!a) return;
      if (e.isIntersecting) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  }, { rootMargin: '-45% 0px -54% 0px' });
  Object.keys(links).forEach(function (id) { var s = document.getElementById(id); if (s) spy.observe(s); });
})();
