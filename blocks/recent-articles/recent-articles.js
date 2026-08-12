import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * recent-articles — the homepage "Recent Articles" grid, made dynamic.
 *
 * The source builds this grid at request time from a repository query. EDS has
 * no server-side query engine, so this block fetches the published query index
 * (/us/en/magazine/query-index.json) and renders a capped set of article cards.
 * New articles appear automatically once indexed — no re-authoring of the
 * homepage needed. Visual design matches the cards-teaser block it replaces
 * (13:10 image tiles, uppercase title, single-line grey description, 4-up grid).
 */

// How many cards the homepage shows (matches the source's curated count).
const LIMIT = 4;

/** Default magazine section index path (dev-aware), used when no cell authored. */
function defaultIndexPath() {
  const base = window.location.pathname.startsWith('/content/') ? '/content/us/en' : '/us/en';
  return `${base}/magazine/query-index.json`;
}

/**
 * Resolve the index path from the block's authored config cell (a cell holding
 * the index path, e.g. /us/en/magazine/query-index.json), matching the
 * adventures-listing pattern. Falls back to the default magazine section index
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

/** Build a single article card (<li>) from an index entry. */
function buildCard(item) {
  const li = document.createElement('li');

  const imageLink = document.createElement('a');
  imageLink.className = 'recent-articles-card-image';
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
  body.className = 'recent-articles-card-body';

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
 * loads and decorates the recent-articles block.
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  // Read the authored index path from the config cell BEFORE clearing the block.
  const indexPath = getIndexPath(block);
  block.textContent = '';

  const data = await loadIndex(indexPath);
  // Magazine article pages: under /us/en/magazine/ but not the listing itself.
  const articles = data
    .filter((item) => /\/us\/en\/magazine\/[^/]+$/.test(item.path))
    .slice(0, LIMIT);

  if (!articles.length) return;

  const ul = document.createElement('ul');
  articles.forEach((item) => ul.append(buildCard(item)));
  block.append(ul);
}
