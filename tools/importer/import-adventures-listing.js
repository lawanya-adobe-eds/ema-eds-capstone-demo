/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroOverlayParser from './parsers/hero-overlay.js';
import tabsAdventureParser from './parsers/tabs-adventure.js';

// TRANSFORMER IMPORTS
import wkndCleanupTransformer from './transformers/wknd-cleanup.js';
import wkndListingsTransformer from './transformers/wknd-listings.js';

// PARSER REGISTRY
const parsers = {
  'hero-overlay': heroOverlayParser,
  'tabs-adventure': tabsAdventureParser,
};

// TRANSFORMER REGISTRY
const transformers = [
  wkndCleanupTransformer,
  wkndListingsTransformer,
];

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'adventures-listing',
  description: 'WKND adventures listing: Adventures title, hero teaser, and Current Adventures filter tabs each containing a 4-up adventure card grid.',
  blocks: [
    {
      name: 'hero-overlay',
      instances: ['div.teaser.cmp-teaser--hero.cmp-teaser--imagebottom', 'div.teaser.cmp-teaser--hero'],
    },
    {
      name: 'tabs-adventure',
      instances: ['div.tabs.panelcontainer', 'div.tabs'],
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
 * Find all blocks on the page. De-duplicates by element AND skips elements
 * nested inside an already-selected block (so the card grids inside tab panels
 * are handled by the tabs parser, not double-parsed as standalone cards).
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  const chosen = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        if (chosen.some((c) => c === element || c.contains(element) || element.contains(c))) return;
        chosen.push(element);
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
