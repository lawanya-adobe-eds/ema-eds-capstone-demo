/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-people
 * Base block: cards
 * Source: https://wknd.site/us/en/about-us.html (WKND contributors page)
 * Generated: 2026-08-06
 *
 * Block convention (cards): 2 columns, multiple rows; first row = block name.
 * Each subsequent row = one card: [ image cell, text-content cell ].
 * For cards-people the text cell holds: name (h3, styled as heading),
 * role (h5), and the social links (Call-to-Action links).
 *
 * The block renderer (blocks/cards-people/cards-people.js) turns each block row
 * into one <li>: the single-<picture> cell becomes the card image and the other
 * cell becomes the card body (name h3 + role h5 + social-links <p>).
 *
 * WKND source layout: each contributor is a
 *   section.cmp-experience-fragment--contributor
 * containing, in document order:
 *   img (headshot), h3.cmp-title__text (name), h5.cmp-title__text (role),
 *   div.cmp-buildingblock--btn-list (Facebook / Twitter / Instagram links).
 * The 7 people are split across two groups ("Our Contributors" = 4 people,
 * "WKND Guides" = 3 people) whose <h2> headings + intro paragraphs are sibling
 * default content, NOT nested inside the per-person sections. All 7 people are
 * collected into ONE cards-people block (one row each) for completeness.
 *
 * This parser is SELECTOR-AGNOSTIC and resilient to layout variation:
 *  - Given a broad container (main / a contributors region / body) it collects
 *    ALL people within it into ONE cards-people block (one row each).
 *  - Given a single person wrapper it emits a one-row block for that person.
 *  - Primary person discovery uses the per-person wrapper; if people are NOT
 *    wrapped (siblings scattered in a layout grid) it falls back to pairing each
 *    headshot image with the following name/role/social links by DOCUMENT ORDER.
 */
export default function parse(element, { document }) {
  const NAME_SEL = 'h3.cmp-title__text, h3';
  const ROLE_SEL = 'h5.cmp-title__text, h5';
  const SOCIAL_LIST_SEL = '.cmp-buildingblock--btn-list, [class*="btn-list"]';
  const SOCIAL_LINK_SEL = '.cmp-buildingblock--btn-list a, [class*="btn-list"] a, [class*="social"] a';

  // Turn a set of source social anchors into one <p> of clean text links.
  // Use the anchor's VISIBLE text ("Facebook"/"Twitter"/"Instagram"); the
  // aria-label carries per-person handles ("Facebook <name> Social Media")
  // that are noise, and a decorative separator would add phantom tokens — so
  // links are appended with a plain space (CSS spaces them at render time).
  const buildSocialParagraph = (anchors) => {
    if (!anchors.length) return null;
    const p = document.createElement('p');
    anchors.forEach((a, i) => {
      const link = document.createElement('a');
      link.href = a.getAttribute('href') || '#';
      const visible = (a.textContent || '').replace(/\s+/g, ' ').trim();
      const label = visible || (a.getAttribute('aria-label') || '')
        .replace(/social media/i, '')
        .replace(/\s+/g, ' ')
        .trim();
      link.textContent = label || '#';
      if (i > 0) p.append(document.createTextNode(' '));
      p.append(link);
    });
    return p;
  };

  // Build the text-content cell (name + role + social links) for one person.
  const buildBody = (scope) => {
    const body = [];
    const name = scope.querySelector(NAME_SEL);
    if (name) body.push(name);
    const role = scope.querySelector(ROLE_SEL);
    if (role) body.push(role);
    const social = buildSocialParagraph(Array.from(scope.querySelectorAll(SOCIAL_LINK_SEL)));
    if (social) body.push(social);
    return body;
  };

  // Build one [image, body] row from a person scope. Returns null if empty.
  const buildRow = (scope) => {
    const image = scope.querySelector('picture, img');
    const body = buildBody(scope);
    if (!image && body.length === 0) return null;
    return [image || '', body.length ? body : ''];
  };

  const cells = [];

  // --- 1. Primary discovery: WKND per-person experience-fragment wrappers ----
  let personEls = Array.from(
    element.querySelectorAll('section.cmp-experience-fragment--contributor'),
  );
  // The element passed in may itself be a single person wrapper.
  if (
    personEls.length === 0
    && typeof element.matches === 'function'
    && element.matches('section.cmp-experience-fragment--contributor')
  ) {
    personEls = [element];
  }

  if (personEls.length > 0) {
    personEls.forEach((person) => {
      const row = buildRow(person);
      if (row) cells.push(row);
    });
  } else {
    // --- 2. Fallback: pair by DOCUMENT ORDER (people not wrapped) ------------
    // Walk the element in document order; each headshot image starts a new
    // person, and the following name (h3), role (h5) and social links attach
    // to it until the next headshot.
    const markers = Array.from(
      element.querySelectorAll(`img, h3, h5, ${SOCIAL_LIST_SEL}`),
    );
    let current = null;
    const flush = () => {
      if (!current) return;
      const body = [];
      if (current.name) body.push(current.name);
      if (current.role) body.push(current.role);
      const social = buildSocialParagraph(current.social);
      if (social) body.push(social);
      if (current.image || body.length) {
        cells.push([current.image || '', body.length ? body : '']);
      }
      current = null;
    };
    markers.forEach((el) => {
      if (el.tagName === 'IMG') {
        // A social-list may contain <img> icons — ignore those.
        if (el.closest(SOCIAL_LIST_SEL)) return;
        flush();
        current = { image: el, name: null, role: null, social: [] };
      } else if (!current) {
        // skip stray markers before the first headshot
      } else if (el.tagName === 'H3' && !current.name) {
        current.name = el;
      } else if (el.tagName === 'H5' && !current.role) {
        current.role = el;
      } else if (el.matches(SOCIAL_LIST_SEL)) {
        current.social.push(...Array.from(el.querySelectorAll('a')));
      }
    });
    flush();
  }

  // --- Empty-block guard -----------------------------------------------------
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-people', cells });
  element.replaceWith(block);
}
