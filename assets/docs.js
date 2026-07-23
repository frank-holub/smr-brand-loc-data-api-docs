// Progressive enhancement for the docs wiki. The sidebar drawer works without
// JS (a CSS-only checkbox toggle); this only adds nicety: close the drawer when
// a section is chosen or Escape is pressed, and track the active section.
(function () {
  "use strict";

  var toggle = document.getElementById("nav-toggle");
  var links = Array.prototype.slice.call(document.querySelectorAll('.toc a[href^="#"]'));

  function closeDrawer() { if (toggle) { toggle.checked = false; } }

  links.forEach(function (a) {
    a.addEventListener("click", closeDrawer);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { closeDrawer(); }
  });

  // Scrollspy: mark the nav link whose section is currently at the top.
  var byId = {};
  var order = [];
  links.forEach(function (a) {
    var id = a.getAttribute("href").slice(1);
    var section = document.getElementById(id);
    if (section) { byId[id] = a; order.push(id); }
  });

  if (!order.length || !("IntersectionObserver" in window)) { return; }

  var visible = {};
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      visible[entry.target.id] = entry.isIntersecting;
    });
    var current = null;
    for (var i = 0; i < order.length; i++) {
      if (visible[order[i]]) { current = order[i]; break; }
    }
    order.forEach(function (id) {
      byId[id].classList.toggle("is-active", id === current);
    });
  }, { rootMargin: "-72px 0px -68% 0px", threshold: 0 });

  order.forEach(function (id) { observer.observe(document.getElementById(id)); });
})();
