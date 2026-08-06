/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs-adventure
 * Base block: tabs
 * Source: https://wknd.site/us/en/adventures/bali-surf-camp.html (div.tabs.panelcontainer)
 * Generated: 2026-08-06
 *
 * Structure (from library-description.txt): 2 columns, multiple rows. Row 1: block name.
 * Each subsequent row = one tab: [tab label, tab content].
 *   - Tab labels come from ol.cmp-tabs__tablist > li.cmp-tabs__tab (e.g. Overview / Itinerary / What to Bring).
 *   - Tab content comes from the matching div.cmp-tabs__tabpanel, paired by index.
 * The panel content is a content fragment; the meaningful body lives in
 * .cmp-contentfragment__elements (paragraphs, images, lists). The repeated
 * .cmp-contentfragment__title heading is a sibling of that container, so scoping
 * to __elements naturally drops the duplicated adventure title per tab.
 */
export default function parse(element, { document }) {
  const labels = Array.from(element.querySelectorAll('.cmp-tabs__tablist .cmp-tabs__tab, ol.cmp-tabs__tablist > li'));
  const panels = Array.from(element.querySelectorAll('.cmp-tabs__tabpanel'));

  const cells = [];

  labels.forEach((label, index) => {
    const labelText = label.textContent.trim();
    const panel = panels[index];

    // Extract the content-fragment body; fall back to the whole panel if the
    // content-fragment wrapper is absent.
    let contentNodes = [];
    if (panel) {
      const cfElements = panel.querySelector('.cmp-contentfragment__elements');
      const source = cfElements || panel;
      // Keep meaningful content nodes, skip empty layout-grid-only wrappers.
      contentNodes = Array.from(source.childNodes).filter((node) => {
        if (node.nodeType === 3) return node.textContent.trim().length > 0; // text
        if (node.nodeType !== 1) return false; // comments etc.
        return node.textContent.trim().length > 0 || node.querySelector('img');
      });
    }

    // Only emit a tab row if we have a label; content cell may be empty in edge cases.
    if (labelText) {
      cells.push([labelText, contentNodes.length > 0 ? contentNodes : '']);
    }
  });

  // Empty-block guard: no tabs found, unwrap rather than emit an empty block.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-adventure', cells });
  element.replaceWith(block);
}
