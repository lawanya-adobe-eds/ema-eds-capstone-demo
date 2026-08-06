/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WKND site-wide cleanup.
 *
 * Removes non-authorable global chrome so the import contains only page-level
 * authorable content. All selectors below were verified against the captured
 * DOM in migration-work/cleaned.html.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.afterTransform) {
    WebImporter.DOMUtils.remove(element, [
      // Global header experience fragment (logo, main nav, language nav, search)
      // cleaned.html line 5: <header class="experiencefragment cmp-experiencefragment--header ...">
      'header',
      // Global footer experience fragment (logo, footer nav, social buttons, copyright)
      // cleaned.html line 471: <footer class="experiencefragment cmp-experiencefragment--footer ...">
      'footer',
      // Adobe ID syncing / demdex tracking iframe
      // cleaned.html line 566: <iframe id="destination_publishing_iframe_wkndsite_0" ...>
      'iframe',
      // Mobile nav toggle button (site chrome)
      // cleaned.html line 568: <div id="toggleNav">
      '#toggleNav',
      // Mobile navigation overlay (duplicate of header nav)
      // cleaned.html line 574: <div id="mobileNav" class="cmp-navigation--mobile">
      '#mobileNav',
      // Stray empty <meta> tags left inside cmp-image blocks
      // cleaned.html lines 183, 204, 227, 271, 334, 378
      'meta',
    ]);
  }
}
