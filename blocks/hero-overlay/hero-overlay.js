export default function decorate(block) {
  const firstImg = block.querySelector(':scope > div:first-child picture img');
  if (!firstImg) {
    block.classList.add('no-image');
  } else if (!firstImg.getAttribute('width')) {
    // Reserve layout space to prevent CLS. The hero image renders full-width
    // at aspect-ratio 3/2 (mobile) / 2/1 (desktop) via object-fit; 1200x800
    // is a sizing hint only — no visual change.
    firstImg.setAttribute('width', '1200');
    firstImg.setAttribute('height', '800');
  }
}
