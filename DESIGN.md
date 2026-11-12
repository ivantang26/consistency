---
name: Consistency
description: A quiet working desk for prop-firm consistency calculations.
colors:
  primary: "#6056ce"
  primary-hover: "#4e43b6"
  paper: "#f7f8fb"
  rail: "#f0eff7"
  work-surface: "#fff"
  result-surface: "#f0edfb"
  ink: "#282735"
  muted: "#6c6b7d"
  supporting-ink: "#70647e"
  result-ink: "#49405f"
  metric-ink: "#494061"
  line: "#e9e9f0"
  field-line: "#dedee9"
  selection-surface: "#e3def6"
  selection-ink: "#5748b5"
  chip-surface: "#f1edfc"
  chip-ink: "#6252b6"
  meter-track: "#e0d9ee"
  meter-fill: "#8d7ac9"
  threshold: "#7a6b98"
  best-day: "#8f7acb"
  other-days: "#dcd3ee"
  warning-surface: "#fbf0da"
  success-surface: "#e5f1e9"
  success-ink: "#236e53"
  error: "#b33f4d"
  focus: "#9587ec"
  field-focus: "#8d7de1"
  field-focus-halo: "#eee9ff"
typography:
  display:
    fontFamily: "Manrope, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "57px"
    fontWeight: 750
    lineHeight: 1.2
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Manrope, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "28px"
    fontWeight: 800
    lineHeight: 1.35
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Manrope, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "15px"
    fontWeight: 750
    lineHeight: 1.5
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Manrope, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "12px"
    lineHeight: 1.7
  label:
    fontFamily: "Manrope, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "12px"
    fontWeight: 650
    lineHeight: 1.5
  money-input:
    fontFamily: "Manrope, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "23px"
    fontWeight: 650
    letterSpacing: "-0.025em"
rounded:
  meter: "4px"
  compact: "5px"
  control: "7px"
  navigation: "8px"
  notification: "10px"
  panel: "14px"
spacing:
  tight: "4px"
  small: "8px"
  control: "12px"
  compact: "14px"
  stack: "18px"
  section: "22px"
  panel-inline: "26px"
  workspace-inline: "40px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.work-surface}"
    rounded: "{rounded.control}"
    padding: "10px 14px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.work-surface}"
    textColor: "#514d65"
    rounded: "{rounded.control}"
    padding: "10px 14px"
  money-input:
    backgroundColor: "{colors.work-surface}"
    textColor: "{colors.ink}"
    typography: "{typography.money-input}"
    rounded: "{rounded.control}"
    padding: "10px 14px"
  navigation-active:
    backgroundColor: "{colors.selection-surface}"
    textColor: "{colors.selection-ink}"
    rounded: "{rounded.navigation}"
    padding: "13px 12px"
  rule-chip:
    backgroundColor: "{colors.chip-surface}"
    textColor: "{colors.chip-ink}"
    rounded: "{rounded.compact}"
    padding: "5px 9px"
  panel:
    backgroundColor: "{colors.work-surface}"
    rounded: "{rounded.panel}"
  result-panel:
    backgroundColor: "{colors.result-surface}"
    textColor: "{colors.result-ink}"
    rounded: "{rounded.panel}"
    padding: "25px 27px"
---

# Design System: Consistency

## Overview

**Creative North Star: "The Investment Research Desk"**

Consistency uses a cool, light workspace with a lavender navigation rail, white work areas, and a violet result surface. The visual character is calm and compact: the work is choosing a precise account and understanding a number, so selection, input, and calculated evidence carry the emphasis.

This records the implemented source in `index.html`, `styles.css`, and `src/app.js`, informed by `PRODUCT.md` and the surface direction. The named world describes the code-led direction assumed during implementation; it is not a claim of an explicit user selection. Desktop and mobile screenshots were unavailable, so visual verification and final acceptance remain incomplete. The system is light-only in the current source.

**Key Characteristics:**

- Tonal lavender separation between navigation, editable work, and calculated results.
- One sans-serif family, compact labels, and tabular financial figures.
- Quiet borders, gently rounded containers, and sparse shadows.
- Accessible HTML, CSS, and inline SVG rather than shipping raster imagery.

## Colors

The palette combines cool paper and plum-tinted text with a restrained violet action and data family; the frontmatter records the source values.

