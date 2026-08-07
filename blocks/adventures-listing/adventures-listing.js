import { toClassName, createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Map the raw indexed category (an adventure's "Activity" spec) to the filter
 * tab labels used on the source (wknd.site: All, Climbing, Cycling, Skiing,
 * Surfing, Travel). Activities not listed keep their own name. This groups the
 * long-tail activities (Camping, Social) under "Travel" and normalises
 * "Rock Climbing" to "Climbing", matching the source's tab set.
 */
const CATEGORY_LABELS = {
  'Rock Climbing': 'Climbing',
  Camping: 'Travel',
  Social: 'Travel',
};

/** Resolve an adventure's indexed category to its display tab label. */
function tabLabel(category) {
  const cat = (category || '').trim();
  return CATEGORY_LABELS[cat] || cat;
}

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
 * Build a single adventure card (<li>) from an index entry.
 */
function buildCard(item) {
  const li = document.createElement('li');

  const imageLink = document.createElement('a');
  imageLink.className = 'adventures-listing-card-image';
  imageLink.href = withPrefix(item.path);
  if (item.image) {
    const pic = createOptimizedPicture(item.image, item.title, false, [{ width: '750' }]);
    imageLink.append(pic);
  }

  const body = document.createElement('div');
  body.className = 'adventures-listing-card-body';

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
 * Build the list (<ul>) of cards for a set of items.
 */
function buildCardList(items) {
  const ul = document.createElement('ul');
  items.forEach((item) => ul.append(buildCard(item)));
  return ul;
}

/**
 * loads and decorates the adventures-listing block.
 *
 * Reproduces the source's dynamic "Current Adventures" grid: it queries the
 * published index for adventure detail pages and renders a card grid with a
 * category filter (All + each distinct indexed category). New adventure pages
 * appear automatically once indexed — no re-authoring of this page needed.
 *
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  block.textContent = '';

  const data = await loadIndex();
  // Adventure detail pages: under /us/en/adventures/ but not the listing itself.
  const adventures = data
    .filter((item) => /\/us\/en\/adventures\/[^/]+$/.test(item.path))
    .sort((a, b) => (a.title || '').localeCompare(b.title || ''));

  if (!adventures.length) {
    // Index not yet published (e.g. brand-new environment). Leave the block
    // empty rather than rendering an empty shell.
    return;
  }

  // Distinct category tab labels (mapped to the source's set), alphabetical.
  const categories = [...new Set(adventures
    .map((item) => tabLabel(item.category))
    .filter(Boolean))].sort();
  const tabs = ['All', ...categories];

  // Build the tablist.
  const tablist = document.createElement('div');
  tablist.className = 'adventures-listing-tabs';
  tablist.setAttribute('role', 'tablist');

  const panelsWrap = document.createElement('div');
  panelsWrap.className = 'adventures-listing-panels';

  const buttons = [];
  const panels = [];

  const activate = (index) => {
    buttons.forEach((btn, i) => {
      btn.setAttribute('aria-selected', i === index);
      btn.setAttribute('tabindex', i === index ? '0' : '-1');
    });
    panels.forEach((panel, i) => panel.setAttribute('aria-hidden', i !== index));
  };

  tabs.forEach((label, i) => {
    const id = toClassName(label);

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'adventures-listing-tab';
    button.id = `adv-tab-${id}`;
    button.textContent = label;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', `adv-panel-${id}`);
    button.setAttribute('aria-selected', i === 0);
    button.setAttribute('tabindex', i === 0 ? '0' : '-1');
    button.addEventListener('click', () => activate(i));
    buttons.push(button);
    tablist.append(button);

    const items = label === 'All'
      ? adventures
      : adventures.filter((item) => tabLabel(item.category) === label);
    const panel = document.createElement('div');
    panel.className = 'adventures-listing-panel';
    panel.id = `adv-panel-${id}`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', `adv-tab-${id}`);
    panel.setAttribute('aria-hidden', i !== 0);
    panel.append(buildCardList(items));
    panels.push(panel);
    panelsWrap.append(panel);
  });

  // Keyboard navigation (WAI-ARIA tabs pattern): arrows, Home, End.
  tablist.addEventListener('keydown', (e) => {
    const current = buttons.indexOf(document.activeElement);
    if (current === -1) return;
    let next = -1;
    if (e.key === 'ArrowRight') next = (current + 1) % buttons.length;
    else if (e.key === 'ArrowLeft') next = (current - 1 + buttons.length) % buttons.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = buttons.length - 1;
    if (next === -1) return;
    e.preventDefault();
    buttons[next].focus();
    activate(next);
  });

  // Grey separator line below the grid (matches the source's <hr> between the
  // Current Adventures grid and the footer).
  const separator = document.createElement('hr');
  separator.className = 'adventures-listing-separator';

  block.append(tablist, panelsWrap, separator);
}
