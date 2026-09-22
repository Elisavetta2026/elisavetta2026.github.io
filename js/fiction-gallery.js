/*
 * Builds the fiction gallery from fiction/manifest.js + front matter in each
 * story's .md file. To add a story: drop a .md file in /fiction/ with a
 * front-matter block (title, teaser, cover, featured, date) and add its
 * filename (without .md) to FICTION_MANIFEST in fiction/manifest.js.
 */
(async function () {
  const grid = document.getElementById("fiction-grid");
  if (!grid) return;

  const slugs = window.FICTION_MANIFEST || [];
  if (slugs.length === 0) {
    grid.outerHTML = '<p class="empty-note">No stories yet — drop a .md file into /fiction/ and list it in fiction/manifest.js.</p>';
    return;
  }

  const stories = await Promise.all(
    slugs.map(async (slug) => {
      try {
        const res = await fetch(`fiction/${slug}.md`);
        if (!res.ok) throw new Error(`${slug}.md not found`);
        const raw = await res.text();
        const { data } = SiteContent.parseFrontMatter(raw);
        return { slug, ...data };
      } catch (err) {
        console.warn("Could not load story:", slug, err);
        return null;
      }
    })
  );

  const valid = stories.filter(Boolean);

  // featured piece first, then by date descending (missing dates sink to the end)
  valid.sort((a, b) => {
    const af = a.featured === "true" ? 1 : 0;
    const bf = b.featured === "true" ? 1 : 0;
    if (af !== bf) return bf - af;
    return (b.date || "").localeCompare(a.date || "");
  });

  grid.innerHTML = valid
    .map((story) => {
      const featuredClass = story.featured === "true" ? " featured" : "";
      const cover = story.cover
        ? `<div class="card-cover"><img src="${story.cover}" alt="" loading="lazy"></div>`
        : "";
      return `
        <a class="card${featuredClass}" href="fiction/read.html?story=${encodeURIComponent(story.slug)}">
          ${cover}
          <div class="card-body">
            ${story.featured === "true" ? '<div class="card-eyebrow">Featured</div>' : ""}
            <h3>${SiteContent.escapeHtml(story.title || story.slug)}</h3>
            <p>${SiteContent.escapeHtml(story.teaser || "")}</p>
            <span class="card-more">Read &rarr;</span>
          </div>
        </a>`;
    })
    .join("");
})();
