/*
 * Accordion (FAQ) Block
 * Recreate an accordion of expandable question/answer items.
 * Variant of the Block Collection accordion:
 * https://www.hlx.live/developer/block-collection/accordion
 *
 * Two authoring modes, auto-detected:
 *  1. Authored rows (default) — each row is [question | answer]. Matches the
 *     source (wknd.site), which authors FAQs inline.
 *  2. Dynamic mode — the block holds a single cell reading "dynamic" (or a link
 *     to the FAQ index). The block then fetches the query-index-generated
 *     /us/en/faqs/faq-index.json, sorts the FAQs by their `order` field, and
 *     builds the same accordion. New FAQ sub-pages under /us/en/faqs/ appear
 *     automatically without re-authoring this page. Each FAQ sub-page still
 *     renders its answer as body HTML, so the answer text stays searchable and
 *     crawlable (no SEO/search regression). The fetch runs at decoration time
 *     on a below-the-fold block, so it never blocks LCP.
 */

/**
 * Moves the data-aue-* / data-richtext-* instrumentation attributes from one
 * element to another so the block stays authorable in the Universal Editor.
 * Defined locally to keep the block self-contained (scripts.js does not export
 * a moveInstrumentation helper in this project).
 * @param {Element} from source element
 * @param {Element} to target element
 */
function moveInstrumentation(from, to) {
  if (!from || !to) return;
  const attrs = [...from.attributes]
    .map(({ nodeName }) => nodeName)
    .filter((name) => name.startsWith('data-aue-') || name.startsWith('data-richtext-'));
  attrs.forEach((name) => {
    to.setAttribute(name, from.getAttribute(name));
    from.removeAttribute(name);
  });
}

/** Build a <details> accordion item from a label element and a body element. */
function buildItem(row, labelEl, bodyEl) {
  const summary = document.createElement('summary');
  summary.className = 'accordion-faq-item-label';
  summary.append(...labelEl.childNodes);

  bodyEl.className = 'accordion-faq-item-body';

  const details = document.createElement('details');
  if (row) moveInstrumentation(row, details);
  details.className = 'accordion-faq-item';
  details.append(summary, bodyEl);
  return details;
}

/** Decorate authored [question | answer] rows in place (default mode). */
function decorateAuthored(block) {
  [...block.children].forEach((row) => {
    const details = buildItem(row, row.children[0], row.children[1]);
    row.replaceWith(details);
  });
}

/** Resolve the FAQ index path for both local dev (/content) and production. */
function getIndexPath() {
  const base = window.location.pathname.startsWith('/content/') ? '/content/us/en' : '/us/en';
  return `${base}/faqs/faq-index.json`;
}

/**
 * Detect dynamic mode: a single cell whose text is "dynamic", or a link/path to
 * a `.json` index. Returns the index URL to fetch, or null for authored mode.
 */
function getDynamicSource(block) {
  if (block.children.length !== 1) return null;
  const cell = block.querySelector(':scope > div > div');
  if (!cell) return null;
  const link = cell.querySelector('a[href]');
  const raw = (link ? link.getAttribute('href') : cell.textContent).trim();
  if (/^dynamic$/i.test(raw)) return getIndexPath();
  if (/\.json(\?|$)/i.test(raw)) {
    try {
      return new URL(raw, window.location).href;
    } catch (e) {
      return null;
    }
  }
  return null;
}

/**
 * Render accordion items from FAQ index rows, sorted by `order`. Answers are
 * plain text from the index (first-party trusted content); assigned as text.
 */
function renderFromIndex(block, rows) {
  // Require a question, a non-empty answer, AND a numeric order. The `faq`
  // index glob (/us/en/faqs/**) also matches the FAQs landing page itself,
  // which has a title but no answer paragraph and no order — this filter drops
  // that row (and any other non-FAQ page) so only real FAQ entries render.
  const items = rows
    .filter((r) => r.question && (r.answer || '').trim() && Number.isFinite(Number(r.order)) && String(r.order).trim() !== '')
    .sort((a, b) => Number(a.order) - Number(b.order));

  block.textContent = '';
  items.forEach((item) => {
    const labelEl = document.createElement('div');
    labelEl.textContent = item.question;
    const bodyEl = document.createElement('div');
    const p = document.createElement('p');
    p.textContent = item.answer || '';
    bodyEl.append(p);
    block.append(buildItem(null, labelEl, bodyEl));
  });
}

/**
 * loads and decorates the accordion-faq block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const indexUrl = getDynamicSource(block);

  if (!indexUrl) {
    decorateAuthored(block);
    return;
  }

  try {
    const res = await fetch(indexUrl);
    const json = res.ok ? await res.json() : null;
    const rows = json && Array.isArray(json.data) ? json.data : [];
    if (rows.length) {
      renderFromIndex(block, rows);
      return;
    }
  } catch (e) {
    // fall through to graceful cleanup below
  }
  // Index unavailable/empty: clear the placeholder so no stray marker shows.
  block.textContent = '';
}
