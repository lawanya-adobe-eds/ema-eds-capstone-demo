/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion-faq.
 * Base block: accordion.
 * Source: https://wknd.site/us/en/faqs.html
 * Generated: 2026-08-06
 *
 * Block convention (library-description.txt): 2-column table. First row is the
 * block name; each subsequent row is one accordion item as [Title cell, Content cell].
 * The accordion-faq decorator reads row.children[0] as the label (summary) and
 * row.children[1] as the body, matching this 2-column structure.
 *
 * Source structure (validated against source.html): the block wraps
 * div.cmp-accordion with repeating div.cmp-accordion__item, each containing:
 *   - question:  .cmp-accordion__header .cmp-accordion__title (inside a button)
 *   - answer:    .cmp-accordion__panel ... .cmp-text (paragraphs / headings / lists)
 */
export default function parse(element, { document }) {
  // Each accordion item becomes one row: [question, answer].
  const items = element.querySelectorAll('.cmp-accordion__item, [class*="accordion__item"]');

  const cells = [];

  items.forEach((item) => {
    // Question / title (clickable label). Prefer the dedicated title span, then
    // fall back to the header button or heading.
    const titleEl = item.querySelector(
      '.cmp-accordion__title, .cmp-accordion__button, .cmp-accordion__header, h2, h3, h4',
    );
    const question = titleEl ? titleEl.textContent.trim() : '';

    // Answer / panel body. Prefer the inner rich-text container, then the panel,
    // then the item itself as a last resort.
    const contentSource = item.querySelector('.cmp-accordion__panel .cmp-text')
      || item.querySelector('.cmp-accordion__panel')
      || item.querySelector('[class*="accordion__panel"]');

    const answer = [];
    if (contentSource) {
      // Collect meaningful child elements (paragraphs, headings, lists, images),
      // skipping empties such as the placeholder <h3>&nbsp;</h3> in the source.
      [...contentSource.children].forEach((child) => {
        if (child.textContent.trim() !== '' || child.querySelector('img, picture')) {
          answer.push(child);
        }
      });
      // Text-only body with no element children: keep the container itself.
      if (answer.length === 0) answer.push(contentSource);
    }

    // Only add rows that have real content; every row keeps 2 cells.
    if (question || answer.length) {
      cells.push([question, answer]);
    }
  });

  // Empty-block guard: nothing extractable, leave content in place.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-faq', cells });
  element.replaceWith(block);
}
