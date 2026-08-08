# WKND → AEM Edge Delivery Services — Site Scope Report

**Project:** ema-eds-capstone-demo
**Source site:** https://wknd.site/us/en
**Repository:** https://github.com/lawanya-adobe-eds/ema-eds-capstone-demo
**Content source:** Document Authoring (DA) — `da.live`
**Environments:**
- Preview: `https://main--ema-eds-capstone-demo--lawanya-adobe-eds.aem.page/`
- Live: `https://main--ema-eds-capstone-demo--lawanya-adobe-eds.aem.live/`

This report inventories the WKND site's page templates, block variants, and
pages as migrated to AEM Edge Delivery Services. It is a scoping/coverage
reference: it maps what was analyzed on the source, what was built in code, and
what content was imported.

---

## 1. Summary

| Metric | Count |
|---|---|
| Page templates identified | 6 |
| Content pages imported | 26 (content) + 3 (site config: nav, footer, index) |
| Blocks implemented | 20 |
| — mapped to a source template | 12 |
| — boilerplate/global/utility | 8 |
| Import parsers | 10 |
| Import transformers | 5 |
| Locales in scope (migrated) | 1 (`/us/en`) |

The migration covers the complete English (US) tree of WKND: the homepage, two
listing/landing pages, the FAQ page, the About Us page, 16 adventure detail
pages, and 5 magazine articles. Header, footer and navigation are global.

---

## 2. Page Templates

Six unique page templates were identified on the source. Each maps to a set of
EDS blocks; pages sharing a template share the same blocks, parsers,
transformers and CSS.

| # | Template | Representative source page | Blocks | Pages using it |
|---|----------|----------------------------|--------|----------------|
| 1 | **homepage** | `/us/en` | carousel-hero, columns-featured, cards-teaser, hero-overlay | 1 |
| 2 | **landing-overview** | `/us/en/magazine`, `/us/en/about-us` | columns-featured, cards-teaser, cards-people, magazine-listing | 2 |
| 3 | **adventures-listing** | `/us/en/adventures` | hero-overlay, adventures-listing | 1 |
| 4 | **adventure-detail** | `/us/en/adventures/bali-surf-camp` | breadcrumb, carousel-gallery, specs, tabs-adventure | 16 |
| 5 | **magazine-article** | `/us/en/magazine/arctic-surfing` | breadcrumb, quote-editorial | 5 |
| 6 | **faq** | `/us/en/faqs` | accordion-faq | 1 |

**Template notes**
- **landing-overview** covers both the Magazine index (featured teaser + article
  card grid + Members-Only secure teasers) and the About Us page (featured teaser
  + contributor cards). About Us uses the `cards-people` variant; Magazine uses
  `magazine-listing` + `cards-teaser`.
- **adventure-detail** is the highest-volume template (16 pages) — the specs
  sidebar + adventure tabs layout is shared across all of them.
- Listing pages (Adventures, Magazine) are **query-index driven** (see §6).

---

## 3. Blocks & Variants

### 3.1 Template-mapped blocks (migrated from source)

| Block | Purpose | Source template | Variants |
|-------|---------|-----------------|----------|
| `carousel-hero` | Homepage rotating hero slides | homepage | — |
| `columns-featured` | Featured-article teaser (image + text columns) | homepage, landing-overview | — |
| `cards-teaser` | Article/adventure card grid | homepage, landing-overview | — |
| `hero-overlay` | Full-width hero teaser (image + overlaid text) | homepage, adventures-listing | — |
| `cards-people` | Contributor cards (round avatar, role, social icons) | landing-overview (About Us) | — |
| `breadcrumb` | Breadcrumb trail | adventure-detail, magazine-article | — |
| `carousel-gallery` | Adventure image gallery carousel | adventure-detail | — |
| `specs` | Adventure spec pairs (Activity, Difficulty, Price…) | adventure-detail | — |
| `tabs-adventure` | Overview / Itinerary / What-to-Bring tabs; also the Current Adventures filter tabs on the listing | adventure-detail, adventures-listing | prose panels (detail) vs. card-grid panels (listing), via `:has(picture)` |
| `quote-editorial` | Pull-quote inside article body | magazine-article | — |
| `accordion-faq` | Expandable Q&A accordion | faq | — |
| `adventures-listing` | Query-index-driven adventure card grid + category filter | adventures-listing | — |

*The source authors these via AEM Core Components with a single visual style per
component, so no explicit block **class variants** were required — one CSS
contract per block. Where one block renders differently by context (e.g.
`tabs-adventure` prose vs. card grid), the variation is content-driven, not a
declared variant class.*

### 3.2 Boilerplate / global / utility blocks

| Block | Role |
|-------|------|
| `header` | Global nav + language selector + live search (query-index suggest) |
| `footer` | Global footer (nav, Follow Us social icons, legal) |
| `fragment` | Fragment inclusion (nav/footer) |
| `magazine-listing` | Query-index-driven magazine article card grid |
| `cards` | Boilerplate cards (retained) |
| `columns` | Boilerplate columns (retained) |
| `hero` | Boilerplate hero (retained) |
| `widget` | Boilerplate widget (retained) |

---

## 4. Page Inventory

26 content pages under `/us/en`, plus global config docs (nav, footer, index).

### Homepage (1)
| Path | Template |
|------|----------|
| `/us/en` | homepage |

### Listing / landing (2)
| Path | Template |
|------|----------|
| `/us/en/adventures` | adventures-listing |
| `/us/en/magazine` | landing-overview |

### Standalone (2)
| Path | Template |
|------|----------|
| `/us/en/about-us` | landing-overview |
| `/us/en/faqs` | faq |

