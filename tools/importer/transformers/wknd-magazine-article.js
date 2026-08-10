/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: magazine-article related-stories list → dynamic block.
 *
 * Replaces the static "Share this story" related-story <ul> (hardcoded links to
 * other magazine articles — stale, and sometimes self-referential in the source)
 * with a single-cell `related-articles` block marker. The authored "Share this
 * story" <h5> heading is kept as default content immediately before it, so the
 * magazine-article two-column layout (scripts.js) still detects the sidebar via
 * that heading and the block renders only the list.
 *
 * The companion editorial "Publish Date" metadata is injected by the import
 * script (import-magazine-article.js) AFTER WebImporter.rules.createMetadata
 * builds the Metadata block — createMetadata only reads a fixed set of source
 * meta tags (title/description/og/twitter), so a custom field can't be added
 * via <head> here; it has to be appended to the generated block table.
 *
 * Runs against the imported DOM (WebImporter tables + default content), so the
 * related list is a plain <ul> of <a href=".../magazine/..."> at this stage.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

/** Create a single-cell block marker table: header row = block name. */
function createMarker(document, name) {
  return WebImporter.DOMUtils.createTable([[name]], document);
}

/**
 * Replace the related-story <ul> (links to other magazine articles) with a
 * `related-articles` marker, keeping the "Share this story" heading before it.
 */
function swapRelatedList(element, document) {
  const lists = [...element.querySelectorAll('ul')];
  const relatedList = lists.find((ul) => ul.querySelector('a[href*="/magazine/"]'));
  if (relatedList) relatedList.replaceWith(createMarker(document, 'related-articles'));
}

export default function transform(hookName, element, payload) {
  if (hookName !== TransformHook.afterTransform) return;

  const url = (payload.params && payload.params.originalURL) || payload.url || '';
  const path = (() => {
    try { return new URL(url).pathname; } catch (e) { return String(url); }
  })();

  // Guard to magazine ARTICLE pages (/us/en/magazine/<slug>) — never the
  // magazine listing or any other template. Makes the transformer a safe no-op
  // if ever invoked elsewhere.
  if (!/\/magazine\/[^/.]+(\.html)?$/.test(path)) return;

  swapRelatedList(element, payload.document);
}
