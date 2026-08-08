import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    // Reserve layout space to prevent CLS. 4:3 to match the CSS
    // (aspect-ratio:4/3) — sizing hint only, no visual change.
    const newImg = optimizedPic.querySelector('img');
    newImg.setAttribute('width', '800');
    newImg.setAttribute('height', '600');
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.replaceChildren(ul);
}
