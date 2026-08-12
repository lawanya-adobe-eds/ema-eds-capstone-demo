import { toClassName, createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Default magazine section index path (dev-aware), used when no index path is
 * authored in the block.
 */
function defaultIndexPath() {
  const base = window.location.pathname.startsWith('/content/') ? '/content/us/en' : '/us/en';
  return `${base}/magazine/query-index.json`;
}

/**
 * Resolve an authored index path (dev-aware): absolute URLs pass through;
 * root-absolute paths get the /content prefix on local dev.
 */
function resolveIndexPath(raw) {
  if (!raw) return defaultIndexPath();
  if (/^https?:\/\//i.test(raw)) return raw;
  const prefix = window.location.pathname.startsWith('/content/') && raw.startsWith('/') ? '/content' : '';
  return `${prefix}${raw}`;
}

/**
 * Prefix internal paths for local dev (content served under /content).
 */
function withPrefix(path) {
  const prefix = window.location.pathname.startsWith('/content/') ? '/content' : '';
  return `${prefix}${path}`;
}

/**
 * Fetch a published query index, cached per-path across blocks on the page.
 */
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
 * automatically once indexed. Authoring (each is its own block row):
 *   - an optional heading (e.g. "All Articles"), rendered above the grid, and
 *   - an optional index path (a cell containing a ".json" path, e.g.
 *     "/us/en/magazine/query-index.json"), matching the adventures-listing
 *     config-cell pattern. If omitted, the default magazine index is used.
 *
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  // Read the authored rows: a cell containing a ".json" path is the index
  // source; any other non-empty cell text is treated as the heading.
  let authoredHeading = '';
  let authoredPath = '';
  [...block.children].forEach((row) => {
    const text = (row.textContent || '').trim();
    if (!text) return;
    if (/\.json(\?|$)/i.test(text)) authoredPath = text;
    else if (!authoredHeading) authoredHeading = text;
  });
  block.textContent = '';

  const data = await loadIndex(resolveIndexPath(authoredPath));
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
