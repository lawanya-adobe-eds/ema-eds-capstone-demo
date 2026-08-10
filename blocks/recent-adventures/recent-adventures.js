import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * recent-adventures — the homepage "Where do you want to go?" grid, made dynamic.
 *
 * Mirrors the recent-articles block, but for adventure detail pages: it fetches
 * the published query index (/us/en/query-index.json) and renders a capped set
 * of adventure cards. New adventure pages appear automatically once indexed — no
 * re-authoring of the homepage needed. Visual design matches the wknd.site source
 * grid (the same image-list component as Recent Articles): 260x200 image tiles, a
 * blue sentence-case title link, a single-line grey description, and a 4-up grid.
 */

// How many cards the homepage shows (matches the source's curated count).
const LIMIT = 4;

/** Resolve the query-index path for both local dev (/content) and production. */
function getIndexPath() {
  const base = window.location.pathname.startsWith('/content/') ? '/content/us/en' : '/us/en';
  return `${base}/query-index.json`;
}

/** Prefix internal paths for local dev (content served under /content). */
function withPrefix(path) {
  const prefix = window.location.pathname.startsWith('/content/') ? '/content' : '';
  return `${prefix}${path}`;
}

/** Fetch the published query index (cached across blocks on the page). */
async function loadIndex() {
  if (!window.wkndQueryIndex) {
    window.wkndQueryIndex = fetch(getIndexPath())
      .then((res) => (res.ok ? res.json() : { data: [] }))
      .then((json) => json.data || [])
      .catch(() => []);
  }
  return window.wkndQueryIndex;
}

/** Build a single adventure card (<li>) from an index entry. */
function buildCard(item) {
  const li = document.createElement('li');

  const imageLink = document.createElement('a');
  imageLink.className = 'recent-adventures-card-image';
  imageLink.href = withPrefix(item.path);
  if (item.image) {
    const pic = createOptimizedPicture(item.image, item.title, false, [{ width: '750' }]);
    // Reserve layout space to prevent CLS. Card image renders at a fixed 200px
    // height, full-width, object-fit:cover; 260x200 matches the source card
    // ratio — sizing hint only, no visual change.
    const img = pic.querySelector('img');
    img.setAttribute('width', '260');
    img.setAttribute('height', '200');
    imageLink.append(pic);
  }

  const body = document.createElement('div');
  body.className = 'recent-adventures-card-body';

  const title = document.createElement('h3');
  const titleLink = document.createElement('a');
  titleLink.href = withPrefix(item.path);
  titleLink.textContent = item.title || item.path;
  title.append(titleLink);

  const desc = document.createElement('p');
  desc.textContent = item.description || '';

  body.append(title, desc);
  if (item.image) li.append(imageLink);
  li.append(body);
  return li;
}

/**
 * loads and decorates the recent-adventures block.
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  block.textContent = '';

  const data = await loadIndex();
  // Adventure detail pages: under /us/en/adventures/ but not the listing itself.
  const adventures = data
    .filter((item) => /\/us\/en\/adventures\/[^/]+$/.test(item.path))
    .sort((a, b) => (a.title || '').localeCompare(b.title || ''))
    .slice(0, LIMIT);

  if (!adventures.length) return;

  const ul = document.createElement('ul');
  adventures.forEach((item) => ul.append(buildCard(item)));
  block.append(ul);
}
