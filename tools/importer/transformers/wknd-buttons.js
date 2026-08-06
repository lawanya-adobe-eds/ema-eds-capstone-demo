/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WKND primary-button promotion.
 *
 * On the source, list CTAs like "All Articles" / "All Trips" render as
 * <a class="cmp-button"> inside a <div class="button cmp-button--primary">
 * container (a solid yellow WKND pill). Plain <a> links, once imported, become
 * <p><a>…</a></p> and EDS renders them as ordinary text links.
 *
 * To make EDS promote them to `.button.primary` (styled as the yellow pill in
 * styles.css), we wrap the anchor in <strong> during import — EDS's
 * decorateButtons() treats a lone <strong><a> as a primary button. Secondary
 * (cmp-button--secondary) links are wrapped in <em>.
 *
 * Runs on beforeTransform, while the original cmp-button--primary/secondary
 * container classes are still present on the source DOM.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

function wrapButtons(element, containerSelector, wrapperTag) {
  element.querySelectorAll(containerSelector).forEach((container) => {
    const link = container.querySelector('a');
    if (!link || link.closest('strong, em')) return;
    const wrapper = element.ownerDocument.createElement(wrapperTag);
    link.parentNode.insertBefore(wrapper, link);
    wrapper.appendChild(link);
  });
}

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    wrapButtons(element, '.cmp-button--primary', 'strong');
    wrapButtons(element, '.cmp-button--secondary', 'em');
  }
}
