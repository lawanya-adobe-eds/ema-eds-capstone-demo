# WKND Site Analysis & Template Discovery Plan

## Objective

Analyze the structure of `https://wknd.site/us/en.html`, discover its URL inventory, and identify all **unique page templates** in use — grouping structurally-similar pages so the migration to AEM Edge Delivery Services can be scoped by template rather than page-by-page.

## Status

**Ready to execute.** This plan is finalized — no open questions. To run it, approve exiting plan mode; execution requires Execute mode. On approval I'll begin with URL discovery against the sitemap and analyze representative pages using the site-cataloging workflow.

## Approach

This is a **template discovery** task. I'll use the site cataloging workflow: discover URLs → analyze a representative sample of pages → group structurally-similar pages into templates → produce a catalog artifact. WKND is Adobe's reference demo site, so it has a well-defined, repeatable set of page types.

## Expected Template Categories (to be confirmed by analysis)

Based on WKND's known structure, I expect discovery to surface templates roughly like these — the analysis will confirm the exact set and provide real URL examples:

- **Home / Landing** — `/us/en.html` (hero, teasers, content fragments)
- **Article / Editorial** — magazine-style long-form pages under `/us/en/magazine/…`
- **Article Listing / Category** — index pages listing multiple articles
- **Adventure Detail (PDP-like)** — individual adventure pages under `/us/en/adventures/…` with itinerary, pricing, gallery
- **Adventure Listing (PLP-like)** — filterable grid of adventures
- **FAQ / Static Content** — simple text pages (about, FAQ, contact)

## Plan of Work

1. **Discover URLs** — pull the sitemap (`/sitemap.xml`) and/or crawl from the homepage to build the full URL inventory.
2. **Sample & analyze pages** — fetch a representative page per candidate type, capture DOM structure, sections, and blocks.
3. **Group into templates** — cluster pages by structural similarity; assign each group a template name, description, and example URLs.
4. **Produce the catalog** — a site catalog artifact listing each unique template with name, matching URL pattern(s), representative URL, and observed section/block composition.
5. **Report** — summarize the count of unique templates and what distinguishes each.

## Checklist

- [ ] Fetch `https://wknd.site/sitemap.xml` and homepage to build the URL inventory
- [ ] Crawl/collect all reachable URLs and normalize the path list
- [ ] Select a representative sample page for each candidate page type
- [ ] Analyze each sample's DOM structure, sections, and blocks
- [ ] Cluster pages into unique templates by structural similarity
- [ ] Name and describe each template with URL pattern + example URL
- [ ] Produce the site catalog artifact (templates + block/section composition)
- [ ] Report the final list of unique page templates and their distinguishing features

---

*Execution requires Execute mode.* Approve exiting plan mode and I'll start with sitemap-based URL discovery and representative page analysis to produce the confirmed template catalog.
