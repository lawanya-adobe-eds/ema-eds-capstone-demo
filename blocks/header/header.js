import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates desktop width
const isDesktop = window.matchMedia('(min-width: 900px)');

/**
 * Close the locale dropdown when clicking outside it.
 */
function closeLocaleOnOutsideClick(e, localeWrapper) {
  if (!localeWrapper.contains(e.target)) {
    localeWrapper.setAttribute('aria-expanded', 'false');
  }
}

/**
 * Toggles the mobile navigation drawer.
 * @param {Element} nav
 * @param {*} forceExpanded
 */
function toggleMenu(nav, forceExpanded = null) {
  const expanded = forceExpanded !== null
    ? !forceExpanded
    : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  if (button) {
    button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
    button.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  }
}

/**
 * Resolve the full-text search-index path for both local dev (/content) and
 * production. This is a dedicated index that includes each page's body text
 * (a `content` field), so the header search matches full page content like the
 * source — not just title/description. It is fetched only on the first keystroke
 * (never during page load), so the heavier body text never affects render.
 */
function getIndexPath() {
  const base = window.location.pathname.startsWith('/content/') ? '/content/us/en' : '/us/en';
  return `${base}/search-index.json`;
}

// Cache the fetched index across keystrokes so we only load it once.
let indexPromise = null;
async function loadIndex() {
  if (!indexPromise) {
    indexPromise = fetch(getIndexPath())
      .then((res) => (res.ok ? res.json() : { data: [] }))
      .then((json) => json.data || [])
      .catch(() => []);
  }
  return indexPromise;
}

/**
 * Render matching results into the dropdown.
 */
function renderResults(matches, results) {
  results.textContent = '';
  if (!matches.length) {
    results.hidden = true;
    return;
  }
  matches.slice(0, 8).forEach((item) => {
    const li = document.createElement('li');
    li.setAttribute('role', 'option');
    const link = document.createElement('a');
    // Local dev serves under /content; strip nothing — the index paths are
    // already site-relative and work in both environments once prefixed.
    const prefix = window.location.pathname.startsWith('/content/') ? '/content' : '';
    link.href = `${prefix}${item.path}`;
    link.textContent = item.title || item.path;
    li.append(link);
    results.append(li);
  });
  results.hidden = false;
}

/**
 * Wire up live-suggest search: filter the query index by title/description as
 * the user types, show a results dropdown, and navigate on submit/selection.
 */