The sidecar's tonal ramps are synthesized OKLCH preview metadata, not additional production colors or a source-defined scale.

### Primary

- **Working Violet** (`primary`, `primary-hover`): filled actions and interactive emphasis, with a deeper hover state.
- **Data Violet** (`meter-fill`, `best-day`, `other-days`, `threshold`): quantitative share, the comparison remainder, and the dashed rule marker.
- **Selection Lavender** (`selection-surface`, `selection-ink`): the active destination; mobile uses a slightly stronger lavender background from the source.
- **Rule Lavender** (`chip-surface`, `chip-ink`): compact account-rule context.

### Secondary

- **Success Green** (`success-surface`, `success-ink`): a consistency check that is met.
- **Warning Cream** (`warning-surface`): a check that needs attention, paired with supporting ink.
- **Error Rose** (`error`): invalid fields and input error messages.

### Neutral

- **Cool Paper** (`paper`): the main page ground.
- **Lavender Rail** (`rail`): persistent navigation.
- **White Work Surface** (`work-surface`): inputs, account selection, and supporting panels.
- **Result Wash** (`result-surface`): the live calculation region.
- **Charcoal Plum** (`ink`): base foreground; **Supporting Plum** (`supporting-ink`) and **Muted Slate** (`muted`) carry explanatory text.
- **Result Plum** (`result-ink`, `metric-ink`): result titles and the dominant percentage.
- **Quiet Line** (`line`, `field-line`): panel division and editable boundaries.
- **Focus Violet** (`focus`, `field-focus`, `field-focus-halo`): keyboard focus and field focus treatment.

**The Result Wash Rule.** Use the tinted result surface to distinguish calculated evidence from white editable work areas.

## Typography

**Display Font:** Manrope, with native sans-serif fallbacks.
**Body Font:** Manrope, with the same fallbacks.

**Character:** Rounded but precise, with substantial weights for figures and concise headings. Type changes weight and scale rather than introducing a decorative second voice. Manrope is loaded from Google Fonts; a live font-load check is still owed.

### Hierarchy

- **Display:** the `display` role is the live consistency percentage. Its source size becomes (62px) at the wide breakpoint, (52px) below the medium breakpoint, (47px) below the compact breakpoint, and returns to the base display size on mobile. The percent suffix is smaller (30px).
- **Headline:** the `headline` role is the page heading; it reduces to (25px) at compact widths.
- **Title:** the `title` role defines panel headings; contextual compact headings sometimes reduce to (14px).
- **Body:** the `body` role describes explanatory copy. Long guide paragraphs use a more generous line height (1.95) and a source maximum width (75ch).
- **Label:** the `label` role defines controls and account fields. Navigation uses the same size and weight; buttons increase weight to (700).
- **Money input:** the `money-input` role enlarges editable profit figures; mobile increases these figures to (25px).

**The Stable Figures Rule.** Keep financial values tabular in inputs, ratios, scenario values, and tables so numerical changes preserve alignment.

## Layout

The desktop shell has a fixed left navigation rail (216px) and a main workspace offset by that width. Main padding is (42px 40px 0), with a maximum width (1616px). Account fields use a three-column grid (1fr 1.4fr .85fr) and gaps (18px). Calculator and supporting grids use a slightly wider input column (1.07fr 1fr) with gaps (22px). These are observed defaults for this surface, not requirements that every future screen use the same composition.

The source adapts at four viewport thresholds. At (1500px) and wider, the rail expands to (230px), main padding becomes (48px 55px 0), and the main work panels gain padding. At (1200px) and below, the rail contracts to (194px), main padding becomes (32px 26px 0), and panels tighten. At (960px) and below, the rail contracts to (176px), account fields wrap, supporting panels and guide columns stack, and the export action becomes icon-only. At (700px) and below, navigation becomes a sticky top bar, the main offset disappears, account and calculator fields stack, and content uses horizontal padding (18px).

The spacing vocabulary is compact: small gaps support controls, medium gaps separate fields, and larger padding gives panels clear boundaries. Wide comparison tables retain minimum widths and scroll within their own containers on small screens. The responsive behavior is source-defined and awaits rendered desktop/mobile verification.

Large remaining-profit figures can wrap within their container, and result and scenario rows wrap when their content needs more room. Headline ratios also allow wrapping rather than forcing the workspace wider.

