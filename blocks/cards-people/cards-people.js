import { createOptimizedPicture } from '../../scripts/aem.js';

// Inline SVG icons for social links (the source uses a proprietary icon font;
// we substitute standard, portable inline SVGs keyed by the detected network).
// Mirrors the footer's approach so social marks are consistent site-wide.
const SOCIAL_ICONS = {
  facebook: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z"/></svg>',
  twitter: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M23 4.9c-.8.36-1.66.6-2.56.71a4.48 4.48 0 0 0 1.96-2.47 8.94 8.94 0 0 1-2.83 1.08 4.46 4.46 0 0 0-7.6 4.07A12.66 12.66 0 0 1 2.79 3.6a4.46 4.46 0 0 0 1.38 5.95c-.72-.02-1.4-.22-1.99-.55v.06a4.46 4.46 0 0 0 3.58 4.37c-.67.18-1.37.2-2.05.08a4.47 4.47 0 0 0 4.17 3.1A8.94 8.94 0 0 1 1 19.54 12.61 12.61 0 0 0 7.83 21.5c8.2 0 12.68-6.79 12.68-12.68l-.01-.58A9.05 9.05 0 0 0 23 4.9z"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.72 3.72 0 0 1-1.38-.9 3.72 3.72 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 1.44c-3.15 0-3.5.01-4.74.07-1.15.05-1.77.24-2.19.4-.55.22-.94.47-1.35.88-.41.41-.66.8-.88 1.35-.16.42-.35 1.04-.4 2.19-.06 1.24-.07 1.59-.07 4.74s.01 3.5.07 4.74c.05 1.15.24 1.77.4 2.19.22.55.47.94.88 1.35.41.41.8.66 1.35.88.42.16 1.04.35 2.19.4 1.24.06 1.59.07 4.74.07s3.5-.01 4.74-.07c1.15-.05 1.77-.24 2.19-.4.55-.22.94-.47 1.35-.88.41-.41.66-.8.88-1.35.16-.42.35-1.04.4-2.19.06-1.24.07-1.59.07-4.74s-.01-3.5-.07-4.74c-.05-1.15-.24-1.77-.4-2.19a3.63 3.63 0 0 0-.88-1.35 3.63 3.63 0 0 0-1.35-.88c-.42-.16-1.04-.35-2.19-.4-1.24-.06-1.59-.07-4.74-.07zm0 3.68a4.72 4.72 0 1 0 0 9.44 4.72 4.72 0 0 0 0-9.44zm0 7.79a3.07 3.07 0 1 1 0-6.14 3.07 3.07 0 0 1 0 6.14zm6.01-7.98a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0z"/></svg>',
};

/** Detect the social network for a link from its href/label text. */
function socialKeyFromLink(link) {
  const hay = `${link.getAttribute('href') || ''} ${link.textContent}`.toLowerCase();
  if (hay.includes('facebook')) return 'facebook';
  if (hay.includes('twitter')) return 'twitter';
  if (hay.includes('insta')) return 'instagram';
  return null;
}

/** Turn a card body's text social links into labelled inline-SVG icon links. */
function iconizeSocialLinks(scope) {
  scope.querySelectorAll('.cards-people-card-body a').forEach((link) => {
    const key = socialKeyFromLink(link);
    if (key && SOCIAL_ICONS[key]) {
      link.setAttribute('aria-label', link.getAttribute('aria-label') || link.textContent.trim() || key);
      link.classList.add('cards-people-social-icon');
      link.innerHTML = SOCIAL_ICONS[key];
    }
  });
}

/** Optimize a card image and give it explicit dimensions to prevent CLS. */
function optimizePicture(pic) {
  const img = pic.querySelector('img');
  if (!img) return;
  const optimized = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
  // Square (1:1) sizing hint matches the CSS (aspect-ratio:1/1; object-fit:cover).
  const newImg = optimized.querySelector('img');
  newImg.setAttribute('width', '164');
  newImg.setAttribute('height', '164');
  pic.replaceWith(optimized);
}

/**
 * Decorate authored rows in place (default mode). Each block is one person:
 * [image, body(name + role + social links)].
 */
function decorateAuthored(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-people-card-image';
      } else {
        div.className = 'cards-people-card-body';
      }
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture').forEach(optimizePicture);
  iconizeSocialLinks(ul);
  block.textContent = '';
  block.append(ul);
}

/** Resolve the people index path for both local dev (/content) and production. */
function getIndexPath() {
  const base = window.location.pathname.startsWith('/content/') ? '/content/us/en' : '/us/en';
  return `${base}/about-us/people-index.json`;
}

/**
 * Detect dynamic mode: a single cell reading "dynamic <group>" (e.g.
 * "dynamic contributors"). Returns the group name, or null for authored mode.
 */
function getDynamicGroup(block) {
  if (block.children.length !== 1) return null;
  const cell = block.querySelector(':scope > div > div');
  if (!cell) return null;
  const text = cell.textContent.trim();
  const m = /^dynamic\s+(\S+)/i.exec(text);
  return m ? m[1].toLowerCase() : null;
}

/** Build one person card <li> from an index row. */
function buildCard(item) {
  const li = document.createElement('li');

  const imageDiv = document.createElement('div');
  imageDiv.className = 'cards-people-card-image';
  if (item.image) {
    const pic = createOptimizedPicture(item.image, item.name || '', false, [{ width: '750' }]);
    const img = pic.querySelector('img');
    img.setAttribute('width', '164');
    img.setAttribute('height', '164');
    imageDiv.append(pic);
  }

  const body = document.createElement('div');
  body.className = 'cards-people-card-body';
  const name = document.createElement('h3');
  name.textContent = item.name || '';
  const role = document.createElement('h5');
  role.textContent = item.role || '';
  body.append(name, role);

  // Social links row — only render links that have a real href.
  const socials = [['facebook', item.facebook], ['twitter', item.twitter], ['instagram', item.instagram]]
    .filter(([, href]) => href);
  if (socials.length) {
    const p = document.createElement('p');
    socials.forEach(([net, href]) => {
      const a = document.createElement('a');
      a.href = href;
      a.textContent = net.charAt(0).toUpperCase() + net.slice(1);
      p.append(a, document.createTextNode(' '));
    });
    body.append(p);
  }

  li.append(imageDiv, body);
  return li;
}

/**
 * Render a people grid from index rows for one group, ordered by `order`.
 * Rows without a group or order are dropped (this filters out the About Us
 * landing page, which the index glob /us/en/about-us/** also matches).
 */
function renderFromIndex(block, rows, group) {
  const people = rows
    .filter((r) => r.name && r.group === group && String(r.order || '').trim() !== '')
    .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

  const ul = document.createElement('ul');
  people.forEach((item) => ul.append(buildCard(item)));
  iconizeSocialLinks(ul);

  block.textContent = '';
  block.classList.add('cards-people-grid');
  block.append(ul);
}

/**
 * loads and decorates the cards-people block
 * @param {Element} block The cards-people block element
 */
export default async function decorate(block) {
  const group = getDynamicGroup(block);

  if (!group) {
    decorateAuthored(block);
    return;
  }

  try {
    const res = await fetch(getIndexPath());
    const json = res.ok ? await res.json() : null;
    const rows = json && Array.isArray(json.data) ? json.data : [];
    if (rows.some((r) => r.group === group)) {
      renderFromIndex(block, rows, group);
      return;
    }
  } catch (e) {
    // fall through to graceful cleanup below
  }
  // Index unavailable/empty for this group: clear the placeholder marker.
  block.textContent = '';
}
