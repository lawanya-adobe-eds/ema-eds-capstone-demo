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

  // tools/importer/import-magazine-article.js
  var import_magazine_article_exports = {};
  __export(import_magazine_article_exports, {
    default: () => import_magazine_article_default
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

  // tools/importer/parsers/quote-editorial.js
  function parse2(element, { document }) {
    const CITATION_SELECTOR = 'cite, footer, figcaption, .cmp-quote__author, .cmp-quote__citation, .quote-author, [class*="attribution"]';
    const blockquote = element.matches("blockquote") ? element : element.querySelector("blockquote");
    const quoteHost = blockquote || element.querySelector(".cmp-quote__quote, .cmp-quote__text, .quote-text");
    const citationEl = (quoteHost || element).querySelector(CITATION_SELECTOR);
    let quoteEl = null;
    if (quoteHost) {
      const clone = quoteHost.cloneNode(true);
      clone.querySelectorAll(CITATION_SELECTOR).forEach((n) => n.remove());
      const html = clone.innerHTML.trim();
      if (html) {
        quoteEl = document.createElement("p");
        quoteEl.innerHTML = html;
      }
    }
    if (!quoteEl) {
      const citationText = citationEl ? citationEl.textContent.trim() : "";
      let text = element.textContent.trim();
      if (citationText && text.endsWith(citationText)) {
        text = text.slice(0, text.length - citationText.length).trim();
      }
      if (text) {
        quoteEl = document.createElement("p");
        quoteEl.textContent = text;
      }
    }
    if (!quoteEl) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    cells.push([quoteEl]);
    if (citationEl) {
      const citeClone = citationEl.cloneNode(true);
      if (citeClone.textContent.trim()) cells.push([citeClone]);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "quote-editorial", cells });
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

  // tools/importer/transformers/wknd-magazine-article.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function createMarker(document, name) {
    return WebImporter.DOMUtils.createTable([[name]], document);
  }
  function swapRelatedList(element, document) {
    const lists = [...element.querySelectorAll("ul")];
    const relatedList = lists.find((ul) => ul.querySelector('a[href*="/magazine/"]'));
    if (relatedList) relatedList.replaceWith(createMarker(document, "related-articles"));
  }
  function transform2(hookName, element, payload) {
    if (hookName !== TransformHook2.afterTransform) return;
    const url = payload.params && payload.params.originalURL || payload.url || "";
    const path = (() => {
      try {
        return new URL(url).pathname;
      } catch (e) {
        return String(url);
      }
    })();
    if (!/\/magazine\/[^/.]+(\.html)?$/.test(path)) return;
    swapRelatedList(element, payload.document);
  }

  // tools/importer/import-magazine-article.js
  var parsers = {
    breadcrumb: parse,
    "quote-editorial": parse2
  };
  var transformers = [
    transform,
    transform2
  ];
  var PUBLISH_DATES = {
    "arctic-surfing": "2020-07-09",
    "san-diego-surf": "2020-07-09",
    "western-australia": "2020-07-09",
    "ski-touring": "2020-09-30",
    "guide-la-skateparks": "2020-09-30"
  };
  function appendPublishDate(main, document, slug) {
    const iso = PUBLISH_DATES[slug];
    if (!iso) return;
    const metaTable = [...main.querySelectorAll("table")].reverse().find((t) => {
      const first = t.querySelector("tr th, tr td");
      return first && first.textContent.trim().toLowerCase() === "metadata";
    });
    if (!metaTable) return;
    const body = metaTable.querySelector("tbody") || metaTable;
    const row = document.createElement("tr");
    const label = document.createElement("td");
    label.textContent = "Publish Date";
    const value = document.createElement("td");
    value.textContent = iso;
    row.append(label, value);
    body.append(row);
  }
  var PAGE_TEMPLATE = {
    name: "magazine-article",
    description: "WKND magazine article: lead image, breadcrumb, long-form editorial body with a pull-quote block, author byline, and related-stories sidebar.",
    blocks: [
      {
        name: "breadcrumb",
        instances: ["div.breadcrumb.cmp-breadcrumb--fixed", "div.breadcrumb"]
      },
      {
        name: "quote-editorial",
        instances: ["blockquote", "div.cmp-quote", "div.quote"]
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
  var import_magazine_article_default = {
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
      const slug = (path.match(/\/magazine\/([^/]+)$/) || [])[1] || "";
      appendPublishDate(main, document, slug);
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
  return __toCommonJS(import_magazine_article_exports);
})();
