/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-gallery
 * Base block: carousel
 * Source: https://wknd.site/us/en/adventures/bali-surf-camp.html (div.carousel.cmp-carousel--mini)
 * Generated: 2026-08-06
 *
 * Structure (from library-description.txt): 2 columns, multiple rows. Row 1: block name.
 * Each subsequent row = one slide: first cell image (mandatory), second cell optional text.
 * This is an image-only rotating gallery — slides have no overlaid title/description/CTA,
 * so each slide row is just the image (single populated cell).
 */
export default function parse(element, { document }) {
  // Each slide is a carousel item.
  const slides = Array.from(element.querySelectorAll('.cmp-carousel__item'));

  const cells = [];

  slides.forEach((slide) => {
    // Image is mandatory for a gallery slide. Scope to the slide's image wrapper.
    const image = slide.querySelector('.cmp-image img, .image img, img');
    if (image) {
      cells.push([image]);
    }
  });

  // Empty-block guard: no slide images found, unwrap rather than emit an empty block.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-gallery', cells });
  element.replaceWith(block);
}
