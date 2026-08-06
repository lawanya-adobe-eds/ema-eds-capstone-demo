/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WKND "Members Only" secure teasers -> cards-teaser grid.
 *
 * Problem: On landing/overview pages (e.g. https://wknd.site/us/en/magazine.html)
 * the "Members Only" section contains one or more secure teaser cards, each:
 *   div.teaser.cmp-teaser--secure
 *     div.cmp-teaser
 *       div.cmp-teaser__content
 *         h2.cmp-teaser__title            (card title, e.g. "Alaskan Adventure")
 *         div.cmp-teaser__description      (description, sometimes wrapping a <p>)
 *         div.cmp-teaser__action-container ("Read More" - members-gated, NO href)
 *       div.cmp-teaser__image
 *         div.cmp-image > img              (card image)
 *
 * Without this transformer the secure teasers flatten to default content
 * (<h2>title</h2><p>desc</p><p>Read More</p><p><picture></picture></p>), losing
 * the card layout.
 *
 * This transformer runs in beforeTransform and rewrites ALL secure teasers on the
 * page into a SINGLE "cards-teaser" block table (one row per card, cells
 * [image, textContent]) so they render as a card grid matching the site's other
 * card grids. Because it emits the FINAL block table and removes the source
 * teasers, the downstream cards-teaser parser selector
 * (div.teaser.cmp-teaser--secure) no longer matches and cannot double-process.
 *
 * All selectors verified against migration-work/cleaned.html (magazine.html),
 * lines 291-330.
 *
 * Generic: no-op on pages without div.teaser.cmp-teaser--secure (e.g. about-us).
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

// A usable card link: must exist and not be an empty/placeholder/gated anchor.
function getValidHref(teaser) {
  const anchor = teaser.querySelector(
    '.cmp-teaser__title a[href], .cmp-teaser__action-container a[href], a[href]',
  );
  if (!anchor) return null;
  const href = (anchor.getAttribute('href') || '').trim();
  if (!href || href === '#' || href.toLowerCase().startsWith('javascript:')) return null;
  return href;
}

// Build the [image, textContent] cell pair for a single secure teaser.
function buildCardRow(teaser, doc) {
  // Image cell: the teaser image (fall back to any img inside the teaser).
  const image = teaser.querySelector('.cmp-teaser__image img, .cmp-image img, img');

  const textCell = [];

  // Title -> <h3>. Wrap in a link ONLY if the teaser has a real href.
  // Secure/members-gated teasers have no href, so this yields a plain <h3>.
  const titleEl = teaser.querySelector('.cmp-teaser__title');
  const titleText = titleEl ? titleEl.textContent.trim() : '';
  if (titleText) {
    const heading = doc.createElement('h3');
    const href = getValidHref(teaser);
    if (href) {
      const link = doc.createElement('a');
      link.href = href;
      link.textContent = titleText;
      heading.append(link);
    } else {
      heading.textContent = titleText;
    }
    textCell.push(heading);
  }

  // Description -> <p>. The description is sometimes a div wrapping a <p>
  // (teaser 1) and sometimes a div holding raw text (teaser 2); normalise both.
  const descEl = teaser.querySelector('.cmp-teaser__description');
  if (descEl) {
    const innerP = descEl.querySelector('p');
    if (innerP && innerP.textContent.trim()) {
      textCell.push(innerP);
    } else {
      const descText = descEl.textContent.trim();
      if (descText) {
        const p = doc.createElement('p');
        p.textContent = descText;
        textCell.push(p);
      }
    }
  }

  // "Read More" (.cmp-teaser__action-container) is intentionally dropped: it is
  // members-gated with no real link, so it carries no authorable value here.

  if (!image && textCell.length === 0) return null;
  return [image || '', textCell.length > 0 ? textCell : ''];
}

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    const teasers = Array.from(element.querySelectorAll('div.teaser.cmp-teaser--secure'));
    if (teasers.length === 0) return;

    // Derive the document from the element so this never depends on a global.
    const doc = element.ownerDocument || (payload && payload.document);
    if (!doc) return;

    const cells = [];
    teasers.forEach((teaser) => {
      const row = buildCardRow(teaser, doc);
      if (row) cells.push(row);
    });

    if (cells.length === 0) return;

    // Emit the final block table where the first secure teaser was, then remove
    // all source teasers so the cards-teaser parser can't re-match them.
    const block = WebImporter.Blocks.createBlock(doc, { name: 'cards-teaser', cells });
    const first = teasers[0];
    if (first.parentNode) {
      first.parentNode.insertBefore(block, first);
    }
    teasers.forEach((teaser) => teaser.remove());
  }
}
