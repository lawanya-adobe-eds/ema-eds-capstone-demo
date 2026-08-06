/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/carousel-hero.js
  function parse(element, { document }) {
    let slides = Array.from(element.querySelectorAll(".cmp-carousel__item"));
    if (slides.length === 0) {
      slides = Array.from(element.querySelectorAll(".teaser, .cmp-teaser"));
    }
    const cells = [];
    slides.forEach((slide) => {
      const image = slide.querySelector(".cmp-teaser__image img, .cmp-image img, img");
      const textCell = [];
      const title = slide.querySelector(".cmp-teaser__title, h1, h2, h3");
      if (title) textCell.push(title);
      const description = slide.querySelector(".cmp-teaser__description, p");
      if (description) textCell.push(description);
      const ctaLinks = Array.from(
        slide.querySelectorAll(".cmp-teaser__action-link, .cmp-teaser__action-container a")
      );
      ctaLinks.forEach((cta) => textCell.push(cta));
      if (image || textCell.length > 0) {
        cells.push([image || "", textCell.length > 0 ? textCell : ""]);
      }
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-featured.js
  function parse2(element, { document }) {
    const textCell = [];
    const pretitle = element.querySelector(".cmp-teaser__pretitle");
    if (pretitle) textCell.push(pretitle);
    const title = element.querySelector(".cmp-teaser__title, h1, h2, h3");
    if (title) textCell.push(title);
    const description = element.querySelector(".cmp-teaser__description, p:not(.cmp-teaser__pretitle)");
    if (description) textCell.push(description);
    const ctaLinks = Array.from(
      element.querySelectorAll(".cmp-teaser__action-link, .cmp-teaser__action-container a")
    );
    ctaLinks.forEach((cta) => textCell.push(cta));
    const image = element.querySelector(".cmp-teaser__image img, .cmp-image img, img");
    if (textCell.length === 0 && !image) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [
      [textCell.length > 0 ? textCell : "", image || ""]
    ];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-featured", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-teaser.js
  function parse3(element, { document }) {
    const items = Array.from(element.querySelectorAll(".cmp-image-list__item, li"));
    const cells = [];
    items.forEach((item) => {
      const image = item.querySelector(".cmp-image-list__item-image img, .cmp-image img, img");
      const textCell = [];
      const titleLink = item.querySelector(".cmp-image-list__item-title-link");
      const titleText = item.querySelector(".cmp-image-list__item-title");
      if (titleLink) {
        const heading = document.createElement("h3");
        const link = document.createElement("a");
        link.href = titleLink.getAttribute("href") || "";
        link.textContent = (titleText || titleLink).textContent.trim();
        heading.append(link);
        textCell.push(heading);
      } else if (titleText) {
        const heading = document.createElement("h3");
        heading.textContent = titleText.textContent.trim();
        textCell.push(heading);
      }
      const description = item.querySelector(".cmp-image-list__item-description, p");
      if (description) textCell.push(description);
      if (image || textCell.length > 0) {
        cells.push([image || "", textCell.length > 0 ? textCell : ""]);
      }
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-teaser", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero-overlay.js
  function parse4(element, { document }) {
    const image = element.querySelector(".cmp-teaser__image img, .cmp-image img, img");
    const contentCell = [];
    const title = element.querySelector(".cmp-teaser__title, h1, h2, h3");
    if (title) contentCell.push(title);
    const description = element.querySelector(".cmp-teaser__description, p");
    if (description) contentCell.push(description);
    const ctaLinks = Array.from(
      element.querySelectorAll(".cmp-teaser__action-link, .cmp-teaser__action-container a")
    );
    ctaLinks.forEach((cta) => contentCell.push(cta));
    if (!image && contentCell.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    cells.push([image || ""]);
    cells.push([contentCell.length > 0 ? contentCell : ""]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-overlay", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/wknd-buttons.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function wrapButtons(element, containerSelector, wrapperTag) {
    element.querySelectorAll(containerSelector).forEach((container) => {
      const link = container.querySelector("a");
      if (!link || link.closest("strong, em")) return;
      const wrapper = element.ownerDocument.createElement(wrapperTag);
      link.parentNode.insertBefore(wrapper, link);
      wrapper.appendChild(link);
    });
  }
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      wrapButtons(element, ".cmp-button--primary", "strong");
      wrapButtons(element, ".cmp-button--secondary", "em");
    }
  }

  // tools/importer/transformers/wknd-cleanup.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform2(hookName, element, payload) {
    if (hookName === TransformHook2.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        // Global header experience fragment (logo, main nav, language nav, search)
        // cleaned.html line 5: <header class="experiencefragment cmp-experiencefragment--header ...">
        "header",
        // Global footer experience fragment (logo, footer nav, social buttons, copyright)
        // cleaned.html line 471: <footer class="experiencefragment cmp-experiencefragment--footer ...">
        "footer",
        // Adobe ID syncing / demdex tracking iframe
        // cleaned.html line 566: <iframe id="destination_publishing_iframe_wkndsite_0" ...>
        "iframe",
        // Mobile nav toggle button (site chrome)
        // cleaned.html line 568: <div id="toggleNav">
        "#toggleNav",
        // Mobile navigation overlay (duplicate of header nav)
        // cleaned.html line 574: <div id="mobileNav" class="cmp-navigation--mobile">
        "#mobileNav",
        // Stray empty <meta> tags left inside cmp-image blocks
        // cleaned.html lines 183, 204, 227, 271, 334, 378
        "meta"
      ]);
    }
  }

  // tools/importer/import-homepage.js
  var parsers = {
    "carousel-hero": parse,
    "columns-featured": parse2,
    "cards-teaser": parse3,
    "hero-overlay": parse4
  };
  var transformers = [
    transform,
    transform2
  ];
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "WKND homepage: hero image carousel with rotating slides, a featured-article teaser, a grid of recent article cards, a full-width hero teaser, and a grid of adventure cards. Header and footer are global experience fragments.",
    urls: [
      "https://wknd.site/us/en.html"
    ],
    blocks: [
      {
        name: "carousel-hero",
        instances: ["div.carousel.cmp-carousel--hero"]
      },
      {
        name: "columns-featured",
        instances: ["div.teaser.cmp-teaser--featured"]
      },
      {
        name: "cards-teaser",
        instances: [
          "main.cmp-layout-container--fixed:nth-of-type(1) div.image-list.list",
          "main.cmp-layout-container--fixed:nth-of-type(2) div.image-list.list"
        ]
      },
      {
        name: "hero-overlay",
        instances: ["div.teaser.cmp-teaser--hero.cmp-teaser--imagebottom"]
      }
    ]
  };
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_homepage_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();
