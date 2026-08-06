/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-overlay
 * Base block: hero
 * Source: https://wknd.site/us/en.html (div.teaser.cmp-teaser--hero.cmp-teaser--imagebottom)
 * Generated: 2026-08-06
 *
 * Structure (from library-description.txt): 1 column, 3 rows.
 * Row 1: block name. Row 2: background image. Row 3: title, subheading, CTA.
 */
export default function parse(element, { document }) {
  // Background image (optional)
  const image = element.querySelector('.cmp-teaser__image img, .cmp-image img, img');

  // Text content (title, description, CTA)
  const contentCell = [];
  const title = element.querySelector('.cmp-teaser__title, h1, h2, h3');
  if (title) contentCell.push(title);

  const description = element.querySelector('.cmp-teaser__description, p');
  if (description) contentCell.push(description);

  const ctaLinks = Array.from(
    element.querySelectorAll('.cmp-teaser__action-link, .cmp-teaser__action-container a'),
  );
  ctaLinks.forEach((cta) => contentCell.push(cta));

  // Empty-block guard
  if (!image && contentCell.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  // Row 2: background image (single-cell row)
  cells.push([image || '']);
  // Row 3: text content (single-cell row holding all text elements)
  cells.push([contentCell.length > 0 ? contentCell : '']);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-overlay', cells });
  element.replaceWith(block);
}
