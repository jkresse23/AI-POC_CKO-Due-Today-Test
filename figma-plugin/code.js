// AI POC - CKO Due Today Test
// Creates a Figma page with all 4 variation frames (Control, A, B, C)
// Run once as a local Figma plugin.

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const T = {
  confidence:          { r: 0.102, g: 0.031, b: 0.149 }, // #1A0826
  fearlessnessMedium:  { r: 0.396, g: 0.259, b: 0.745 }, // #6542BE
  fearlessnessLight:   { r: 0.929, g: 0.902, b: 1.000 }, // #EDE6FF
  fearlessnessLighter: { r: 0.859, g: 0.800, b: 1.000 }, // #DBCCFF
  fearlessnessPill:    { r: 0.667, g: 0.369, b: 1.000 }, // #AA8FFF (pill badge bg)
  grey200:  { r: 0.957, g: 0.957, b: 0.957 }, // #F4F4F4
  grey300:  { r: 0.925, g: 0.922, b: 0.914 }, // #ECEBE9
  grey400:  { r: 0.886, g: 0.882, b: 0.875 }, // #E2E1DF
  grey500:  { r: 0.776, g: 0.765, b: 0.773 }, // #C6C3C5
  grey600:  { r: 0.549, g: 0.522, b: 0.557 }, // #8C858E
  grey700:  { r: 0.471, g: 0.431, b: 0.478 }, // #786E7A
  white:    { r: 1.000, g: 1.000, b: 1.000 },
  success:  { r: 0.122, g: 0.478, b: 0.224 }, // #1F7A39
  visaBlue: { r: 0.102, g: 0.122, b: 0.443 }, // #1A1F71
  tilaGrey: { r: 0.969, g: 0.969, b: 0.969 }, // #F7F7F7
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function rgb(color, opacity = 1) {
  return [{ color, opacity }];
}

function solid(color) {
  return [{ type: "SOLID", color }];
}

function stroke(color, weight = 1) {
  return { strokes: solid(color), strokeWeight: weight, strokeAlign: "INSIDE" };
}

async function loadFonts() {
  await Promise.all([
    figma.loadFontAsync({ family: "Inter", style: "Regular" }),
    figma.loadFontAsync({ family: "Inter", style: "Medium" }),
    figma.loadFontAsync({ family: "Inter", style: "Semi Bold" }),
    figma.loadFontAsync({ family: "Inter", style: "Bold" }),
    figma.loadFontAsync({ family: "Inter", style: "Extra Bold" }),
  ]);
}

function makeFrame(name, w, h) {
  const f = figma.createFrame();
  f.name = name;
  f.resize(w, h);
  f.fills = solid(T.white);
  f.cornerRadius = 24;
  f.clipsContent = true;
  return f;
}

function makeRect(name, w, h, fillColor, radius = 0) {
  const r = figma.createRectangle();
  r.name = name;
  r.resize(w, h);
  r.fills = solid(fillColor);
  r.cornerRadius = radius;
  return r;
}

function makeText(content, size, color, weight = "Regular") {
  const t = figma.createText();
  t.fontName = { family: "Inter", style: weight };
  t.characters = content;
  t.fontSize = size;
  t.fills = solid(color);
  t.textAutoResize = "WIDTH_AND_HEIGHT";
  return t;
}

function makeCard(name, w, h, radius = 12) {
  const f = figma.createFrame();
  f.name = name;
  f.resize(w, h);
  f.fills = solid(T.white);
  f.cornerRadius = radius;
  f.strokes = solid(T.grey400);
  f.strokeWeight = 1;
  f.strokeAlign = "INSIDE";
  f.clipsContent = true;
  return f;
}

function setPos(node, x, y) {
  node.x = x;
  node.y = y;
  return node;
}

// ─── REUSABLE SCREEN COMPONENTS ───────────────────────────────────────────────

// Zip header bar: "zip" logo left, X close right
function makeScreenHeader(parentW) {
  const h = figma.createFrame();
  h.name = "Header";
  h.resize(parentW, 52);
  h.fills = solid(T.white);
  h.strokes = solid(T.grey300);
  h.strokeWeight = 1;
  h.strokeAlign = "INSIDE";
  h.clipsContent = false;

  const logo = makeText("zip", 20, T.fearlessnessMedium, "Extra Bold");
  logo.x = 20;
  logo.y = (52 - logo.height) / 2;
  h.appendChild(logo);

  const close = makeText("✕", 14, T.grey600, "Regular");
  close.x = parentW - 20 - close.width;
  close.y = (52 - close.height) / 2;
  h.appendChild(close);

  return h;
}

// Progress bar: 4 dots, first 3 active (purple)
function makeProgressBar(parentW) {
  const g = figma.createFrame();
  g.name = "Progress";
  g.resize(parentW, 13);
  g.fills = [];
  g.clipsContent = false;

  const dotW = (parentW - 20 * 2 - 4 * 3) / 4;
  [true, true, true, false].forEach((active, i) => {
    const dot = makeRect(`dot-${i}`, dotW, 3, active ? T.fearlessnessMedium : T.grey300, 2);
    dot.x = 20 + i * (dotW + 4);
    dot.y = 5;
    g.appendChild(dot);
  });

  return g;
}

// Payment plan card shell (white card with bottom accordion toggle)
function makePlanCard(parentW) {
  const card = makeCard("PaymentPlanCard", parentW, 1, 12); // height set after content
  return card;
}

// Accordion toggle row
function makeAccordionToggle(parentW) {
  const row = figma.createFrame();
  row.name = "AccordionToggle";
  row.resize(parentW, 40);
  row.fills = solid(T.white);
  row.strokes = solid(T.grey400);
  row.strokeWeight = 1;
  row.strokeAlign = "INSIDE";
  // only top stroke
  row.strokeTopWeight = 1;
  row.strokeBottomWeight = 0;
  row.strokeLeftWeight = 0;
  row.strokeRightWeight = 0;
  row.clipsContent = false;

  const label = makeText("Payment plan summary", 13, T.grey700, "Regular");
  label.x = 16;
  label.y = (40 - label.height) / 2;
  row.appendChild(label);

  const chevron = makeText("▼", 10, T.grey500, "Regular");
  chevron.x = parentW - 16 - chevron.width;
  chevron.y = (40 - chevron.height) / 2;
  row.appendChild(chevron);

  return row;
}

// SimpleOrderSummary card
function makeOrderSummary(parentW) {
  const card = makeCard("OrderSummary", parentW, 58);

  const label = makeText("Order total", 13, T.confidence, "Semi Bold");
  label.x = 16;
  label.y = 12;
  card.appendChild(label);

  const merchant = makeText("Acme Co.", 11, T.grey600, "Regular");
  merchant.x = 16;
  merchant.y = label.y + label.height + 2;
  card.appendChild(merchant);

  const amount = makeText("$250.00", 15, T.confidence, "Bold");
  amount.x = parentW - 16 - 20 - amount.width; // leave room for chevron
  amount.y = (58 - amount.height) / 2;
  card.appendChild(amount);

  const chevron = makeText("▼", 10, T.grey500, "Regular");
  chevron.x = parentW - 16 - chevron.width;
  chevron.y = (58 - chevron.height) / 2;
  card.appendChild(chevron);

  return card;
}

// ExistingPaymentMethod (card on file)
function makePaymentMethod(parentW) {
  const card = makeCard("PaymentMethod", parentW, 52);

  const visBadge = makeRect("VisaBadge", 38, 25, T.visaBlue, 4);
  visBadge.x = 14;
  visBadge.y = (52 - 25) / 2;
  card.appendChild(visBadge);

  const visaText = makeText("VISA", 8, T.white, "Extra Bold");
  visaText.x = visBadge.x + (38 - visaText.width) / 2;
  visaText.y = visBadge.y + (25 - visaText.height) / 2;
  card.appendChild(visaText);

  const cardNum = makeText("Visa ···· 4242", 13, T.confidence, "Semi Bold");
  cardNum.x = visBadge.x + 38 + 12;
  cardNum.y = visBadge.y;
  card.appendChild(cardNum);

  const expiry = makeText("Expires 09/28", 11, T.grey600, "Regular");
  expiry.x = cardNum.x;
  expiry.y = cardNum.y + cardNum.height + 2;
  card.appendChild(expiry);

  return card;
}

// DynamicTila block
function makeTila(parentW) {
  const bg = figma.createFrame();
  bg.name = "TILA";
  bg.resize(parentW, 100);
  bg.fills = solid(T.tilaGrey);
  bg.cornerRadius = 10;
  bg.clipsContent = false;

  const header = makeText("TRUTH IN LENDING DISCLOSURE", 9, T.grey700, "Bold");
  header.x = 14;
  header.y = 12;
  bg.appendChild(header);

  const rows = [
    ["Annual percentage rate", "0%"],
    ["Finance charge", "$0.00"],
    ["Amount financed", "$250.00"],
    ["Total of payments", "$250.00"],
  ];

  let yOff = header.y + header.height + 8;
  rows.forEach(([label, val]) => {
    const lbl = makeText(label, 11, T.grey700, "Regular");
    lbl.x = 14;
    lbl.y = yOff;
    bg.appendChild(lbl);

    const v = makeText(val, 11, T.grey700, "Semi Bold");
    v.x = parentW - 14 - v.width;
    v.y = yOff;
    bg.appendChild(v);

    yOff += lbl.height + 5;
  });

  bg.resize(parentW, yOff + 10);
  return bg;
}

// Legal copy
function makeLegalCopy(parentW) {
  const t = figma.createText();
  t.name = "LegalCopy";
  t.fontName = { family: "Inter", style: "Regular" };
  t.characters = 'By tapping "Agree and continue", I acknowledge I have read the Truth in Lending Disclosure and grant Zip authorization to charge my card on or after payment due dates. Subject to our Terms & Conditions.';
  t.fontSize = 10;
  t.fills = solid(T.grey600);
  t.textAutoResize = "HEIGHT";
  t.resize(parentW, 10);
  return t;
}

// CTA button
function makeCTA(parentW, label) {
  const btn = figma.createFrame();
  btn.name = "CTAButton";
  btn.resize(parentW, 50);
  btn.fills = solid(T.fearlessnessMedium);
  btn.cornerRadius = 14;

  const txt = makeText(label, 16, T.white, "Bold");
  txt.x = (parentW - txt.width) / 2;
  txt.y = (50 - txt.height) / 2;
  btn.appendChild(txt);

  return btn;
}

// Assemble a full screen from components, stacking vertically with 12px gap
function assembleScreen(frame, components) {
  const PADDING = 20;
  const GAP = 12;
  let yOff = 0;

  components.forEach(comp => {
    comp.x = PADDING;
    comp.y = yOff;

    // Resize to fit content width
    const targetW = frame.width - PADDING * 2;
    if (comp.width !== targetW) {
      comp.resize(targetW, comp.height);
    }

    frame.appendChild(comp);
    yOff += comp.height + GAP;
  });

  // Resize frame height to fit content + bottom padding
  frame.resize(frame.width, yOff + PADDING);
}

// Build the outer phone shell (header + progress + body content)
function buildMobileScreen(name, bodyComponents) {
  const W = 390;
  const shell = figma.createFrame();
  shell.name = name;
  shell.resize(W, 100); // will be resized
  shell.fills = solid(T.white);
  shell.cornerRadius = 28;
  shell.clipsContent = true;

  const header = makeScreenHeader(W);
  header.x = 0;
  header.y = 0;
  shell.appendChild(header);

  const progress = makeProgressBar(W);
  progress.x = 0;
  progress.y = header.height;
  shell.appendChild(progress);

  // Body
  const bodyY = header.height + progress.height + 8;
  const PADDING = 20;
  const GAP = 12;
  let yOff = bodyY;

  bodyComponents.forEach(comp => {
    comp.x = PADDING;
    comp.y = yOff;
    const targetW = W - PADDING * 2;
    if (Math.abs(comp.width - targetW) > 1) {
      comp.resize(targetW, comp.height);
    }
    shell.appendChild(comp);
    yOff += comp.height + GAP;
  });

  shell.resize(W, yOff + PADDING);
  return shell;
}

// ─── SPOTLIGHT VARIANTS ───────────────────────────────────────────────────────

function makeSpotlightControl(w) {
  const inner = figma.createFrame();
  inner.name = "SpotlightControl";
  inner.fills = [];
  inner.resize(w, 70);
  inner.clipsContent = false;

  const eyebrow = makeText("4 bi-weekly payments of", 13, T.grey700, "Regular");
  eyebrow.x = 0; eyebrow.y = 0;
  inner.appendChild(eyebrow);

  const dollar = makeText("$", 16, T.confidence, "Regular");
  dollar.x = 0; dollar.y = eyebrow.height + 6;
  inner.appendChild(dollar);

  const amount = makeText("62", 28, T.confidence, "Regular");
  amount.x = dollar.width + 2; amount.y = eyebrow.height + 4;
  inner.appendChild(amount);

  const cents = makeText(".50", 18, T.confidence, "Regular");
  cents.x = amount.x + amount.width; cents.y = eyebrow.height + 10;
  inner.appendChild(cents);

  inner.resize(w, eyebrow.height + 6 + 34);
  return inner;
}

function makeSpotlightA(w) {
  const inner = figma.createFrame();
  inner.name = "SpotlightA";
  inner.fills = [];
  inner.resize(w, 80);
  inner.clipsContent = false;

  const label = makeText("Due today", 13, T.grey700, "Regular");
  label.x = 0; label.y = 0;
  inner.appendChild(label);

  const dollar = makeText("$", 16, T.confidence, "Regular");
  dollar.x = 0; dollar.y = label.height + 4;
  inner.appendChild(dollar);

  const amount = makeText("62", 28, T.confidence, "Regular");
  amount.x = dollar.width + 2; amount.y = label.height + 2;
  inner.appendChild(amount);

  const cents = makeText(".50", 18, T.confidence, "Regular");
  cents.x = amount.x + amount.width; cents.y = label.height + 8;
  inner.appendChild(cents);

  const secondary = makeText("4 bi-weekly payments of $62.50 · $250.00 total", 12, T.grey600, "Regular");
  secondary.x = 0; secondary.y = label.height + 4 + 32;
  inner.appendChild(secondary);

  inner.resize(w, label.height + 4 + 32 + secondary.height);
  return inner;
}

function makeSpotlightB(w) {
  const inner = figma.createFrame();
  inner.name = "SpotlightB";
  inner.fills = [];
  inner.resize(w, 100);
  inner.clipsContent = false;

  // Pill badge
  const pill = figma.createFrame();
  pill.name = "Pill";
  pill.fills = solid(T.fearlessnessLight);
  pill.cornerRadius = 20;
  pill.resize(88, 24);
  pill.clipsContent = false;
  const pillText = makeText("DUE TODAY", 10, T.fearlessnessMedium, "Bold");
  pillText.x = (88 - pillText.width) / 2;
  pillText.y = (24 - pillText.height) / 2;
  pill.appendChild(pillText);
  pill.x = 0; pill.y = 0;
  inner.appendChild(pill);

  const dollar = makeText("$", 22, T.fearlessnessMedium, "Semi Bold");
  dollar.x = 0; dollar.y = pill.height + 8;
  inner.appendChild(dollar);

  const amount = makeText("62", 44, T.fearlessnessMedium, "Semi Bold");
  amount.x = dollar.width + 2; amount.y = pill.height + 4;
  inner.appendChild(amount);

  const cents = makeText(".50", 28, T.fearlessnessMedium, "Semi Bold");
  cents.x = amount.x + amount.width; cents.y = pill.height + 18;
  inner.appendChild(cents);

  const secondary = makeText("then 3 more payments of $62.50 · $250.00 total", 13, T.grey600, "Regular");
  secondary.x = 0; secondary.y = pill.height + 8 + 50;
  inner.appendChild(secondary);

  inner.resize(w, pill.height + 8 + 50 + secondary.height);
  return inner;
}

function makeSpotlightC(w) {
  const inner = figma.createFrame();
  inner.name = "SpotlightC";
  inner.fills = [];
  inner.resize(w, 70);
  inner.clipsContent = false;

  const panelW = (w - 1) / 2; // 1px divider

  // Left panel: Due today
  const leftLabel = makeText("DUE TODAY", 10, T.grey600, "Bold");
  leftLabel.x = 0; leftLabel.y = 0;
  inner.appendChild(leftLabel);

  const lDollar = makeText("$", 16, T.fearlessnessMedium, "Medium");
  lDollar.x = 0; lDollar.y = leftLabel.height + 5;
  inner.appendChild(lDollar);

  const lAmount = makeText("62", 28, T.fearlessnessMedium, "Medium");
  lAmount.x = lDollar.width + 1; lAmount.y = leftLabel.height + 3;
  inner.appendChild(lAmount);

  const lCents = makeText(".50", 18, T.fearlessnessMedium, "Medium");
  lCents.x = lAmount.x + lAmount.width; lCents.y = leftLabel.height + 10;
  inner.appendChild(lCents);

  const lSub = makeText("4 bi-weekly payments", 11, T.grey600, "Regular");
  lSub.x = 0; lSub.y = leftLabel.height + 5 + 32;
  inner.appendChild(lSub);

  // Divider
  const divider = makeRect("Divider", 1, 60, T.grey400);
  divider.x = panelW + 1; divider.y = 0;
  inner.appendChild(divider);

  // Right panel: Order total
  const rX = panelW + 18;

  const rightLabel = makeText("ORDER TOTAL", 10, T.grey600, "Bold");
  rightLabel.x = rX; rightLabel.y = 0;
  inner.appendChild(rightLabel);

  const rDollar = makeText("$", 13, T.grey600, "Regular");
  rDollar.x = rX; rDollar.y = rightLabel.height + 5;
  inner.appendChild(rDollar);

  const rAmount = makeText("250", 22, T.grey600, "Regular");
  rAmount.x = rX + rDollar.width + 1; rAmount.y = rightLabel.height + 3;
  inner.appendChild(rAmount);

  const rCents = makeText(".00", 15, T.grey600, "Regular");
  rCents.x = rAmount.x + rAmount.width; rCents.y = rightLabel.height + 9;
  inner.appendChild(rCents);

  const rSub = makeText("over 6 weeks", 11, T.grey500, "Regular");
  rSub.x = rX; rSub.y = rightLabel.height + 5 + 28;
  inner.appendChild(rSub);

  inner.resize(w, rightLabel.height + 5 + 32 + lSub.height);
  return inner;
}

// Full plan card (spotlight + padding + accordion toggle)
function makePlanCardFull(spotlightFn, cardW) {
  const INNER_PAD = 16;
  const innerW = cardW - INNER_PAD * 2;
  const spotlight = spotlightFn(innerW);

  const card = makeCard("PlanCard", cardW, 100);

  spotlight.x = INNER_PAD;
  spotlight.y = INNER_PAD;
  card.appendChild(spotlight);

  const toggle = makeAccordionToggle(cardW);
  toggle.x = 0;
  toggle.y = INNER_PAD + spotlight.height + INNER_PAD;
  card.appendChild(toggle);

  card.resize(cardW, toggle.y + toggle.height);
  return card;
}

// ─── SECTION HEADER (variation label above the frame) ─────────────────────────
function makeSectionHeader(title, subtitle, badgeLabel, badgeColor) {
  const group = figma.createFrame();
  group.name = "SectionHeader";
  group.fills = [];
  group.resize(800, 100);
  group.clipsContent = false;

  const badge = figma.createFrame();
  badge.name = "Badge";
  badge.resize(36, 36);
  badge.fills = solid(badgeColor);
  badge.cornerRadius = 18;
  badge.x = 0; badge.y = 0;
  const badgeTxt = makeText(badgeLabel, 15, T.white, "Extra Bold");
  badgeTxt.x = (36 - badgeTxt.width) / 2;
  badgeTxt.y = (36 - badgeTxt.height) / 2;
  badge.appendChild(badgeTxt);
  group.appendChild(badge);

  const titleTxt = makeText(title, 22, T.confidence, "Bold");
  titleTxt.x = 50; titleTxt.y = 4;
  group.appendChild(titleTxt);

  const subTxt = makeText(subtitle, 13, T.grey700, "Regular");
  subTxt.resize(700, subTxt.height);
  subTxt.textAutoResize = "HEIGHT";
  subTxt.x = 50; subTxt.y = titleTxt.height + 10;
  group.appendChild(subTxt);

  group.resize(800, subTxt.y + subTxt.height + 8);
  return group;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  await loadFonts();

  // Create or reuse a page
  let page = figma.root.children.find(p => p.name === "AI POC - CKO Due Today Test");
  if (!page) {
    page = figma.createPage();
    page.name = "AI POC - CKO Due Today Test";
  }
  figma.currentPage = page;

  // Clear existing content on page
  page.children.slice().forEach(n => n.remove());

  const FRAME_GAP = 80;   // vertical gap between variation sections
  const LABEL_GAP = 24;   // gap between section header and phone frame
  let pageY = 60;
  const PAGE_X = 60;

  // ── Variation definitions ──────────────────────────────────────────────────
  const variations = [
    {
      id: "control",
      badgeLabel: "C",
      badgeColor: T.grey500,
      title: "Control — Current Experience",
      subtitle: "Current production layout. Primary headline is installment count + per-payment amount. No \"due today\" framing.",
      spotlightFn: makeSpotlightControl,
      ctaLabel: "Agree and continue",
    },
    {
      id: "var-a",
      badgeLabel: "A",
      badgeColor: T.fearlessnessMedium,
      title: "Variation A — Subtle \"Due Today\" Label Swap",
      subtitle: "\"Due today\" replaces installment count as headline. Secondary line retains plan structure. Lowest dev effort — pure copy change.",
      spotlightFn: makeSpotlightA,
      ctaLabel: "Agree and continue",
    },
    {
      id: "var-b",
      badgeLabel: "B",
      badgeColor: T.fearlessnessMedium,
      title: "Variation B — Bold \"Due Today\" Hero",
      subtitle: "Purple pill badge + 44px purple hero amount. \"Then 3 more payments\" framing. Highest visual differentiation from control.",
      spotlightFn: makeSpotlightB,
      ctaLabel: "Agree and continue",
    },
    {
      id: "var-c",
      badgeLabel: "C",
      badgeColor: T.fearlessnessMedium,
      title: "Variation C — Split \"Due Today / Order Total\" Panel",
      subtitle: "Two-column card: \"Due today\" in purple (left) vs \"Order total\" in grey (right). Makes Zip value prop explicit. Strongest compliance posture.",
      spotlightFn: makeSpotlightC,
      ctaLabel: "Agree and continue",
    },
  ];

  variations.forEach(v => {
    // Section header
    const header = makeSectionHeader(v.title, v.subtitle, v.badgeLabel, v.badgeColor);
    header.x = PAGE_X;
    header.y = pageY;
    page.appendChild(header);
    pageY += header.height + LABEL_GAP;

    // Build body components for full screen
    const CARD_W = 390 - 40; // 390px shell - 20px padding each side
    const planCard = makePlanCardFull(v.spotlightFn, CARD_W);
    const orderSummary = makeOrderSummary(CARD_W);
    const paymentMethod = makePaymentMethod(CARD_W);
    const tila = makeTila(CARD_W);
    const legal = makeLegalCopy(CARD_W);
    const cta = makeCTA(CARD_W, v.ctaLabel);

    // Assemble full mobile screen
    const screen = buildMobileScreen(`${v.id} — Full Screen`, [
      planCard, orderSummary, paymentMethod, tila, legal, cta,
    ]);
    screen.x = PAGE_X;
    screen.y = pageY;
    page.appendChild(screen);

    pageY += screen.height + FRAME_GAP;
  });

  // Zoom to fit all content
  figma.viewport.scrollAndZoomIntoView(page.children);

  figma.closePlugin("✅ AI POC - CKO Due Today Test frames created.");
}

main().catch(err => figma.closePlugin("❌ Error: " + err.message));