function setupSearch(input, results, form) {
  const search = (term) => {
    const q = term.trim().toLowerCase();
    if (q.length < 2) {
      renderResults([], results);
      return;
    }
    loadIndex().then((data) => {
      const matches = data.filter((item) => {
        // Match against title, description AND body content, so in-body hits
        // surface like the source (e.g. "share" appears in each article body).
        const hay = `${item.title || ''} ${item.description || ''} ${item.content || ''}`.toLowerCase();
        return hay.includes(q);
      });
      renderResults(matches, results);
    });
  };

  input.addEventListener('input', () => search(input.value));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const first = results.querySelector('a');
    if (first) window.location.href = first.href;
  });
  // Hide the dropdown when focus leaves the search area.
  document.addEventListener('click', (e) => {
    if (!form.parentElement.contains(e.target)) {
      results.hidden = true;
    }
  });
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment. Resolve the nav path for both local dev (content served
  // under /content) and production (served at site root). Metadata wins if present.
  const navMeta = getMetadata('nav');
  let navPath;
  if (navMeta) {
    navPath = new URL(navMeta, window.location).pathname;
  } else if (window.location.pathname.startsWith('/content/')) {
    navPath = '/content/nav';
  } else {
    navPath = '/nav';
  }
  const fragment = await loadFragment(navPath);

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  // Resolve relative nav image paths (e.g. "images/logo.svg") against the nav
  // fragment location so they work regardless of the current page path.
  const navBase = new URL(navPath, window.location);
  nav.querySelectorAll('img[src]').forEach((img) => {
    const raw = img.getAttribute('src');
    if (raw && !raw.startsWith('/') && !/^https?:/i.test(raw)) {
      img.src = new URL(raw, navBase).href;
    }
  });

  // Section order in nav.plain.html: brand (logo), sections (nav links), tools (sign-in + locale)
  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  // Mark the nav link for the current section as the active page (the source
  // highlights it with the yellow pill; CSS keys off [aria-current="page"]).
  // Match by the section root, e.g. /us/en/magazine and any /us/en/magazine/*.
  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    // Normalise both sides: drop a local "/content" preview prefix and any
    // ".html"/trailing slash so the current path and nav hrefs are comparable.
    const norm = (p) => p.replace(/^\/content/, '').replace(/\.html$/, '').replace(/\/$/, '');
    const here = norm(window.location.pathname);
    navSections.querySelectorAll('a').forEach((link) => {
      const target = norm(new URL(link.href, window.location).pathname);
      if (target && (here === target || here.startsWith(`${target}/`))) {
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  // --- Brand: unwrap button class on the logo link ---
  const navBrand = nav.querySelector('.nav-brand');
  if (navBrand) {
    const brandLink = navBrand.querySelector('a');
    if (brandLink) {
      brandLink.className = '';
      const bc = brandLink.closest('.button-container');
      if (bc) bc.className = '';
    }
  }

  // --- Tools: split Sign In and locale list into a utility bar ---
  const navTools = nav.querySelector('.nav-tools');
  const utilityBar = document.createElement('div');
  utilityBar.className = 'nav-utility';
  if (navTools) {
    // Sign In link (first paragraph link)
    const signIn = navTools.querySelector('p a');
    if (signIn) {
      signIn.className = '';
      const signInWrap = document.createElement('div');
      signInWrap.className = 'nav-signin';
      signInWrap.append(signIn);
      utilityBar.append(signInWrap);
    }

    // Locale selector: the <ul> of locale links
    const localeList = navTools.querySelector('ul');
    if (localeList) {
      const localeWrapper = document.createElement('div');
      localeWrapper.className = 'nav-locale';
      localeWrapper.setAttribute('aria-expanded', 'false');

      // Build the trigger from the current (first) locale entry — clone its flag + label
      const current = localeList.querySelector('li a');
      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'nav-locale-trigger';
      trigger.setAttribute('aria-haspopup', 'true');
      trigger.setAttribute('aria-expanded', 'false');
      const flagImg = current ? current.querySelector('img, picture') : null;
      const label = current ? current.textContent.trim() : 'Locale';
      if (flagImg) trigger.append(flagImg.cloneNode(true));
      const labelSpan = document.createElement('span');
      labelSpan.textContent = label;
      trigger.append(labelSpan);
      const chevron = document.createElement('span');
      chevron.className = 'nav-locale-chevron';
      chevron.setAttribute('aria-hidden', 'true');
      trigger.append(chevron);

      localeList.className = 'nav-locale-list';
      trigger.addEventListener('click', () => {
        const open = localeWrapper.getAttribute('aria-expanded') === 'true';
        localeWrapper.setAttribute('aria-expanded', open ? 'false' : 'true');
        trigger.setAttribute('aria-expanded', open ? 'false' : 'true');
      });

      localeWrapper.append(trigger);
      localeWrapper.append(localeList);
      utilityBar.append(localeWrapper);

      document.addEventListener('click', (e) => closeLocaleOnOutsideClick(e, localeWrapper));
    }
    navTools.remove();
  }

  // --- Build inline search form with live-suggest (form controls live in JS,
  // not the fragment). Appended to nav (a sibling of nav-sections) so it stays
  // visible in the bar on mobile while the nav links collapse into the drawer.
  // Results are matched client-side against the published query index. ---
  const search = document.createElement('div');
  search.className = 'nav-search';
  const form = document.createElement('form');
  form.setAttribute('role', 'search');
  const icon = document.createElement('span');
  icon.className = 'nav-search-icon';
  icon.setAttribute('aria-hidden', 'true');
  const input = document.createElement('input');
  input.type = 'search';
  input.name = 'q';
  input.placeholder = 'SEARCH';
  input.setAttribute('aria-label', 'Search');
  input.setAttribute('autocomplete', 'off');
  const results = document.createElement('ul');
  results.className = 'nav-search-results';
  results.setAttribute('role', 'listbox');
  results.hidden = true;
  form.append(icon, input);
  search.append(form, results);
  nav.append(search);
  setupSearch(input, results, form);

  // --- Hamburger for mobile ---
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation" aria-expanded="false">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');

  // Reset menu state on breakpoint change (close mobile drawer when going to desktop)
  toggleMenu(nav, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, isDesktop.matches));

  // Assemble: utility bar on top, main nav below
  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  if (utilityBar.childElementCount) navWrapper.append(utilityBar);
  navWrapper.append(nav);
  block.append(navWrapper);
}
