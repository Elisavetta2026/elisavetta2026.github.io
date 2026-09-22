/*
 * Builds the research reading path from research/manifest.js + front matter.
 * To add an entry: drop a .md file in /research/ with front matter
 * (title, hook, order) and add its filename (without .md) to
 * RESEARCH_MANIFEST in research/manifest.js. Entries render in "order".
 */
(async function () {
  const thread = document.getElementById("research-thread");
  if (!thread) return;

  const slugs = window.RESEARCH_MANIFEST || [];
  if (slugs.length === 0) {
    thread.innerHTML = '<p class="empty-note">No entries yet — drop a .md file into /research/ and list it in research/manifest.js.</p>';
    return;
  }

  const entries = await Promise.all(
    slugs.map(async (slug) => {
      try {
        const res = await fetch(`research/${slug}.md`);
        if (!res.ok) throw new Error(`${slug}.md not found`);
        const raw = await res.text();
        const { data } = SiteContent.parseFrontMatter(raw);
        return { slug, ...data };
      } catch (err) {
        console.warn("Could not load research entry:", slug, err);
        return null;
      }
    })
  );

  const valid = entries.filter(Boolean);
  valid.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

  thread.innerHTML = valid
    .map(
      (entry, i) => `
        <article class="thread-entry">
          <div class="thread-index">${String(i + 1).padStart(2, "0")}</div>
          <h2>${SiteContent.escapeHtml(entry.title || entry.slug)}</h2>
          <p class="hook">${SiteContent.escapeHtml(entry.hook || "")}</p>
          <a class="read-more" href="research/read.html?entry=${encodeURIComponent(entry.slug)}">Follow the thread &rarr;</a>
        </article>`
    )
    .join("");
})();
