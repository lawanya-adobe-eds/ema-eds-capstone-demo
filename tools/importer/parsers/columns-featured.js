/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-featured
 * Base block: columns
 * Source: https://wknd.site/us/en.html (div.teaser.cmp-teaser--featured)
 * Generated: 2026-08-06
 *
 * Structure (from library-description.txt): first row = block name.
 * Featured teaser is a 2-column layout: one column holds the text content
 * (pretitle, title, description, CTA), the other holds the image.
 */
export default function parse(element, { document }) {
  // Text content column
  const textCell = [];
  const pretitle = element.querySelector('.cmp-teaser__pretitle');
  if (pretitle) textCell.push(pretitle);

  const title = element.querySelector('.cmp-teaser__title, h1, h2, h3');
  if (title) textCell.push(title);

  const description = element.querySelector('.cmp-teaser__description, p:not(.cmp-teaser__pretitle)');
  if (description) textCell.push(description);

  const ctaLinks = Array.from(
    element.querySelectorAll('.cmp-teaser__action-link, .cmp-teaser__action-container a'),
  );
  ctaLinks.forEach((cta) => textCell.push(cta));

  // Image column
  const image = element.querySelector('.cmp-teaser__image img, .cmp-image img, img');

  // Empty-block guard
  if (textCell.length === 0 && !image) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [
    [textCell.length > 0 ? textCell : '', image || ''],
  ];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-featured', cells });
  element.replaceWith(block);
}
