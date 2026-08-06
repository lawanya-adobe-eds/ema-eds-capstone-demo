/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-hero
 * Base block: carousel
 * Source: https://wknd.site/us/en.html (div.carousel.cmp-carousel--hero)
 * Generated: 2026-08-06
 *
 * Structure (from library-description.txt): 2 columns, multiple rows.
 * Row 1: block name. Each subsequent row = one slide: [image, textContent].
 * Text cell contains: title (heading), description, CTA link.
 */
export default function parse(element, { document }) {
  // Each slide is a carousel item; fall back to teaser blocks if item wrappers change.
  let slides = Array.from(element.querySelectorAll('.cmp-carousel__item'));
  if (slides.length === 0) {
    slides = Array.from(element.querySelectorAll('.teaser, .cmp-teaser'));
  }

  const cells = [];

  slides.forEach((slide) => {
    // Image cell (mandatory per description)
    const image = slide.querySelector('.cmp-teaser__image img, .cmp-image img, img');

    // Text content cell
    const textCell = [];
    const title = slide.querySelector('.cmp-teaser__title, h1, h2, h3');
    if (title) textCell.push(title);

    const description = slide.querySelector('.cmp-teaser__description, p');
    if (description) textCell.push(description);

    const ctaLinks = Array.from(
      slide.querySelectorAll('.cmp-teaser__action-link, .cmp-teaser__action-container a'),
    );
    ctaLinks.forEach((cta) => textCell.push(cta));

    // Only add a slide row if there is at least an image or some text content
    if (image || textCell.length > 0) {
      cells.push([image || '', textCell.length > 0 ? textCell : '']);
    }
  });

  // Empty-block guard: no slides found, unwrap the element rather than emit an empty block
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-hero', cells });
  element.replaceWith(block);
}
