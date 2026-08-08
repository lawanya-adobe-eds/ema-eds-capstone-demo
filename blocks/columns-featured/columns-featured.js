export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-featured-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-featured-img-col');
        }
        // Reserve layout space to prevent CLS. The featured image fills its
        // column at object-fit:cover; 3/2 is a sizing hint only — no visual
        // change.
        const img = pic.querySelector('img');
        if (img && !img.getAttribute('width')) {
          img.setAttribute('width', '600');
          img.setAttribute('height', '400');
        }
      }
    });
  });
}
