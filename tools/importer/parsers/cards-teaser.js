/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-teaser
 * Base block: cards
 * Source: https://wknd.site/us/en.html (div.image-list.list)
 * Generated: 2026-08-06
 *
 * Structure (from library-description.txt): 2 columns, multiple rows.
 * Row 1: block name. Each subsequent row = one card: [image, textContent].
 * Text cell contains: title (as heading/link) and description.
 */
export default function parse(element, { document }) {
  const items = Array.from(element.querySelectorAll('.cmp-image-list__item, li'));

  const cells = [];

  items.forEach((item) => {
    // Image cell (mandatory)
    const image = item.querySelector('.cmp-image-list__item-image img, .cmp-image img, img');

    // Text content cell
    const textCell = [];

    // Title (linked). Prefer the title link so the card links through.
    const titleLink = item.querySelector('.cmp-image-list__item-title-link');
    const titleText = item.querySelector('.cmp-image-list__item-title');
    if (titleLink) {
      // Build a heading wrapping the title link to preserve semantics + link.
      const heading = document.createElement('h3');
      const link = document.createElement('a');
      link.href = titleLink.getAttribute('href') || '';
      link.textContent = (titleText || titleLink).textContent.trim();
      heading.append(link);
      textCell.push(heading);
    } else if (titleText) {
      const heading = document.createElement('h3');
      heading.textContent = titleText.textContent.trim();
      textCell.push(heading);
    }

    const description = item.querySelector('.cmp-image-list__item-description, p');
    if (description) textCell.push(description);

    if (image || textCell.length > 0) {
      cells.push([image || '', textCell.length > 0 ? textCell : '']);
    }
  });

  // Empty-block guard
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-teaser', cells });
  element.replaceWith(block);
}