### Adventure detail (16) — template: adventure-detail
| Path |
|------|
| `/us/en/adventures/bali-surf-camp` |
| `/us/en/adventures/beervana-portland` |
| `/us/en/adventures/climbing-new-zealand` |
| `/us/en/adventures/colorado-rock-climbing` |
| `/us/en/adventures/cycling-southern-utah` |
| `/us/en/adventures/cycling-tuscany` |
| `/us/en/adventures/downhill-skiing-wyoming` |
| `/us/en/adventures/gastronomic-marais-tour` |
| `/us/en/adventures/napa-wine-tasting` |
| `/us/en/adventures/riverside-camping-australia` |
| `/us/en/adventures/ski-touring-mont-blanc` |
| `/us/en/adventures/surf-camp-costa-rica` |
| `/us/en/adventures/tahoe-skiing` |
| `/us/en/adventures/west-coast-cycling` |
| `/us/en/adventures/whistler-mountain-biking` |
| `/us/en/adventures/yosemite-backpacking` |

### Magazine article (5) — template: magazine-article
| Path |
|------|
| `/us/en/magazine/arctic-surfing` |
| `/us/en/magazine/guide-la-skateparks` |
| `/us/en/magazine/san-diego-surf` |
| `/us/en/magazine/ski-touring` |
| `/us/en/magazine/western-australia` |

### Global config
| Doc | Role |
|-----|------|
| `nav` | Header navigation source |
| `footer` | Footer source |
| `index` | Boilerplate/demo index |

---

## 5. Import Infrastructure

Content was imported with the bundled import script using per-block parsers and
site-level transformers (no hand-authored HTML in `content/`).

**Parsers (10)** — one per block, convert source DOM → EDS block table:
`accordion-faq`, `breadcrumb`, `cards-people`, `cards-teaser`,
`carousel-gallery`, `carousel-hero`, `columns-featured`, `hero-overlay`,
`quote-editorial`, `tabs-adventure`.

**Transformers (5)** — site-wide DOM normalization:
| Transformer | Responsibility |
|-------------|----------------|
| `wknd-cleanup` | Strip source chrome/wrappers, normalize markup |
| `wknd-buttons` | Convert CTAs to EDS button/strong conventions (yellow pill CTAs) |
| `wknd-listings` | Prepare Adventures/Magazine listings for query-index blocks |
| `wknd-members-teasers` | Members-Only secure teaser cards (Magazine) |
| `wknd-specs` | Adventure spec pairs → specs block |

---

## 6. Dynamic Behaviors

Two behaviors are data-driven rather than static content:

1. **Query-index-driven listings** — The Adventures and Magazine listing pages
   render their card grids from `/us/en/query-index.json` (config in
   `helix-query.yaml`). Adventure category (Activity spec) is indexed so the
   Current Adventures tabs can filter client-side. Adding a new adventure/article
   page automatically appears in the listing once published — no listing edit.
2. **On-demand header search** — The global header's live-suggest search reads
   the same query-index to surface matching pages as the user types.

---

## 7. Scope Boundaries & Deviations

**In scope (done):** the full `/us/en` English tree — 26 pages across 6
templates, all blocks, header/footer/nav, listings, and search.

**Out of scope / not migrated:**
- **Other locales** — WKND publishes additional locale trees (e.g. `ca/en`,
  `de/de`, `fr/fr`, …). Only `/us/en` was migrated. Migrating additional locales
  would reuse all existing templates/blocks; the work is content import +
  locale-specific nav/footer, not new block development.
- **Authenticated "Members Only" content** — the Members-Only section renders as
  secure teaser cards; the gated article bodies behind sign-in are not part of
  the public migration.

**Design deviations (intentional, documented):**
- Social marks use portable inline SVG icons in place of the source's
  proprietary `wknd-icon-font`, styled to match the source's exact size/colors.
- Some source layouts built on AEM's 12-column grid are reproduced with CSS
  grid/flex at matching proportions rather than the literal grid classes.
- Two-column/parallel layouts (adventure specs+tabs, FAQ "Need more help",
  magazine "Share this story") are rebuilt at runtime/CSS to match the source
  while remaining responsive.
- Fonts (Source Sans Pro, Asar) are self-hosted from `/fonts` (latin subset)
  instead of loaded from Google Fonts, with metric-matched fallback faces — a
  performance/privacy improvement with no visual difference (see §8). The
  boilerplate's unused Roboto fonts were removed.
- The mobile nav is a light, edge-to-edge dropdown rather than the source's dark
  off-canvas drawer; the WKND yellow hover/active treatment on nav links is
  scoped to the desktop bar (the source shows no yellow on mobile).

## 8. Performance & Core Web Vitals

Optimized to EDS best practices and validated on the live site across desktop,
tablet, and mobile:

- **FCP / LCP** — the render-blocking Google Fonts `<link>` (and its two
  preconnects) was removed and the fonts self-hosted (`font-display: swap`); the
  LCP hero image is marked `fetchpriority="high"` + eager. Measured FCP/LCP are
  well within the "good" range.
- **CLS** — driven to ~0: every image carries explicit `width`/`height` (block
  images set them to the CSS aspect ratio; a `reserveImageSpace()` pass in
  `decorateMain` sets intrinsic dimensions on free-flowing content images), and
  the header reserves its true height per breakpoint (`--nav-height` 77px
  mobile/tablet, 121px desktop; `min-height` on the header) so content no longer
  shifts as the header decorates.
- **Constraints honored** — `scripts/aem.js` is never modified; all changes are
  in block CSS/JS, `styles/`, and `head.html`.

**Quality bar:** each template was validated against the source at desktop
(1440), tablet (768), and mobile (375) for visual fidelity, responsiveness, and
zero horizontal overflow, and meets Core Web Vitals per EDS best practices (§8).
