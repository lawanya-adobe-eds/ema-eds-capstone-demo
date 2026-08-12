import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * recent-adventures — the homepage "Where do you want to go?" grid, made dynamic.
 *
 * Mirrors the recent-articles block, but for adventure detail pages: it fetches
 * the published adventures index (/us/en/adventures/query-index.json) and renders a capped set
 * of adventure cards. New adventure pages appear automatically once indexed — no
 * re-authoring of the homepage needed. Visual design matches the wknd.site source
 * grid (the same image-list component as Recent Articles): 260x200 image tiles, a
 * blue sentence-case title link, a single-line grey description, and a 4-up grid.
 */

// How many cards the homepage shows (matches the source's curated count).
const LIMIT = 4;

/** Default adventures section index path (dev-aware), used when no cell authored. */
function defaultIndexPath() {
  const base = window.location.pathname.startsWith('/content/') ? '/content/us/en' : '/us/en';
  return `${base}/adventures/query-index.json`;
}

/**
 * Resolve the index path from the block's authored config cell (a cell holding
 * the index path, e.g. /us/en/adventures/query-index.json), matching the
 * adventures-listing pattern. Falls back to the default adventures section index
 * when no cell is authored. Dev-aware (/content prefix for root-absolute paths).
 */
function getIndexPath(block) {
  const cell = block.querySelector(':scope > div > div');
  const raw = cell ? cell.textContent.trim() : '';
  if (!raw) return defaultIndexPath();
  if (/^https?:\/\//i.test(raw)) return raw;
  const prefix = window.location.pathname.startsWith('/content/') && raw.startsWith('/') ? '/content' : '';
  return `${prefix}${raw}`;
}

/** Prefix internal paths for local dev (content served under /content). */
function withPrefix(path) {
  const prefix = window.location.pathname.startsWith('/content/') ? '/content' : '';
  return `${prefix}${path}`;
}

/** Fetch a published query index, cached per-path across blocks on the page. */
async function loadIndex(path) {
  window.wkndIndexCache = window.wkndIndexCache || {};
  if (!window.wkndIndexCache[path]) {
    window.wkndIndexCache[path] = fetch(path)
      .then((res) => (res.ok ? res.json() : { data: [] }))
      .then((json) => json.data || [])
      .catch(() => []);
  }
  return window.wkndIndexCache[path];
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
  // Read the authored index path from the config cell BEFORE clearing the block.
  const indexPath = getIndexPath(block);
  block.textContent = '';

  const data = await loadIndex(indexPath);
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
