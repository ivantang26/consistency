---
version: 1
slug: "index-html"
primary_target: "index.html"
related_targets: ["styles.css","src/app.js"]
---

# Calculator workspace

Mode: Operate. Route: /. Primary artifact: index.html; related: styles.css, src/app.js.

## Direction contract

THESIS: Make best-day concentration and the profit needed to reduce it immediately understandable in a working calculation tool.

OWN-WORLD: Independent investment research reviews; cool paper, a lavender navigation rail, white work areas, dark violet typography, purple selection and data. Familiar sans-serif controls, tabular figures, quiet borders, 12–16px panel corners.

STORY: Select the precise account, enter performance or daily P&L, read the best-day share and remaining amount, then inspect the formula or compare published rules.

FIRST VIEWPORT: A 216px navigation rail; a compact workspace heading; a three-control account row; two columns containing performance inputs and a live consistency result. The signature move is a split profit strip separating the best day from the rest, with a movable rule threshold. Primary actions are selecting a plan and editing profit.

FORM: Grounded candidate 6, investment research review. Ordered candidates: risk review digest, endurance race splits, Swiss exchange publications, air-travel wayfinding, mathematical workbooks, investment research review, competition standings. seed:7409c508a88b1cd8. Local catalog-only selection, online roll unavailable. Direction offered through the structured question fallback after browser opening failed; unanswered, proceeding under the stated assumption.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

Visual data is rendered as accessible HTML/CSS/SVG, with locally served official firm icons carrying embedded source provenance. Built directly in code under Operate mode. State changes transition in 180ms, without entrance animation; reduced motion disables transitions.

## Minimum trading days extension

Use whole-number completed-count fields under quick P&L and a flat day-progress section below the existing result. Reuse the result palette, typography, and border spacing. Growth counts only wins strictly above the selected account-size threshold. The journal counts actual entered sessions automatically; summary counts remain unknown until entered. Keep sourced requirements in the rule library and day progress in scenario/export output.

## Empty calculation refinement

Remove the profit-basis selector, column, account note, and fixed “at least” chip. Start with blank profit and completed-day inputs and an empty journal, including after migrating old saved synthetic defaults. Explicit examples load financial amounts only. The live result shows days needed for the entered remaining profit rather than a fixed reciprocal-day figure from the start. Hide day results until performance inputs are valid and show an instructional empty state before entry. Preserve the existing visual system and its outstanding rendered-review limitation.

## Firm identity icons

Use the official Tradeify, Topstep, My Funded Futures, and FTMO website icons in the selected account, comparison rows, and library headings. Preserve each mark's original colors and proportions at a quiet 26–32px size. Keep the native select and visible firm names, hide decorative duplicate marks from assistive technology, and use the existing sliders icon for a custom rule. Bundle all four PNGs in the static build; source records live in `assets/firms/README.md` and inside the image metadata.
