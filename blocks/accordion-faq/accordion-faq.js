/*
 * Accordion (FAQ) Block
 * Recreate an accordion of expandable question/answer items.
 * Variant of the Block Collection accordion:
 * https://www.hlx.live/developer/block-collection/accordion
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
 * loads and decorates the accordion-faq block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    // decorate accordion item label
    const label = row.children[0];
    const summary = document.createElement('summary');
    summary.className = 'accordion-faq-item-label';
    summary.append(...label.childNodes);
    // decorate accordion item body
    const body = row.children[1];
    body.className = 'accordion-faq-item-body';
    // decorate accordion item
    const details = document.createElement('details');
    moveInstrumentation(row, details);
    details.className = 'accordion-faq-item';
    details.append(summary, body);
    row.replaceWith(details);
  });
}
