/* Site-wide nav behavior: mobile toggle, smooth in-page scrolling, active link. */
(function () {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // mark current page in nav
  const here = location.pathname.replace(/\/index\.html$/, "/");
  document.querySelectorAll(".site-nav a").forEach((link) => {
    const linkPath = new URL(link.href, location.href).pathname.replace(/\/index\.html$/, "/");
    if (linkPath === here) {
      link.setAttribute("aria-current", "page");
    }
  });

  // smooth scroll for same-page anchors
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href").slice(1);
      const target = id && document.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });
})();
