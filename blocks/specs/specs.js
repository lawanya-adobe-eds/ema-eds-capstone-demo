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
    // Wrap each label/value pair in its own group so the list can be laid out
    // as a multi-column grid (one cell per pair) without the dt/dd flow being
    // split across columns — matching the source's per-pair grid.
    const pair = document.createElement('div');
    pair.className = 'specs-pair';
    const dt = document.createElement('dt');
    dt.append(...cells[0].childNodes);
    const dd = document.createElement('dd');
    dd.append(...cells[1].childNodes);
    pair.append(dt, dd);
    dl.append(pair);
  });
  block.textContent = '';
  block.append(dl);
}
