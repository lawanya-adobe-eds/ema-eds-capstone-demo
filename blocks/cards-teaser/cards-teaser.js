import { createOptimizedPicture } from '../../scripts/aem.js';

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
 * loads and decorates the cards-teaser block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-teaser-card-image';
      else div.className = 'cards-teaser-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    const newImg = optimizedPic.querySelector('img');
    // Reserve layout space to prevent CLS. width/height match the 13:10 ratio
    // the CSS enforces (width:100%; aspect-ratio:13/10; object-fit:cover), so
    // the values are a sizing hint only — no visual change.
    newImg.setAttribute('width', '650');
    newImg.setAttribute('height', '500');
    moveInstrumentation(img, newImg);
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);
}
