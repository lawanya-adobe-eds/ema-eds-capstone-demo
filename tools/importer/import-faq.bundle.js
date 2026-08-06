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

  // tools/importer/import-faq.js
  var import_faq_exports = {};
  __export(import_faq_exports, {
    default: () => import_faq_default
  });

  // tools/importer/parsers/accordion-faq.js
  function parse(element, { document }) {
    const items = element.querySelectorAll('.cmp-accordion__item, [class*="accordion__item"]');
    const cells = [];
    items.forEach((item) => {
      const titleEl = item.querySelector(
        ".cmp-accordion__title, .cmp-accordion__button, .cmp-accordion__header, h2, h3, h4"
      );
      const question = titleEl ? titleEl.textContent.trim() : "";
      const contentSource = item.querySelector(".cmp-accordion__panel .cmp-text") || item.querySelector(".cmp-accordion__panel") || item.querySelector('[class*="accordion__panel"]');
      const answer = [];
      if (contentSource) {
        [...contentSource.children].forEach((child) => {
          if (child.textContent.trim() !== "" || child.querySelector("img, picture")) {
            answer.push(child);
          }
        });
        if (answer.length === 0) answer.push(contentSource);
      }
      if (question || answer.length) {
        cells.push([question, answer]);
      }
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "accordion-faq", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/wknd-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.afterTransform) {
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

  // tools/importer/import-faq.js
  var parsers = {
    "accordion-faq": parse
  };
  var transformers = [
    transform
  ];
  var PAGE_TEMPLATE = {
    name: "faq",
    description: "WKND FAQ page: FAQs header, an accordion of expandable Q&A items, and a Need more help contact block.",
    blocks: [
      {
        name: "accordion-faq",
        instances: ["div.accordion.cmp-accordion", "div.accordion"]
      }
    ]
  };
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
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
    const seen = /* @__PURE__ */ new Set();
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
  var import_faq_default = {
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
  return __toCommonJS(import_faq_exports);
})();
