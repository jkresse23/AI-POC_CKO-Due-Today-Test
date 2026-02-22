# CKO Due Today Test

A/B test experiment for the Zip Checkout `/payment` screen. Tests whether emphasizing the **amount due today** (first installment) instead of the full order amount reduces drop-off after risk approval.

## Hypothesis

Surfacing "$62.50 due today" instead of "$250.00 total" reduces sticker shock and increases conversion after the payment plan screen.

**Goal:** +2% CVR → ~$1.16M incremental monthly TTV

## Files

- `CKO_Due_Today_Test_Variations.html` — Visual mockup doc with all variations. Open in a browser to review.

## Variations

| | Name | Description | Effort |
|---|---|---|---|
| **Control** | Current experience | "4 bi-weekly payments of $62.50" — no change | — |
| **A** | Subtle Label Swap | "Due today" replaces installment count as headline. Pure copy change. | Low |
| **B** | Bold Hero | Large 44px purple amount with "DUE TODAY" pill badge. Most aggressive. | Medium |
| **C** | Split Panel | Two-column card: "Due today $62.50" (purple) vs "Order total $250.00" (grey). | High |

## Mock Data

- Order total: $250.00
- Pay in 4: $62.50/payment, bi-weekly over 6 weeks
- Pay in 2: $125.00/payment, half now half later

## Implementation Plan

1. Select a variation (or shortlist for eng review)
2. Compliance review — especially Variation B (order total visibility)
3. Implement in `zip-frontends/apps/checkout` → `apps/checkout/src/components/PaymentPlanSpotlight` and `PaymentPlanSelector`
4. Wire Optimizely feature flag
5. QA on mobile web + desktop
6. Launch

## Related

- Confluence PRD page ID: `5146443777`
- Codebase: `quadpay/zip-frontends → apps/checkout`
- Experiment tool: Optimizely
- Product owner: John Kresse