## Elevation & Depth

Depth comes primarily from tonal layering and single-pixel borders. Work panels remain flat; selected segmented controls use a small shadow, and the transient toast receives a larger shadow. The global keyboard focus ring is an outline (3px) with an offset (3px). Field focus uses a violet border and a pale outline; these are state affordances, not elevation.

### Shadow Vocabulary

- **Selected segment** (`0 1px 5px #28243f0c`): a small lift for the selected input mode.
- **Toast** (`0 5px 22px #33274021`): separation for a temporary overlay above the workspace.

**The Quiet Surface Rule.** Use tonal fill and borders for normal panel separation; preserve shadows for selected segments and transient overlays.

## Shapes

Panels use the `panel` radius; buttons, selects, and input wraps use the `control` radius. Navigation and segmented containers use the `navigation` radius. Compact chips, badges, and inner segments use the `compact` radius. Data bars are clipped, gently rounded strips, with a dashed vertical line distinguishing a threshold from a measured value.

Icons are inline SVG strokes with round caps and joins. The default icon size is (18px), with smaller sizes in compact controls. Firm initials appear in rounded square identity tiles. The brand mark is a separate SVG, not a raster asset.

## Components

### Buttons

Compact and direct. Primary buttons use Working Violet and white text; secondary buttons use a white fill, muted plum foreground, and a fine border. Both use the recorded control shape and padding, with a minimum height rather than a rigid fixed height. Hover shifts fill and border. Keyboard focus uses the global outline. Disabled buttons reduce opacity to (.5) and use a disabled cursor. Text actions remain unfilled and underline on hover.

### Chips

Rule chips carry a pale lavender fill, violet text, and a fine lavender border. They are informational labels, not substitute buttons. Status badges combine written state, an inline SVG icon, and warning, success, or neutral fill, so meaning is not assigned by color alone.

### Cards / Containers

White work panels have a single quiet border and the recorded panel radius. The performance panel uses padding (25px 26px 19px); the result panel uses its frontmatter padding. Smaller explanatory panels use padding (22px 26px). At rest they have no shadow. Library tables and guide content reuse these surfaces.

### Inputs / Fields

Money inputs have a separate currency prefix, tabular figures, a fine field boundary, and the recorded control radius. Focus-within changes the border and adds the pale focus halo. Invalid inputs use the error border and a written error. Selects share the same visual family and use an embedded SVG chevron. Labels and help text remain outside the editable value. Search adds an inline SVG at the left.

### Navigation

The desktop rail uses stacked links, compact SVG icons, and a lavender active fill marked by `aria-current="page"`. Hover uses a slightly deeper rail tint. On mobile, links become equal-width horizontal destinations in the sticky header. The selected mobile fill is stronger than the desktop fill. Do not infer a dark-mode variant from this light implementation.

### Input Mode Selector

The two-option segmented control sits on a pale gray-lavender bed. Each option uses `aria-pressed`; the selected option becomes white with the small selected-segment shadow. Hover increases the violet emphasis. The same global keyboard ring remains available.

### Consistency Meter and Profit Strip

The meter compares a filled share to a dashed rule threshold, with written labels and an accessible image description. Visual fill caps at (100%) while the text can report ratios above that value. Exceptionally large headline ratios shorten to `>9,999%`; calculation retains the full value. The separate profit strip divides best-day profit from remaining profit using two related violet tones and a written legend. Both respond to changing values using width transitions (180ms ease-out). Reduced-motion preferences disable transitions globally.

## Do's and Don'ts

### Do:

- **Do** use the tinted result surface to separate calculated evidence from editable white work areas.
- **Do** keep financial figures tabular and preserve their written labels, formula, and status context.
- **Do** retain keyboard focus treatments and use written status alongside state color.
- **Do** respect the source responsive transitions from a rail to a sticky top navigation bar.
- **Do** label source-only design documentation and unresolved rendered verification honestly.

### Don't:

- **Don't** equate a successful consistency badge with full payout or funded-account eligibility.
- **Don't** make a normal work panel visually elevated with the toast shadow.
- **Don't** introduce automatic entrance motion; the implemented motion is limited to changing state and data.
- **Don't** treat the absence of desktop and mobile screenshots as completed visual acceptance.
