import { toClassName, createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Resolve the query-index path for both local dev (/content) and production.
 */
function getIndexPath() {
  const base = window.location.pathname.startsWith('/content/') ? '/content/us/en' : '/us/en';
  return `${base}/query-index.json`;
}

/**
 * Prefix internal paths for local dev (content served under /content).
 */
function withPrefix(path) {
  const prefix = window.location.pathname.startsWith('/content/') ? '/content' : '';
  return `${prefix}${path}`;
}

/**
 * Fetch the published query index (cached across blocks on the page).
 */
async function loadIndex() {
  if (!window.wkndQueryIndex) {
    window.wkndQueryIndex = fetch(getIndexPath())
      .then((res) => (res.ok ? res.json() : { data: [] }))
      .then((json) => json.data || [])
      .catch(() => []);
  }
  return window.wkndQueryIndex;
}

/**
 * Build a single article card (<li>) from an index entry.
 */
function buildCard(item) {
  const li = document.createElement('li');

  const imageLink = document.createElement('a');
  imageLink.className = 'magazine-listing-card-image';
  imageLink.href = withPrefix(item.path);
  if (item.image) {
    const pic = createOptimizedPicture(item.image, item.title, false, [{ width: '750' }]);
    // Reserve layout space to prevent CLS. Card image renders at a fixed 200px
    // height, full-width, object-fit:cover; 260x200 matches the card ratio —
    // sizing hint only, no visual change.
    const img = pic.querySelector('img');
    img.setAttribute('width', '260');
    img.setAttribute('height', '200');
    imageLink.append(pic);
  }

  const body = document.createElement('div');
  body.className = 'magazine-listing-card-body';

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
 * loads and decorates the magazine-listing block.
 *
 * Reproduces the source's dynamic "All Articles" grid: queries the published
 * index for magazine article pages and renders a card grid. New articles appear
 * automatically once indexed — no re-authoring of this page needed. An optional
 * heading can be authored in the block's first cell; it is rendered above the grid.
 *
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  // An optional single-cell heading (e.g. "All Articles") may be authored.
  const authoredHeading = block.textContent.trim();
  block.textContent = '';

  const data = await loadIndex();
  // Magazine article pages: under /us/en/magazine/ but not the listing itself.
  const articles = data
    .filter((item) => /\/us\/en\/magazine\/[^/]+$/.test(item.path))
    .sort((a, b) => (a.title || '').localeCompare(b.title || ''));

  if (!articles.length) return;

  if (authoredHeading) {
    const h = document.createElement('h2');
    h.id = toClassName(authoredHeading);
    h.textContent = authoredHeading;
    block.append(h);
  }

  const ul = document.createElement('ul');
  articles.forEach((item) => ul.append(buildCard(item)));
  block.append(ul);
}
