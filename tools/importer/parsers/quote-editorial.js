/* eslint-disable */
/* global WebImporter */
/**
 * Parser for quote-editorial
 * Base block: quote (custom — no library convention available; structure inferred from source HTML)
 * Source: https://wknd.site/us/en/magazine/arctic-surfing.html (blockquote — editorial pull-quote)
 * Generated: 2026-08-06
 *
 * Structure (inferred): single column, stacked rows.
 *   Row 1: block name ("quote-editorial").
 *   Row 2: the quotation text.
 *   Row 3 (optional): citation / attribution, only emitted when present in source.
 *
 * Source variation handling:
 *   - `element` may be the <blockquote> itself, or a wrapper (div.cmp-quote / div.quote)
 *     that contains the blockquote (per the union of instance selectors in page-templates.json).
 *   - On the representative page the blockquote holds only quote text (no attribution).
 *   - Other magazine pages may add an attribution via <cite>/<footer>/<figcaption> or an
 *     author class; that is extracted into its own row and excluded from the quote text.
 */
export default function parse(element, { document }) {
  // Selectors for an inline attribution/citation (may live inside the blockquote or wrapper).
  const CITATION_SELECTOR = 'cite, footer, figcaption, .cmp-quote__author, .cmp-quote__citation, .quote-author, [class*="attribution"]';

  // The blockquote may be the element itself or nested inside a wrapper div.
  const blockquote = element.matches('blockquote')
    ? element
    : element.querySelector('blockquote');

  // Host that carries the quotation text: prefer the blockquote, then known quote-text
  // classes on a wrapper.
  const quoteHost = blockquote
    || element.querySelector('.cmp-quote__quote, .cmp-quote__text, .quote-text');

  // Attribution/citation, searched within the quote area (present on some pages only).
  const citationEl = (quoteHost || element).querySelector(CITATION_SELECTOR);

  // Build the quote-text element, stripping any citation markup so it is not duplicated.
  let quoteEl = null;
  if (quoteHost) {
    const clone = quoteHost.cloneNode(true);
    clone.querySelectorAll(CITATION_SELECTOR).forEach((n) => n.remove());
    const html = clone.innerHTML.trim();
    if (html) {
      quoteEl = document.createElement('p');
      quoteEl.innerHTML = html;
    }
  }

  // Last resort: derive quote text from the element's own text (minus any citation text).
  if (!quoteEl) {
    const citationText = citationEl ? citationEl.textContent.trim() : '';
    let text = element.textContent.trim();
    if (citationText && text.endsWith(citationText)) {
      text = text.slice(0, text.length - citationText.length).trim();
    }
    if (text) {
      quoteEl = document.createElement('p');
      quoteEl.textContent = text;
    }
  }

  // Empty-block guard: no quotation found -> unwrap rather than emit an empty block.
  if (!quoteEl) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  cells.push([quoteEl]);

  // Optional attribution row (only when a citation exists in the source).
  if (citationEl) {
    const citeClone = citationEl.cloneNode(true);
    if (citeClone.textContent.trim()) cells.push([citeClone]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'quote-editorial', cells });
  element.replaceWith(block);
}
