/*
 * Accordion (FAQ) Block
 * Recreate an accordion of expandable question/answer items.
 * Variant of the Block Collection accordion:
 * https://www.hlx.live/developer/block-collection/accordion
 *
 * Two authoring modes, auto-detected:
 *  1. Authored rows — each row is [question | answer]. This is the default and
 *     matches the source (wknd.site) which authors FAQs inline.
 *  2. Feed mode — the block holds a single cell with a link/path to a published
 *     spreadsheet JSON (e.g. /us/en/faqs-data). The block fetches that sheet and
 *     builds the same accordion from its `question`/`answer` columns, so FAQs can
 *     be maintained in one sheet and reused across pages. The fetch runs at
 *     decoration time (the accordion is below the fold, so it never blocks LCP),
 *     and falls back to whatever was authored if the feed can't be loaded.
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

/**
 * Build a single <details> accordion item from a label element and a body
 * element, preserving any authoring instrumentation on the source row.
 */
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

/**
 * Detect a feed source: a single authored cell whose sole content is a link to
 * (or the bare path/URL of) a `.json` sheet. Returns the resolved URL or null.
 */
function getFeedSource(block) {
  // Feed mode is a single row with a single cell.
  if (block.children.length !== 1) return null;
  const cell = block.querySelector(':scope > div > div');
  if (!cell) return null;
  const link = cell.querySelector('a[href]');
  const raw = (link ? link.getAttribute('href') : cell.textContent).trim();
  if (!/\.json(\?|$)/i.test(raw)) return null;
  try {
    return new URL(raw, window.location).href;
  } catch (e) {
    return null;
  }
}

/**
 * Render accordion items from feed rows. Each row is expected to expose a
 * question and an answer under common column names. The answer may contain
 * inline HTML (e.g. <strong>) authored in the sheet, so it is assigned as HTML
 * — the sheet is first-party trusted content, consistent with authored richtext.
 */
function renderFromFeed(block, rows) {
  block.textContent = '';
  rows.forEach((item) => {
    const question = item.question || item.title || item.Question || '';
    const answer = item.answer || item.Answer || item.body || '';
    if (!question) return;

    const labelEl = document.createElement('div');
    labelEl.textContent = question;
    const bodyEl = document.createElement('div');
    bodyEl.innerHTML = answer;

    block.append(buildItem(null, labelEl, bodyEl));
  });
}

/**
 * loads and decorates the accordion-faq block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const feedUrl = getFeedSource(block);

  if (!feedUrl) {
    decorateAuthored(block);
    return;
  }

  // Feed mode: fetch the sheet, render from it, and fall back to nothing (the
  // block simply stays empty) only if the fetch fails AND there was no authored
  // content to keep. Since feed mode is a single link cell, there is no authored
  // Q&A to preserve, so a failed fetch just removes the placeholder link.
  try {
    const res = await fetch(feedUrl);
    const json = res.ok ? await res.json() : null;
    const rows = json && Array.isArray(json.data) ? json.data : [];
    if (rows.length) {
      renderFromFeed(block, rows);
      return;
    }
  } catch (e) {
    // fall through to graceful cleanup below
  }
  // Feed unavailable/empty: remove the raw link cell so no stray path shows.
  block.textContent = '';
}
