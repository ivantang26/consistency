# Consistency

A browser-based prop-firm consistency calculator with plan-specific rules, worked account-size examples, and a local daily P&L journal. Built with Impeccable's Operate-mode guidance.

## Run

Requires Node.js 22 or newer. No dependency installation is needed.

```sh
npm run dev
```

Open http://127.0.0.1:5173. `PORT` can override the port. The server binds to loopback and serves only the application files.

```sh
npm test
npm run build
node scripts/server.mjs --dist
```

Deploy `dist/` to a static host. No backend or API keys are required. Google Fonts supplies Manrope when reachable; the system font stack is the fallback.

## Features

- Quick summary calculations or a daily P&L journal, including losing days.
- Current percentage, remaining consistency profit, and evaluation targets.
- A next-day scenario planner that recalculates the best day.
- Least possible trading days from the consistency percentage and recorded firm minimums, plus completed and remaining day counts.
- Automatic journal counting, including size-specific qualifying winning-day thresholds, and an editable custom day minimum.
- Four firms, thirteen published plan/stage presets, and custom rules.
- Account-size examples, searchable rules, source links, CSV export, and device-local persistence.
- Responsive layouts, keyboard controls, visible focus, and reduced-motion support.

## Calculation

For net-profit rules: `best day / total profit × 100`.

The required total is `ceil(best day in cents × 10000 / rule in basis points)`. Compliance compares original integer amounts; the two-decimal display never decides compliance. The remaining amount is the larger of the consistency shortfall and the net evaluation-target shortfall. Future profits must not set a new best day for this estimate to hold. The scenario planner updates the best day when necessary.

FTMO's legacy 1-Step preset uses the sum of profitable days for consistency, while keeping net profit separate for the evaluation target. The current 1-Step preset includes losing days. Select the rule that appears in Account MetriX.

The journal uses trading-session rows rather than calendar dates. Enter one row per firm-defined session, using its reported P&L basis. Tradeify guidance excludes commissions for consistency; use the corresponding firm-reported figures.

This app checks a best-day percentage rule, any listed evaluation profit target, and the day requirements recorded for the selected preset. Drawdown, buffers, payout caps, and other account requirements are not independently qualified. It never establishes payout eligibility or gives trade recommendations.

### Minimum trading days

The consistency lower bound from a fresh window is `ceil(100 / rule percent)` (for example, 35% needs at least 3 profitable days). The displayed least total days is the larger of that bound and any recorded firm minimum. A mathematical lower bound is labeled separately when no additional firm minimum has been verified.

In quick mode, enter total sessions and any qualifying winning days. Blank counts remain unknown. The journal counts one row as one trading session with at least one trade; zero or losing P&L still counts as a session, but does not count as a qualifying win.

Tradeify Growth uses 5 winning days with profit strictly above $100/$150/$200/$250 for 25K/50K/100K/150K accounts, respectively. The equality boundary is excluded, matching the [Growth payout policy](https://help.tradeify.co/en/articles/11083796-growth-funded-account-payout-policy). Recorded session minimums include Topstep Combine (2), Topstep XFA Consistency (3), Tradeify Select (3, or 2 with the purchased 50% add-on), MFFU Rapid Intraday evaluation (2), and Rapid EOD evaluation (4). Those plan-specific sources are linked in the app.

The additional-day estimate combines the day shortfall with `ceil(additional profit / current best day)`. This assumes future days stay at or below the existing best day. If qualifying wins would need to exceed that best day, no capped estimate is shown. These are sessions, not a calendar completion date; losses or a new best day change the result.

## Rule sources

Checked 12 November 2026; rules are stored in `src/presets.js` and are not automatically refreshed.

- [Topstep consistency guidance](https://help.topstep.com/en/articles/8284208-consistency-at-topstep): 55% Trading Combine, 40% Express Funded Consistency path; 50K/100K/150K Combine targets of $3K/$6K/$9K.
- [My Funded Futures evaluation parameters](https://help.myfundedfutures.com/en/articles/11802636-traders-evaluation-simplified): Rapid Intraday 50%, Rapid EOD 30%. [Rapid funded rules](https://help.myfundedfutures.com/en/articles/13134709-rapid-plan-50k-a-comprehensive-look): no consistency requirement at that stage.
- [Tradeify consistency rules](https://help.tradeify.co/en/articles/10468320-rules-consistency-rule): Growth funded 35%, Lightning 20%/25%/30% for applicable purchase dates. [Select evaluation](https://help.tradeify.co/en/articles/12853921-select-evaluation-accounts): 40% or purchased 50% add-on. Older account targets may differ.
- [FTMO trading objectives](https://ftmo.com/en/trading-objectives/): current 1-Step 50% on total profit; applicable legacy 1-Step 50% on profitable days. Account size examples and 10% target are corroborated by the [1-Step offer](https://promo.ftmo.com/new-1-step-challenge/).

All example trading results are synthetic. Firm names identify the researched presets; this project is independent.

## Project records

Keep `PRODUCT.md`, `DESIGN.md`, `.impeccable/design.json`, and `.impeccable/surfaces/` with the source. Impeccable runtime question/review files are ignored. Browser data stays in local storage under `consistency-v1`; clearing performance inputs has an Undo action.

## Verification

Twenty-nine Node calculation tests pass, including exact thresholds, cent rounding, losses, legacy denominators, profit-basis switching, mathematical day bounds, qualifying-win thresholds, impossible/missing day counts, and scenario validation. Static build and HTTP asset checks pass. Source review identified and resolved basis-switching and notification-contrast issues.

Impeccable's rendered finish disposition is `recapture`: desktop and mobile screenshots could not be captured because browser access was unavailable and native computer use subsequently stopped on a URL-confidence policy check. Responsive layout, live browser interactions, final contrast, and font loading remain visually unverified. No deployment was performed.
