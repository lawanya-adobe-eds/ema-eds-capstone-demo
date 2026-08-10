/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: swap the statically-parsed card grids on the Adventures and
 * Magazine listing pages for dynamic, query-index-driven blocks.
 *
 * The source builds these grids at request time from a repository query (the
 * custom `image-list` List component). EDS has no server-side query engine, so
 * the equivalent behaviour is a client-side block that fetches
 * /us/en/query-index.json and renders the cards. This transformer replaces the
 * imported card tables with a single-cell block marker for that block:
 *
 *   - Adventures listing: the `tabs-adventure` table (the filter tabs + card
 *     grid) becomes an `adventures-listing` block. The block rebuilds the tabs
 *     from the indexed `category` field, so it stays in sync as pages are added.
 *   - Magazine listing: the FIRST `cards-teaser` table (the "All Articles" grid)
 *     becomes a `magazine-listing` block seeded with an "All Articles" heading.
 *     Any later `cards-teaser` table (e.g. the static "Members Only" teasers) is
 *     left untouched.
 *   - Homepage: the FIRST `cards-teaser` table (the "Recent Articles" magazine
 *     grid) becomes a `recent-articles` block. The SECOND `cards-teaser` (the
 *     "Where do you want to go?" adventures grid) is left static.
 *
 * Runs on afterTransform, once the parsers have emitted the block tables.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

/**
 * True if a parsed block <table> is named `name`.
 * createBlock renders the header via computeBlockName (e.g. "cards-teaser" ->
 * "Cards Teaser"), so normalise the header text back to a kebab slug: strip any
 * "(variant)" suffix, lowercase, and collapse spaces to hyphens before comparing.
 */
function isBlock(table, name) {
  const header = table.querySelector('tr th, tr td');
  if (!header) return false;
  const label = header.textContent
    .trim()
    .replace(/\s*\(.*\)$/, '')
    .toLowerCase()
    .replace(/\s+/g, '-');
  return label === name;
}

/** Create a single-cell block marker table: header row = block name. */
function createMarker(document, name, cellText) {
  const rows = [[name]];
  if (cellText) rows.push([cellText]);
  return WebImporter.DOMUtils.createTable(rows, document);
}

export default function transform(hookName, element, payload) {
  if (hookName !== TransformHook.afterTransform) return;

  const { document } = payload;
  const url = (payload.params && payload.params.originalURL) || payload.url || '';
  const path = (() => {
    try { return new URL(url).pathname; } catch (e) { return String(url); }
  })();

  const tables = [...element.querySelectorAll('table')];

  if (/\/adventures(\.html)?$/.test(path)) {
    // Adventures listing: replace the tabs-adventure card grid.
    const grid = tables.find((t) => isBlock(t, 'tabs-adventure'));
    if (grid) grid.replaceWith(createMarker(document, 'adventures-listing'));
  } else if (/\/magazine(\.html)?$/.test(path)) {
    // Magazine listing: replace only the FIRST cards-teaser (the article grid),
    // keeping any later cards-teaser (Members Only) static. The page already has
    // an authored "All Articles" <h2> immediately before this grid, so the marker
    // carries no heading of its own (avoids a duplicate heading).
    const grid = tables.find((t) => isBlock(t, 'cards-teaser'));
    if (grid) grid.replaceWith(createMarker(document, 'magazine-listing'));
  } else if (/\/us\/en(\.html)?$/.test(path)) {
    // Homepage: two cards-teaser grids become dynamic, query-index blocks. The
    // FIRST ("Recent Articles" magazine grid) → recent-articles; the SECOND
    // ("Where do you want to go?" adventures grid) → recent-adventures. Each has
    // an authored <h2>/<h3> heading immediately before it, so the markers carry
    // no heading of their own (avoids duplicate headings).
    const grids = tables.filter((t) => isBlock(t, 'cards-teaser'));
    if (grids[0]) grids[0].replaceWith(createMarker(document, 'recent-articles'));
    if (grids[1]) grids[1].replaceWith(createMarker(document, 'recent-adventures'));
  }
}
