/*
 * Art grid + lightbox. To add a piece: put the image in /art/images/ and add
 * { src, alt, caption } to ART_MANIFEST in art/manifest.js.
 */
(function () {
  const grid = document.getElementById("art-grid");
  const lightbox = document.getElementById("lightbox");
  if (!grid || !lightbox) return;

  const items = window.ART_MANIFEST || [];

  if (items.length === 0) {
    grid.outerHTML = '<p class="empty-note">No pieces yet — add images to /art/images/ and list them in art/manifest.js.</p>';
    return;
  }

  grid.innerHTML = items
    .map(
      (item, i) => `
        <button class="art-item" data-index="${i}" aria-label="Open: ${SiteContent.escapeHtml(item.caption || item.alt || "")}">
          <img src="${item.src}" alt="${SiteContent.escapeHtml(item.alt || "")}" loading="lazy">
        </button>`
    )
    .join("");

  const lightboxImg = lightbox.querySelector("img");
  const lightboxCaption = lightbox.querySelector("figcaption");
  const closeBtn = lightbox.querySelector(".lightbox-close");
  const prevBtn = lightbox.querySelector(".lightbox-prev");
  const nextBtn = lightbox.querySelector(".lightbox-next");

  let current = 0;

  function show(index) {
    current = (index + items.length) % items.length;
    const item = items[current];
    lightboxImg.src = item.src;
    lightboxImg.alt = item.alt || "";
    lightboxCaption.textContent = item.caption || "";
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
  }

  function close() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    lightboxImg.src = "";
  }

  grid.addEventListener("click", (e) => {
    const btn = e.target.closest(".art-item");
    if (btn) show(Number(btn.dataset.index));
  });

  closeBtn.addEventListener("click", close);
  prevBtn.addEventListener("click", () => show(current - 1));
  nextBtn.addEventListener("click", () => show(current + 1));

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) close();
  });

  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("is-open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(current - 1);
    if (e.key === "ArrowRight") show(current + 1);
  });
})();
