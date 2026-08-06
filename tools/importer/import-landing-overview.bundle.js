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

  // tools/importer/import-landing-overview.js
  var import_landing_overview_exports = {};
  __export(import_landing_overview_exports, {
    default: () => import_landing_overview_default
  });

  // tools/importer/parsers/columns-featured.js
  function parse(element, { document }) {
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
  function parse2(element, { document }) {
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

  // tools/importer/parsers/cards-people.js
  function parse3(element, { document }) {
    const NAME_SEL = "h3.cmp-title__text, h3";
    const ROLE_SEL = "h5.cmp-title__text, h5";
    const SOCIAL_LIST_SEL = '.cmp-buildingblock--btn-list, [class*="btn-list"]';
    const SOCIAL_LINK_SEL = '.cmp-buildingblock--btn-list a, [class*="btn-list"] a, [class*="social"] a';
    const buildSocialParagraph = (anchors) => {
      if (!anchors.length) return null;
      const p = document.createElement("p");
      anchors.forEach((a, i) => {
        const link = document.createElement("a");
        link.href = a.getAttribute("href") || "#";
        const visible = (a.textContent || "").replace(/\s+/g, " ").trim();
        const label = visible || (a.getAttribute("aria-label") || "").replace(/social media/i, "").replace(/\s+/g, " ").trim();
        link.textContent = label || "#";
        if (i > 0) p.append(document.createTextNode(" "));
        p.append(link);
      });
      return p;
    };
    const buildBody = (scope) => {
      const body = [];
      const name = scope.querySelector(NAME_SEL);
      if (name) body.push(name);
      const role = scope.querySelector(ROLE_SEL);
      if (role) body.push(role);
      const social = buildSocialParagraph(Array.from(scope.querySelectorAll(SOCIAL_LINK_SEL)));
      if (social) body.push(social);
      return body;
    };
    const buildRow = (scope) => {
      const image = scope.querySelector("picture, img");
      const body = buildBody(scope);
      if (!image && body.length === 0) return null;
      return [image || "", body.length ? body : ""];
    };
    const cells = [];
    let personEls = Array.from(
      element.querySelectorAll("section.cmp-experience-fragment--contributor")
    );
    if (personEls.length === 0 && typeof element.matches === "function" && element.matches("section.cmp-experience-fragment--contributor")) {
      personEls = [element];
    }
    if (personEls.length > 0) {
      personEls.forEach((person) => {
        const row = buildRow(person);
        if (row) cells.push(row);
      });
    } else {
      const markers = Array.from(
        element.querySelectorAll(`img, h3, h5, ${SOCIAL_LIST_SEL}`)
      );
      let current = null;
      const flush = () => {
        if (!current) return;
        const body = [];
        if (current.name) body.push(current.name);
        if (current.role) body.push(current.role);
        const social = buildSocialParagraph(current.social);
        if (social) body.push(social);
        if (current.image || body.length) {
          cells.push([current.image || "", body.length ? body : ""]);
        }
        current = null;
      };
      markers.forEach((el) => {
        if (el.tagName === "IMG") {
          if (el.closest(SOCIAL_LIST_SEL)) return;
          flush();
          current = { image: el, name: null, role: null, social: [] };
        } else if (!current) {
        } else if (el.tagName === "H3" && !current.name) {
          current.name = el;
        } else if (el.tagName === "H5" && !current.role) {
          current.role = el;
        } else if (el.matches(SOCIAL_LIST_SEL)) {
          current.social.push(...Array.from(el.querySelectorAll("a")));
        }
      });
      flush();
    }
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-people", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/wknd-members-teasers.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function getValidHref(teaser) {
    const anchor = teaser.querySelector(
      ".cmp-teaser__title a[href], .cmp-teaser__action-container a[href], a[href]"
    );
    if (!anchor) return null;
    const href = (anchor.getAttribute("href") || "").trim();
    if (!href || href === "#" || href.toLowerCase().startsWith("javascript:")) return null;
    return href;
  }
  function buildCardRow(teaser, doc) {
    const image = teaser.querySelector(".cmp-teaser__image img, .cmp-image img, img");
    const textCell = [];
    const titleEl = teaser.querySelector(".cmp-teaser__title");
    const titleText = titleEl ? titleEl.textContent.trim() : "";
    if (titleText) {
      const heading = doc.createElement("h3");
      const href = getValidHref(teaser);
      if (href) {
        const link = doc.createElement("a");
        link.href = href;
        link.textContent = titleText;
        heading.append(link);
      } else {
        heading.textContent = titleText;
      }
      textCell.push(heading);
    }
    const descEl = teaser.querySelector(".cmp-teaser__description");
    if (descEl) {
      const innerP = descEl.querySelector("p");
      if (innerP && innerP.textContent.trim()) {
        textCell.push(innerP);
      } else {
        const descText = descEl.textContent.trim();
        if (descText) {
          const p = doc.createElement("p");
          p.textContent = descText;
          textCell.push(p);
        }
      }
    }
    if (!image && textCell.length === 0) return null;
    return [image || "", textCell.length > 0 ? textCell : ""];
  }
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      const teasers = Array.from(element.querySelectorAll("div.teaser.cmp-teaser--secure"));
      if (teasers.length === 0) return;
      const doc = element.ownerDocument || payload && payload.document;
      if (!doc) return;
      const cells = [];
      teasers.forEach((teaser) => {
        const row = buildCardRow(teaser, doc);
        if (row) cells.push(row);
      });
      if (cells.length === 0) return;
      const block = WebImporter.Blocks.createBlock(doc, { name: "cards-teaser", cells });
      const first = teasers[0];
      if (first.parentNode) {
        first.parentNode.insertBefore(block, first);
      }
      teasers.forEach((teaser) => teaser.remove());
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

  // tools/importer/import-landing-overview.js
  var parsers = {
    "columns-featured": parse,
    "cards-teaser": parse2,
    "cards-people": parse3
  };
  var transformers = [
    transform,
    transform2
  ];
  var PAGE_TEMPLATE = {
    name: "landing-overview",
    description: "WKND landing/overview page: title + featured teaser (columns), a grid of article cards, and a members-only section with secure teaser cards.",
    blocks: [
      {
        name: "columns-featured",
        instances: ["div.teaser.cmp-teaser--featured"]
      },
      {
        name: "cards-teaser",
        instances: ["div.image-list.list"]
      },
      {
        name: "cards-people",
        instances: ["section.cmp-experience-fragment--contributor"]
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
  var import_landing_overview_default = {
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
  return __toCommonJS(import_landing_overview_exports);
})();
