# Elisavetta — personal site

Plain HTML, CSS, and vanilla JS. No framework, no build step, no npm install.
The whole folder is the site — deploy it as-is to GitHub Pages, nemini.site,
or any static host.

## Running it locally

Content is loaded with `fetch()`, which browsers block for files opened
directly (`file://...`). You need a tiny local server — no install required:

```
python3 -m http.server 8000
```

Then open `http://localhost:8000/`. (Any static server works — `npx serve`,
PHP's built-in server, etc. This one just needs no setup.)

## Adding content

Nothing below requires touching the template (HTML/CSS/JS). You're only ever
adding a Markdown file and, in two cases, listing its filename.

### A new story (Fiction)

1. Add `fiction/your-story.md` with front matter:

   ```
   ---
   title: Your Story Title
   teaser: One line that makes someone want to click.
   cover: images/your-cover.jpg
   featured: false
   date: 2024-01-01
   ---

   Your story, in Markdown.
   ```

2. Add `"your-story"` to the array in `fiction/manifest.js`.
3. Drop a cover image in `fiction/images/` and point `cover` at it — the
   path is relative to the story file itself (same folder), the same as
   inline illustrations below.

   `featured: true` pins a story to the top of the gallery as a full-width
   card — use it for the piece you most want people to read first.

   To put an illustration inline in the story itself, use standalone
   Markdown image syntax on its own line:

   ```
   ![Caption for the illustration](images/whatever.jpg)
   ```

   It renders full-width with the alt text as a caption, matching how the
   sample story (`fiction/the-pendant.md`) does it.

### A new entry (Research)

Same pattern, in `/research/`:

```
---
title: Entry Title
hook: The one-line hook shown on the card.
order: 4
---

Entry content in Markdown.
```

Add the filename to `research/manifest.js`. Entries render in `order`, low
to high, with previous/next links between them — this is what makes the
section feel like a thread instead of a blog dump.

### A new piece (Art)

No Markdown here — just an image and a caption. Add the image to
`art/images/`, then add an entry to the array in `art/manifest.js`:

```
{ src: "art/images/your-piece.jpg", alt: "short alt text", caption: "The caption you want to show under it." }
```

### Editing Landing / About

`index.html` and `about.html` are plain HTML — edit the text directly. The
portrait on the landing page is `images/portrait-placeholder.svg`; replace
that file with your own image (same filename, or update the `src` in
`index.html`).

Before you deploy, replace the two placeholders in `about.html`: the Nemini
link (currently `href="#"`) and the contact email (currently
`hello@example.com`).

## How the content loading works

There's no build step, which means no static site generator turning
Markdown into HTML ahead of time. Instead, `js/markdown.js` is a small,
purpose-built Markdown + front-matter reader (not a general-purpose
parser — just enough for prose, headings, lists, links, images, quotes)
that runs in the browser. The gallery and reader pages fetch the relevant
`.md` files directly and render them on the fly. This is why local preview
needs a static server rather than opening the HTML files directly — `.md`
files are fetched over HTTP, and browsers refuse that from `file://`.

The `manifest.js` files exist because a static site has no way to ask a
folder "what files are in you" — someone has to say so. That's the one
place you touch a file that isn't the content itself, and it's one line.

## File structure

```
index.html          Landing
fiction.html         Fiction gallery
fiction/
  manifest.js        List of story slugs
  read.html           Full-page story reader (fiction/read.html?story=slug)
  *.md               Story content
  images/            Inline story illustrations
research.html        Research reading-path intro + list
research/
  manifest.js        List of entry slugs
  read.html           Full-page entry reader (research/read.html?entry=slug)
  *.md               Entry content
art.html             Art grid + lightbox
art/
  manifest.js        List of {src, alt, caption}
  images/            Art files
about.html           About / contact
css/style.css        All styling, theme tokens at the top
js/
  main.js            Nav, mobile menu, smooth scroll
  markdown.js         Front matter + Markdown renderer
  fiction-gallery.js  Builds the fiction grid
  research-thread.js  Builds the research thread
  reader.js          Generic full-page reader (used by both read.html pages)
  art-gallery.js      Builds the art grid + lightbox
images/              Landing portrait + fiction covers
```

## Deploying

**GitHub Pages:** push this folder to a repo, then in Settings → Pages, set
the source to the branch/root you pushed to. No build step to configure.

**nemini.site:** point it at this folder as a static site the same way —
there's nothing here that needs a server runtime, just static file hosting.
