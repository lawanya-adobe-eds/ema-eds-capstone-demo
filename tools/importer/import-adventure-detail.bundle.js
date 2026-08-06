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

  // tools/importer/import-adventure-detail.js
  var import_adventure_detail_exports = {};
  __export(import_adventure_detail_exports, {
    default: () => import_adventure_detail_default
  });

  // tools/importer/parsers/breadcrumb.js
  function parse(element, { document }) {
    let items = Array.from(element.querySelectorAll(".cmp-breadcrumb__item"));
    if (items.length === 0) {
      items = Array.from(element.querySelectorAll("ol li, nav li"));
    }
    const cells = [];
    items.forEach((item) => {
      const link = item.querySelector("a[href]");
      if (link) {
        const anchor = document.createElement("a");
        anchor.href = link.getAttribute("href") || "";
        anchor.textContent = link.textContent.trim();
        if (anchor.textContent) cells.push([anchor]);
      } else {
        const label = item.textContent.trim();
        if (label) cells.push([label]);
      }
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "breadcrumb", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-gallery.js
  function parse2(element, { document }) {
    const slides = Array.from(element.querySelectorAll(".cmp-carousel__item"));
    const cells = [];
    slides.forEach((slide) => {
      const image = slide.querySelector(".cmp-image img, .image img, img");
      if (image) {
        cells.push([image]);
      }
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-gallery", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs-adventure.js
  function parse3(element, { document }) {
    const labels = Array.from(element.querySelectorAll(".cmp-tabs__tablist .cmp-tabs__tab, ol.cmp-tabs__tablist > li"));
    const panels = Array.from(element.querySelectorAll(".cmp-tabs__tabpanel"));
    const cells = [];
    labels.forEach((label, index) => {
      const labelText = label.textContent.trim();
      const panel = panels[index];
      let contentNodes = [];
      if (panel) {
        const cfElements = panel.querySelector(".cmp-contentfragment__elements");
        const source = cfElements || panel;
        contentNodes = Array.from(source.childNodes).filter((node) => {
          if (node.nodeType === 3) return node.textContent.trim().length > 0;
          if (node.nodeType !== 1) return false;
          return node.textContent.trim().length > 0 || node.querySelector("img");
        });
      }
      if (labelText) {
        cells.push([labelText, contentNodes.length > 0 ? contentNodes : ""]);
      }
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "tabs-adventure", cells });
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

  // tools/importer/import-adventure-detail.js
  var parsers = {
    breadcrumb: parse,
    "carousel-gallery": parse2,
    "tabs-adventure": parse3
  };
  var transformers = [
    transform
  ];
  var PAGE_TEMPLATE = {
    name: "adventure-detail",
    description: "WKND adventure detail page: breadcrumb trail, image gallery carousel, title + specs + share (default content), and tabs (overview/itinerary/what to bring).",
    blocks: [
      {
        name: "breadcrumb",
        instances: ["div.breadcrumb.cmp-breadcrumb--fixed", "div.breadcrumb"]
      },
      {
        name: "carousel-gallery",
        instances: ["div.carousel.cmp-carousel--mini"]
      },
      {
        name: "tabs-adventure",
        instances: ["div.tabs.panelcontainer", "div.tabs"]
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
  var import_adventure_detail_default = {
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
  return __toCommonJS(import_adventure_detail_exports);
})();
