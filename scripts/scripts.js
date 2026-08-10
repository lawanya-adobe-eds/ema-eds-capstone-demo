import {
  loadHeader,
  loadFooter,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
  buildBlock,
} from './aem.js';

if (window.trustedTypes && window.trustedTypes.createPolicy) {
  const innerTT = window.trustedTypes.createPolicy('tt-inner', {
    createHTML: (s) => s, // avoid stack overflow
  });

  window.trustedTypes.createPolicy('default', {
    createHTML: (input, type, sink) => {
      let processedInput = input;
      if (/srcdoc\s*=/i.test(processedInput)) {
        const doc = new DOMParser().parseFromString(innerTT.createHTML(processedInput), 'text/html');
        doc.querySelectorAll('iframe[srcdoc]').forEach((el) => el.removeAttribute('srcdoc'));
        processedInput = doc.body.innerHTML;
      }
      if (sink.includes('createContextualFragment') || sink.includes('Document write')) {
        const doc = new DOMParser().parseFromString(innerTT.createHTML(processedInput), 'text/html');
        doc.querySelectorAll('script').forEach((el) => el.remove());
        processedInput = doc.body.innerHTML;
      }
      return processedInput;
    },
    createScriptURL: (input) => input,
    createScript: (input) => input,
  });
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Turns `/widgets/...` links into widget blocks.
 * @param {Element} main The container element
 */
function buildWidgetAutoBlocks(main) {
  const widgetLinks = [...main.querySelectorAll('a[href*="/widgets/"]')];
  widgetLinks.forEach((link) => {
    if (link.closest('.widget')) return;
    const newLink = link.cloneNode(true);
    const widgetBlock = buildBlock('widget', { elems: [newLink] });
    const p = link.closest('p');
    if (
      p
      && p.querySelectorAll('a').length === 1
      && p.querySelector('a') === link
      && p.textContent.trim() === link.textContent.trim()
    ) {
      p.replaceWith(widgetBlock);
    } else {
      link.replaceWith(widgetBlock);
    }
  });
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
// Inline social icons for the magazine article author card (mirrors the footer
// and cards-people icons so social marks are consistent site-wide).
const ARTICLE_SOCIAL_ICONS = {
  facebook: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z"/></svg>',
  twitter: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M23 4.9c-.8.36-1.66.6-2.56.71a4.48 4.48 0 0 0 1.96-2.47 8.94 8.94 0 0 1-2.83 1.08 4.46 4.46 0 0 0-7.6 4.07A12.66 12.66 0 0 1 2.79 3.6a4.46 4.46 0 0 0 1.38 5.95c-.72-.02-1.4-.22-1.99-.55v.06a4.46 4.46 0 0 0 3.58 4.37c-.67.18-1.37.2-2.05.08a4.47 4.47 0 0 0 4.17 3.1A8.94 8.94 0 0 1 1 19.54 12.61 12.61 0 0 0 7.83 21.5c8.2 0 12.68-6.79 12.68-12.68l-.01-.58A9.05 9.05 0 0 0 23 4.9z"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.72 3.72 0 0 1-1.38-.9 3.72 3.72 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 1.44c-3.15 0-3.5.01-4.74.07-1.15.05-1.77.24-2.19.4-.55.22-.94.47-1.35.88-.41.41-.66.8-.88 1.35-.16.42-.35 1.04-.4 2.19-.06 1.24-.07 1.59-.07 4.74s.01 3.5.07 4.74c.05 1.15.24 1.77.4 2.19.22.55.47.94.88 1.35.41.41.8.66 1.35.88.42.16 1.04.35 2.19.4 1.24.06 1.59.07 4.74.07s3.5-.01 4.74-.07c1.15-.05 1.77-.24 2.19-.4.55-.22.94-.47 1.35-.88.41-.41.66-.8.88-1.35.16-.42.35-1.04.4-2.19.06-1.24.07-1.59.07-4.74s-.01-3.5-.07-4.74c-.05-1.15-.24-1.77-.4-2.19a3.63 3.63 0 0 0-.88-1.35 3.63 3.63 0 0 0-1.35-.88c-.42-.16-1.04-.35-2.19-.4-1.24-.06-1.59-.07-4.74-.07zm0 3.68a4.72 4.72 0 1 0 0 9.44 4.72 4.72 0 0 0 0-9.44zm0 7.79a3.07 3.07 0 1 1 0-6.14 3.07 3.07 0 0 1 0 6.14zm6.01-7.98a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0z"/></svg>',
};

/**
 * Restyle the magazine article author card: group the headshot, name, role and
 * social links into one card, round the headshot, and swap the text social
 * links (Facebook/Twitter/Instagram) for inline SVG icons — matching the source.
 * @param {Element} scope The article column containing the author block
 */
function decorateArticleAuthor(scope) {
  // Author name heading = an h2 whose immediately following siblings are the
  // role line and social links (Facebook/Twitter/Instagram), preceded by a lone
  // image paragraph. This distinguishes it from body-section h2s that also
  // happen to follow an inline article image.
  const authorHeading = [...scope.querySelectorAll('h2')].find((h) => {
    const prev = h.previousElementSibling;
    const imageBefore = prev && prev.tagName === 'P' && prev.querySelector('picture') && !prev.textContent.trim();
    if (!imageBefore) return false;
    // Look ahead for at least one social link paragraph.
    let n = h.nextElementSibling;
    let sawSocial = false;
    while (n && n.tagName === 'P') {
      const link = n.querySelector('a');
      if (link && /facebook|twitter|insta/i.test(`${link.getAttribute('href') || ''} ${link.textContent}`)) {
        sawSocial = true;
        break;
      }
      n = n.nextElementSibling;
    }
    return sawSocial;
  });
  if (!authorHeading) return;

  const imageP = authorHeading.previousElementSibling;
  imageP.classList.add('magazine-article-author-image');

  // Collect the consecutive <p> siblings after the heading: the role line and
  // the social-link paragraphs (one <a> each).
  const roleParts = [];
  const socialLinks = [];
  let node = authorHeading.nextElementSibling;
  while (node && node.tagName === 'P') {
    const next = node.nextElementSibling;
    const link = node.querySelector('a');
    if (link && node.textContent.trim() === link.textContent.trim()) {
      socialLinks.push(link);
      node.remove();
    } else {
      roleParts.push(node);
    }
    node = next;
  }

  // Build the icon social row.
  const socialRow = document.createElement('div');
  socialRow.className = 'magazine-article-author-social';
  socialLinks.forEach((link) => {
    const hay = `${link.getAttribute('href') || ''} ${link.textContent}`.toLowerCase();
    let key = null;
    if (hay.includes('facebook')) key = 'facebook';
    else if (hay.includes('twitter')) key = 'twitter';
    else if (hay.includes('insta')) key = 'instagram';
    if (key && ARTICLE_SOCIAL_ICONS[key]) {
      link.setAttribute('aria-label', link.textContent.trim() || key);
      link.classList.add('magazine-article-social-icon');
      link.innerHTML = ARTICLE_SOCIAL_ICONS[key];
    }
    socialRow.append(link);
  });

  // Wrap image + name + role + socials into one card, in place.
  const author = document.createElement('div');
  author.className = 'magazine-article-author';
  imageP.before(author);
  author.append(imageP, authorHeading, ...roleParts, socialRow);
}

/**
 * Lay a magazine article child page out as two columns (article body + author
 * on the left, a "Share this story" sidebar on the right), matching the source.
 * Guarded to `.../magazine/<slug>` pages that carry the share heading.
 * @param {Element} main The container element
 */
function buildMagazineArticle(main) {
  const path = window.location.pathname.replace(/\.html$/, '');
  if (!/\/magazine\/[^/]+$/.test(path)) return; // article pages only, not the listing
  const shareHeading = [...main.querySelectorAll('h5')].find((h) => /share this/i.test(h.textContent));
  if (!shareHeading) return;
  const section = shareHeading.closest('.section');
  if (!section || section.dataset.magazineArticle) return;

  const breadcrumb = section.querySelector('.breadcrumb-wrapper');

  const layout = document.createElement('div');
  layout.className = 'magazine-article-layout';
  const articleCol = document.createElement('div');
  articleCol.className = 'magazine-article-main';
  const aside = document.createElement('aside');
  aside.className = 'magazine-article-share';

  // Build the sidebar: the "Share this story" heading, an optional "Download
  // PDF" block, and the related-story list (now a `related-articles` block).
  // The heading is the LAST default-content node in a wrapper it shares with the
  // article body/author, while the related-articles block sits in its OWN
  // following wrapper (decorateSections wraps each block/default run separately).
  // So: (1) move the heading and any following siblings WITHIN its wrapper to
  // the aside, then (2) move that wrapper's following sibling wrappers (the
  // Download PDF block, the related-articles block) to the aside too.
  const shareWrapper = shareHeading.closest('.section > div');
  let inlineTail = shareHeading;
  while (inlineTail) {
    const next = inlineTail.nextElementSibling;
    aside.append(inlineTail);
    inlineTail = next;
  }
  let wrapperTail = shareWrapper ? shareWrapper.nextElementSibling : null;
  while (wrapperTail) {
    const next = wrapperTail.nextElementSibling;
    aside.append(wrapperTail);
    wrapperTail = next;
  }

  // Split each related-story link ("<Title> <Weekday, DD Mon YYYY>") into a
  // title line over a small grey date line, matching the source. The related
  // list is the one whose links point at other magazine articles. Lists inside
  // a `related-articles` block are skipped — that block renders the split spans
  // itself (and does so asynchronously, so it may not exist yet here).
  const relatedList = [...aside.querySelectorAll('ul')]
    .filter((ul) => !ul.closest('.related-articles'))
    .find((ul) => ul.querySelector('a[href*="/magazine/"]'));
  if (relatedList) {
    relatedList.querySelectorAll('a').forEach((link) => {
      const text = link.textContent.trim();
      const m = text.match(/^(.*?)\s+((?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*,\s+.+)$/);
      const [, matchedTitle, matchedDate] = m || [];
      const titleText = matchedTitle || text;
      const dateText = matchedDate || '';
      link.textContent = '';
      const title = document.createElement('span');
      title.className = 'magazine-article-share-title';
      title.textContent = titleText;
      link.append(title);
      if (dateText) {
        const date = document.createElement('span');
        date.className = 'magazine-article-share-date';
        date.textContent = dateText;
        link.append(date);
      }
    });
  }

  // Everything after the breadcrumb (h1, byline, body, author) becomes the
  // left article column; the lead image + breadcrumb stay full-width above.
  let started = !breadcrumb;
  [...section.children].forEach((child) => {
    if (child === breadcrumb) { started = true; return; }
    if (!started || child === layout) return;
    articleCol.append(child);
  });

  layout.append(articleCol, aside);
  section.append(layout);
  section.dataset.magazineArticle = 'true';

  decorateArticleAuthor(articleCol);
}

function buildAutoBlocks(main) {
  try {
    // auto load `*/fragments/*` references
    const fragments = [...main.querySelectorAll('a[href*="/fragments/"]')].filter((f) => !f.closest('.fragment'));
    if (fragments.length > 0) {
      // eslint-disable-next-line import/no-cycle
      import('../blocks/fragment/fragment.js').then(({ loadFragment }) => {
        fragments.forEach(async (fragment) => {
          try {
            const { pathname } = new URL(fragment.href);
            const frag = await loadFragment(pathname);
            fragment.parentElement.replaceWith(...frag.children);
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Fragment loading failed', error);
          }
        });
      });
    }
    buildWidgetAutoBlocks(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates formatted links to style them as buttons.
 * @param {HTMLElement} main The main container element
 */
function decorateButtons(main) {
  main.querySelectorAll('p a[href]').forEach((a) => {
    a.title = a.title || a.textContent;
    const p = a.closest('p');
    const text = a.textContent.trim();

    // quick structural checks
    if (a.querySelector('img') || p.textContent.trim() !== text) return;

    // skip URL display links
    try {
      if (new URL(a.href).href === new URL(text, window.location).href) return;
    } catch { /* continue */ }

    // require authored formatting for buttonization
    const strong = a.closest('strong');
    const em = a.closest('em');
    if (!strong && !em) return;

    p.className = 'button-wrapper';
    a.className = 'button';
    if (strong && em) { // high-impact call-to-action
      a.classList.add('accent');
      const outer = strong.contains(em) ? strong : em;
      outer.replaceWith(a);
    } else if (strong) {
      a.classList.add('primary');
      strong.replaceWith(a);
    } else {
      a.classList.add('secondary');
      em.replaceWith(a);
    }
  });
}

/**
 * Rewrites internal links that still carry a `.html` extension to clean,
 * extension-less Edge Delivery URLs (e.g. `/us/en/magazine.html` ->
 * `/us/en/magazine`). Only same-origin links are touched; external links
 * (e.g. docs.adobe.com) and non-http schemes are left untouched. Query strings
 * and hash fragments are preserved.
 * @param {HTMLElement} main The main container element
 */
function decorateLinks(main) {
  main.querySelectorAll('a[href]').forEach((a) => {
    const raw = a.getAttribute('href');
    if (!raw) return;
    let url;
    try {
      url = new URL(a.href, window.location);
    } catch {
      return;
    }
    // Only internal (same-origin) page links ending in .html.
    if (url.origin !== window.location.origin) return;
    if (!url.pathname.endsWith('.html')) return;

    const cleanPath = url.pathname.replace(/\.html$/, '');
    // Preserve whether the author used a root-relative or absolute-origin href.
    const prefix = /^https?:\/\//i.test(raw) ? url.origin : '';
    a.setAttribute('href', `${prefix}${cleanPath}${url.search}${url.hash}`);
  });
}

/**
 * Give content images explicit width/height so the browser reserves layout
 * space and avoids layout shift (CLS). Block-generated images already carry
 * dimensions; this covers free-flowing content images (article body, tab
 * panels) that come straight from the backend markup without them. The
 * intrinsic size is read once the image has decoded; the ratio is preserved so
 * there is no visual change (the CSS keeps width:100%/height:auto).
 * @param {Element} main The main element
 */
function reserveImageSpace(main) {
  main.querySelectorAll('img:not([width]):not([height])').forEach((img) => {
    const apply = () => {
      if (img.naturalWidth && img.naturalHeight && !img.getAttribute('width')) {
        img.setAttribute('width', img.naturalWidth);
        img.setAttribute('height', img.naturalHeight);
      }
    };
    if (img.complete && img.naturalWidth) apply();
    else img.addEventListener('load', apply, { once: true });
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
  decorateButtons(main);
  decorateLinks(main);
  reserveImageSpace(main);
  // Runs after sections/blocks are decorated so the section + wrapper elements
  // it relies on exist. Guarded to magazine article pages internally.
  try {
    buildMagazineArticle(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Magazine article layout failed', error);
  }
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  loadHeader(doc.querySelector('body > header'));

  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadFooter(doc.querySelector('body > footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  import('./consent-check.js');
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
