/**
 * related-articles — the magazine article "Share this story" sidebar list, made
 * dynamic.
 *
 * The source hardcodes a per-article list of links to other magazine articles
 * (title + editorial date). That list was stale and duplicated across pages
 * (some articles even linked to themselves). This block instead fetches the
 * published magazine index (/us/en/magazine/query-index.json), takes the most recent
 * magazine articles, EXCLUDES the current page, caps the count, and renders the
 * same title-over-date list the source shows.
 *
 * Markup contract — the block marker is empty; the authored "Share this story"
 * <h5> stays as default content immediately before it (so the magazine-article
 * layout in scripts.js keeps detecting the sidebar via that heading). The block
 * renders only the <ul>, matching the decorated DOM scripts.js used to build by
 * hand, so styles/styles.css (`.magazine-article-share`) applies unchanged:
 *
 *   <ul>
 *     <li><a href="..."><span class="...-title">Title</span>
 *                       <span class="...-date">Weekday, DD Mon YYYY</span></a></li>
 *   </ul>
 *
 * If the marker DOES carry cell text, that text is rendered as an <h5> heading
 * (self-contained fallback for use outside the magazine-article layout).
 */

// How many related stories to show (matches the source's list length).
const LIMIT = 4;

/** Resolve the magazine section index path (dev-aware). */
function getIndexPath() {
  const base = window.location.pathname.startsWith('/content/') ? '/content/us/en' : '/us/en';
  return `${base}/magazine/query-index.json`;
}

/** Prefix internal paths for local dev (content served under /content). */
function withPrefix(path) {
  const prefix = window.location.pathname.startsWith('/content/') ? '/content' : '';
  return `${prefix}${path}`;
}

/** Fetch a published query index, cached per-path across blocks on the page. */
async function loadIndex() {
  const path = getIndexPath();
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
 * Format a publish date as the source shows it: "Weekday, D Mon YYYY"
 * (e.g. "Thursday, 9 Jul 2020"). Accepts an ISO date (YYYY-MM-DD) from the
 * index; returns '' if absent or unparseable so the date line is simply omitted.
 */
function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return '';
  const weekday = d.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
  const day = d.getUTCDate();
  const month = d.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
  const year = d.getUTCFullYear();
  return `${weekday}, ${day} ${month} ${year}`;
}

/** Build one related-story list item matching the decorated source markup. */
function buildItem(item) {
  const li = document.createElement('li');
  const link = document.createElement('a');
  link.href = withPrefix(item.path);

  const title = document.createElement('span');
  title.className = 'magazine-article-share-title';
  title.textContent = item.title || item.path;
  link.append(title);

  const dateText = formatDate(item.publishDate);
  if (dateText) {
    const date = document.createElement('span');
    date.className = 'magazine-article-share-date';
    date.textContent = dateText;
    link.append(date);
  }

  li.append(link);
  return li;
}

/**
 * loads and decorates the related-articles block.
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  // Optional heading: only if the marker carries cell text (fallback use). In
  // the magazine-article layout the authored <h5> sits before the block, so the
  // marker is empty and no heading is rendered here.
  const heading = block.textContent.trim();
  block.textContent = '';

  const currentPath = window.location.pathname.replace(/^\/content/, '').replace(/\.html$/, '');

  const data = await loadIndex();
  const articles = data
    .filter((it) => /\/us\/en\/magazine\/[^/]+$/.test(it.path))
    .filter((it) => it.path !== currentPath)
    // Most recent first when a publish date is indexed; undated fall to the end.
    .sort((a, b) => (b.publishDate || '').localeCompare(a.publishDate || ''))
    .slice(0, LIMIT);

  if (!articles.length) return;

  if (heading) {
    const h5 = document.createElement('h5');
    h5.textContent = heading;
    block.append(h5);
  }

  const ul = document.createElement('ul');
  articles.forEach((item) => ul.append(buildItem(item)));

  block.append(ul);
}
