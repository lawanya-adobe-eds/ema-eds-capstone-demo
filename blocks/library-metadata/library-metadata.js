/**
 * library-metadata — a no-op block used only by block-library demo documents.
 *
 * The Sidekick / DA Block Library reads the name + description authored in this
 * block's table to label each block entry. On the rendered site it carries no
 * visual meaning, so we simply remove it (and its section wrapper if it becomes
 * empty). Shipping this block avoids the "failed to load block library-metadata"
 * console error on the /blocks/* demo pages.
 * @param {Element} block
 */
export default function decorate(block) {
  const section = block.closest('.section');
  block.remove();
  if (section && !section.children.length) section.remove();
}
