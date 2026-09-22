/*
 * Tiny front-matter + Markdown reader for static content files.
 *
 * This is not a general-purpose Markdown implementation — it supports the
 * subset used by the fiction and research entries in this site: headings,
 * paragraphs, bold/italic, links, standalone images (rendered as full-width
 * figures with captions), inline images, blockquotes, lists, hr, code spans.
 *
 * Usage:
 *   const { data, body } = SiteContent.parseFrontMatter(rawText);
 *   const html = SiteContent.renderMarkdown(body);
 */
(function (global) {
  function parseFrontMatter(raw) {
    const data = {};
    let body = raw;

    if (raw.startsWith("---")) {
      const end = raw.indexOf("\n---", 3);
      if (end !== -1) {
        const frontMatter = raw.slice(3, end).trim();
        body = raw.slice(end + 4).replace(/^\s*\n/, "");

        frontMatter.split("\n").forEach((line) => {
          const idx = line.indexOf(":");
          if (idx === -1) return;
          const key = line.slice(0, idx).trim();
          let value = line.slice(idx + 1).trim();
          // strip matching quotes
          if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
          ) {
            value = value.slice(1, -1);
          }
          data[key] = value;
        });
      }
    }

    return { data, body };
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // inline spans: images, links, bold, italic, code
  function renderInline(text) {
    let out = escapeHtml(text);

    // inline code `code`
    out = out.replace(/`([^`]+)`/g, (m, code) => `<code>${code}</code>`);

    // images ![alt](src)
    out = out.replace(
      /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g,
      (m, alt, src) => `<img src="${src}" alt="${alt}">`
    );

    // links [text](href)
    out = out.replace(
      /\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g,
      (m, label, href) => {
        const external = /^https?:\/\//.test(href);
        const attrs = external ? ' target="_blank" rel="noopener"' : "";
        return `<a href="${href}"${attrs}>${label}</a>`;
      }
    );

    // bold
    out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    out = out.replace(/__([^_]+)__/g, "<strong>$1</strong>");

    // italic
    out = out.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    out = out.replace(/(?<![a-zA-Z0-9])_([^_]+)_(?![a-zA-Z0-9])/g, "<em>$1</em>");

    return out;
  }

  function renderMarkdown(md) {
    const lines = md.replace(/\r\n/g, "\n").split("\n");
    const html = [];
    let i = 0;
    let paragraph = [];
    let list = null; // { type: 'ul'|'ol', items: [] }

    function flushParagraph() {
      if (paragraph.length) {
        html.push(`<p>${renderInline(paragraph.join(" "))}</p>`);
        paragraph = [];
      }
    }

    function flushList() {
      if (list) {
        const items = list.items.map((it) => `<li>${renderInline(it)}</li>`).join("");
        html.push(`<${list.type}>${items}</${list.type}>`);
        list = null;
      }
    }

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      // blank line
      if (trimmed === "") {
        flushParagraph();
        flushList();
        i++;
        continue;
      }

      // standalone image -> figure with caption (alt text becomes caption)
      const soloImage = trimmed.match(/^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)$/);
      if (soloImage) {
        flushParagraph();
        flushList();
        const [, alt, src] = soloImage;
        const caption = alt ? `<figcaption>${escapeHtml(alt)}</figcaption>` : "";
        html.push(`<figure><img src="${src}" alt="${escapeHtml(alt)}">${caption}</figure>`);
        i++;
        continue;
      }

      // headings
      const heading = trimmed.match(/^(#{1,6})\s+(.*)$/);
      if (heading) {
        flushParagraph();
        flushList();
        const level = heading[1].length;
        html.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
        i++;
        continue;
      }

      // horizontal rule
      if (/^(-{3,}|\*{3,})$/.test(trimmed)) {
        flushParagraph();
        flushList();
        html.push("<hr>");
        i++;
        continue;
      }

      // blockquote
      if (trimmed.startsWith(">")) {
        flushParagraph();
        flushList();
        const quoteLines = [];
        while (i < lines.length && lines[i].trim().startsWith(">")) {
          quoteLines.push(lines[i].trim().replace(/^>\s?/, ""));
          i++;
        }
        html.push(`<blockquote><p>${renderInline(quoteLines.join(" "))}</p></blockquote>`);
        continue;
      }

      // unordered list
      const ulMatch = trimmed.match(/^[-*+]\s+(.*)$/);
      if (ulMatch) {
        flushParagraph();
        if (!list || list.type !== "ul") {
          flushList();
          list = { type: "ul", items: [] };
        }
        list.items.push(ulMatch[1]);
        i++;
        continue;
      }

      // ordered list
      const olMatch = trimmed.match(/^\d+\.\s+(.*)$/);
      if (olMatch) {
        flushParagraph();
        if (!list || list.type !== "ol") {
          flushList();
          list = { type: "ol", items: [] };
        }
        list.items.push(olMatch[1]);
        i++;
        continue;
      }

      // default: paragraph text
      flushList();
      paragraph.push(trimmed);
      i++;
    }

    flushParagraph();
    flushList();

    return html.join("\n");
  }

  global.SiteContent = { parseFrontMatter, renderMarkdown, escapeHtml };
})(window);
