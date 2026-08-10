/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import breadcrumbParser from './parsers/breadcrumb.js';
import quoteEditorialParser from './parsers/quote-editorial.js';

// TRANSFORMER IMPORTS
import wkndCleanupTransformer from './transformers/wknd-cleanup.js';
import wkndMagazineArticleTransformer from './transformers/wknd-magazine-article.js';

// PARSER REGISTRY
const parsers = {
  breadcrumb: breadcrumbParser,
  'quote-editorial': quoteEditorialParser,
};

// TRANSFORMER REGISTRY
const transformers = [
  wkndCleanupTransformer,
  wkndMagazineArticleTransformer,
];

// Per-article editorial publish dates (ISO YYYY-MM-DD), cross-referenced from
// the source's "Share this story" lists (the date is otherwise only baked into
// link text). Appended as a "Publish Date" row to the generated Metadata block
// so it publishes as <meta name="publish-date">, which helix-query.yaml indexes
// as `publishDate` for the dynamic related-articles block to render + sort.
const PUBLISH_DATES = {
  'arctic-surfing': '2020-07-09',
  'san-diego-surf': '2020-07-09',
  'western-australia': '2020-07-09',
  'ski-touring': '2020-09-30',
  'guide-la-skateparks': '2020-09-30',
};

/**
 * Append a "Publish Date" row to the Metadata block table (the last table whose
 * first cell reads "Metadata"). Runs AFTER WebImporter.rules.createMetadata,
 * which builds that block but only from a fixed set of source meta tags.
 * @param {Element} main
 * @param {Document} document
 * @param {string} slug article slug (e.g. "arctic-surfing")
 */
function appendPublishDate(main, document, slug) {
  const iso = PUBLISH_DATES[slug];
  if (!iso) return;
  const metaTable = [...main.querySelectorAll('table')].reverse().find((t) => {
    const first = t.querySelector('tr th, tr td');
    return first && first.textContent.trim().toLowerCase() === 'metadata';
  });
  if (!metaTable) return;
  const body = metaTable.querySelector('tbody') || metaTable;
  const row = document.createElement('tr');
  const label = document.createElement('td');
  label.textContent = 'Publish Date';
  const value = document.createElement('td');
  value.textContent = iso;
  row.append(label, value);
  body.append(row);
}

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'magazine-article',
  description: 'WKND magazine article: lead image, breadcrumb, long-form editorial body with a pull-quote block, author byline, and related-stories sidebar.',
  blocks: [
    {
      name: 'breadcrumb',
      instances: ['div.breadcrumb.cmp-breadcrumb--fixed', 'div.breadcrumb'],
    },
    {
      name: 'quote-editorial',
      instances: ['blockquote', 'div.cmp-quote', 'div.quote'],
    },
  ],
};

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration.
 * De-duplicates by element so overlapping selectors don't double-parse a node.
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  const seen = new Set();
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        if (seen.has(element)) return;
        seen.add(element);
        pageBlocks.push({ name: blockDef.name, selector, element });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    executeTransformers('afterTransform', main, payload);

    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, ''),
    );

    // Add the editorial "Publish Date" row to the Metadata block (after
    // createMetadata built it). Slug derived from the sanitized path.
    const slug = (path.match(/\/magazine\/([^/]+)$/) || [])[1] || '';
    appendPublishDate(main, document, slug);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
