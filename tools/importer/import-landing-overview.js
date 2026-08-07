/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import columnsFeaturedParser from './parsers/columns-featured.js';
import cardsTeaserParser from './parsers/cards-teaser.js';
import cardsPeopleParser from './parsers/cards-people.js';

// TRANSFORMER IMPORTS
import wkndMembersTeasersTransformer from './transformers/wknd-members-teasers.js';
import wkndCleanupTransformer from './transformers/wknd-cleanup.js';
import wkndListingsTransformer from './transformers/wknd-listings.js';

// PARSER REGISTRY
const parsers = {
  'columns-featured': columnsFeaturedParser,
  'cards-teaser': cardsTeaserParser,
  'cards-people': cardsPeopleParser,
};

// TRANSFORMER REGISTRY
const transformers = [
  wkndMembersTeasersTransformer,
  wkndCleanupTransformer,
  wkndListingsTransformer,
];

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'landing-overview',
  description: 'WKND landing/overview page: title + featured teaser (columns), a grid of article cards, and a members-only section with secure teaser cards.',
  blocks: [
    {
      name: 'columns-featured',
      instances: ['div.teaser.cmp-teaser--featured'],
    },
    {
      name: 'cards-teaser',
      instances: ['div.image-list.list'],
    },
    {
      name: 'cards-people',
      instances: ['section.cmp-experience-fragment--contributor'],
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
 * Find all blocks on the page. De-duplicates by element and skips nested matches.
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
