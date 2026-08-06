/* eslint-disable */
/* global WebImporter */
/**
 * Parser for breadcrumb
 * Base block: breadcrumb (custom — no library convention available)
 * Source: https://wknd.site/us/en/adventures/bali-surf-camp.html (div.breadcrumb.cmp-breadcrumb--fixed)
 * Generated: 2026-08-06
 *
 * Structure (inferred from source HTML): single column, multiple rows.
 * Row 1: block name. Each subsequent row = one crumb in the trail.
 *   - Linked crumb  -> an <a> preserving href + label text (e.g. "Adventures").
 *   - Active crumb  -> plain text of the current page (e.g. "Bali Surf Camp"), non-linked.
 */
export default function parse(element, { document }) {
  // Prefer the specific breadcrumb item class; fall back to list items.
  let items = Array.from(element.querySelectorAll('.cmp-breadcrumb__item'));
  if (items.length === 0) {
    items = Array.from(element.querySelectorAll('ol li, nav li'));
  }

  const cells = [];

  items.forEach((item) => {
    const link = item.querySelector('a[href]');
    if (link) {
      // Linked crumb: rebuild a clean anchor to preserve href + label,
      // dropping the nested <span>/<meta> markup.
      const anchor = document.createElement('a');
      anchor.href = link.getAttribute('href') || '';
      anchor.textContent = link.textContent.trim();
      if (anchor.textContent) cells.push([anchor]);
    } else {
      // Active (current page) crumb: non-linked plain text.
      const label = item.textContent.trim();
      if (label) cells.push([label]);
    }
  });

  // Empty-block guard: no crumbs found, unwrap rather than emit an empty block.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'breadcrumb', cells });
  element.replaceWith(block);
}
