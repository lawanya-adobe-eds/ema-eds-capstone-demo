/**
 * specs — adventure spec pairs (label / value).
 * Each block row is one pair: [label, value]. Rendered as a definition list
 * so the label/value hierarchy is preserved and accessible.
 */
export default function decorate(block) {
  const dl = document.createElement('dl');
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 2) return;
    const dt = document.createElement('dt');
    dt.append(...cells[0].childNodes);
    const dd = document.createElement('dd');
    dd.append(...cells[1].childNodes);
    dl.append(dt, dd);
  });
  block.textContent = '';
  block.append(dl);
}
