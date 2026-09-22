/*
 * Generic full-page reader. Used by fiction/read.html and research/read.html.
 * Reads config from data-* attributes on #reader, fetches the requested
 * slug's .md file (folder + query param name given via data attributes),
 * renders front matter into the header and the body through SiteContent.
 *
 * If a manifest global is named via data-manifest and entries carry an
 * "order" field, previous/next links are built from that ordering
 * (used by the research thread so entries stay connected).
 */
(async function () {
  const el = document.getElementById("reader");
  if (!el) return;

  const folder = el.dataset.folder;
  const param = el.dataset.param;
  const manifestName = el.dataset.manifest;

  const slug = new URLSearchParams(location.search).get(param);
  const body = document.getElementById("reader-body");
  const header = document.getElementById("reader-header");
  const coverEl = document.getElementById("reader-cover");
  const navEl = document.getElementById("reader-nav");

  if (!slug) {
    body.innerHTML = `<p class="reader-error">No ${param} specified.</p>`;
    return;
  }

  async function loadEntry(entrySlug) {
    const res = await fetch(`${entrySlug}.md`);
    if (!res.ok) throw new Error(`${entrySlug}.md not found`);
    const raw = await res.text();
    return SiteContent.parseFrontMatter(raw);
  }

  try {
    const { data, body: md } = await loadEntry(slug);

    document.title = `${data.title || slug} — Elisavetta`;

    header.innerHTML = `
      ${data.kicker ? `<div class="kicker">${SiteContent.escapeHtml(data.kicker)}</div>` : ""}
      <h1>${SiteContent.escapeHtml(data.title || slug)}</h1>
      ${data.date ? `<div class="reader-meta">${SiteContent.escapeHtml(data.date)}</div>` : ""}
    `;

    if (data.cover && coverEl) {
      coverEl.innerHTML = `<img src="${data.cover}" alt="">`;
    }

    body.innerHTML = SiteContent.renderMarkdown(md);

    // prev/next within an ordered manifest (used by the research thread)
    const manifest = manifestName && window[manifestName];
    if (manifest && manifest.length > 1 && navEl) {
      const withOrder = await Promise.all(
        manifest.map(async (s) => {
          try {
            const { data: d } = await loadEntry(s);
            return { slug: s, order: Number(d.order) || 0, title: d.title || s };
          } catch {
            return null;
          }
        })
      );
      const ordered = withOrder.filter(Boolean).sort((a, b) => a.order - b.order);
      const idx = ordered.findIndex((e) => e.slug === slug);

      const prev = idx > 0 ? ordered[idx - 1] : null;
      const next = idx >= 0 && idx < ordered.length - 1 ? ordered[idx + 1] : null;

      navEl.innerHTML = `
        ${
          prev
            ? `<a class="prev" href="read.html?${param}=${encodeURIComponent(prev.slug)}">
                <span class="label">&larr; Previous</span>${SiteContent.escapeHtml(prev.title)}
              </a>`
            : "<span></span>"
        }
        ${
          next
            ? `<a class="next" href="read.html?${param}=${encodeURIComponent(next.slug)}">
                <span class="label">Next &rarr;</span>${SiteContent.escapeHtml(next.title)}
              </a>`
            : ""
        }
      `;
    }
  } catch (err) {
    console.error(err);
    body.innerHTML = `<p class="reader-error">Couldn't load this piece. If you're browsing the files directly, run a local static server (see README) — fetching content requires http:// not file://.</p>`;
  }
})();
