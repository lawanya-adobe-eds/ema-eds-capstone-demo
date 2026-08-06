/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WKND adventure-detail spec list -> "specs" block.
 *
 * PROBLEM
 *   On adventure-detail pages the six adventure specs are authored in AEM as a
 *   Content Fragment rendered by the Core Components as a definition list:
 *
 *     <div class="contentfragment cmp-contentfragment--elements ...">
 *       <article class="cmp-contentfragment cmp-contentfragment--{adventure}">
 *         <h3 class="cmp-contentfragment__title">Bali Surf Camp</h3>   <!-- dup of page <h1> -->
 *         <dl class="cmp-contentfragment__elements">
 *           <div class="cmp-contentfragment__element cmp-contentfragment__element--activity">
 *             <dt class="cmp-contentfragment__element-title">Activity</dt>
 *             <dd class="cmp-contentfragment__element-value">Surfing</dd>
 *           </div>
 *           ... (Adventure Type, Trip Length, Group Size, Difficulty, Price)
 *         </dl>
 *       </article>
 *     </div>
 *
 *   Without intervention the importer turns this into a plain bulleted <ul>/<li>
 *   list with no label/value distinction.
 *
 * SOLUTION
 *   Detect the spec definition list and emit a "specs" block table directly:
 *     | specs    |               |
 *     | Activity | Surfing       |
 *     | ...      | ...           |
 *   The companion blocks/specs/ block (CSS/JS, authored separately) styles each
 *   row as a label/value pair.
 *
 * HOOK: beforeTransform — the block table is created BEFORE block parsing so the
 * page block-finder never re-parses the spec list, and the built <table> passes
 * straight through to markdown. (This block is self-contained: it does not
 * depend on a specs parser being registered.)
 *
 * GENERIC ACROSS ALL 16 ADVENTURES
 *   Anchors on the Core Component output classes (identical on every adventure);
 *   only the values and the per-adventure `--{name}` article modifier differ.
 *   `dl.cmp-contentfragment__elements` is unique to the spec list — the three
 *   tab-panel content fragments render `div.cmp-contentfragment__elements`
 *   (a <div>, not a <dl>), so the tabs are never affected.
 *
 * DUPLICATE TITLE
 *   The spec list's <article> begins with an <h3 class="cmp-contentfragment__title">
 *   that duplicates the page <h1>. Because we replace the whole <article> with the
 *   specs block, that duplicate <h3> is removed cleanly. The three tab-panel
 *   `h3.cmp-contentfragment__title` headings live in different articles and are
 *   left untouched.
 *
 * Selectors verified against the captured adventure-detail DOM
 * (https://wknd.site/us/en/adventures/bali-surf-camp.html).
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

const SPEC_LIST_SEL = 'dl.cmp-contentfragment__elements';
const PAIR_SEL = '.cmp-contentfragment__element';
const LABEL_SEL = 'dt.cmp-contentfragment__element-title, dt, .cmp-contentfragment__element-title';
const VALUE_SEL = 'dd.cmp-contentfragment__element-value, dd, .cmp-contentfragment__element-value';

// Collapse the whitespace-heavy Core Component markup to a single clean line.
const clean = (node) => (node ? node.textContent : '').replace(/\s+/g, ' ').trim();

/**
 * Build the [label, value] data rows for one spec <dl>.
 * Primary path: one `.cmp-contentfragment__element` wrapper per pair.
 * Fallback: pair <dt>/<dd> siblings by document order if wrappers are absent.
 */
function buildRows(dl) {
  const rows = [];
  const pairs = dl.querySelectorAll(PAIR_SEL);

  if (pairs.length) {
    pairs.forEach((pair) => {
      const label = clean(pair.querySelector(LABEL_SEL));
      const value = clean(pair.querySelector(VALUE_SEL));
      if (label || value) rows.push([label, value]);
    });
    return rows;
  }

  // Fallback: walk dt/dd in order.
  const terms = Array.from(dl.querySelectorAll('dt'));
  terms.forEach((dt) => {
    let dd = dt.nextElementSibling;
    while (dd && dd.tagName !== 'DD') dd = dd.nextElementSibling;
    const label = clean(dt);
    const value = clean(dd);
    if (label || value) rows.push([label, value]);
  });
  return rows;
}

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // There is exactly one spec <dl> per adventure page, but handle any count.
    element.querySelectorAll(SPEC_LIST_SEL).forEach((dl) => {
      const cells = buildRows(dl);
      // Empty-block guard: nothing extractable -> leave the DOM untouched.
      if (!cells.length) return;

      const block = WebImporter.Blocks.createBlock(document, { name: 'specs', cells });

      // Replace the whole content-fragment <article> when present: this both
      // converts the <dl> into the specs block AND removes the duplicate
      // <h3 class="cmp-contentfragment__title"> that repeats the page <h1>.
      const article = dl.closest('article.cmp-contentfragment');
      if (article) {
        article.replaceWith(block);
        return;
      }

      // No article ancestor: drop a leading duplicate CF title if it sits with
      // the list, then swap the <dl> for the block.
      const wrapper = dl.parentElement;
      if (wrapper) {
        const dupTitle = wrapper.querySelector('h3.cmp-contentfragment__title, .cmp-contentfragment__title');
        if (dupTitle) dupTitle.remove();
      }
      dl.replaceWith(block);
    });
  }
}
