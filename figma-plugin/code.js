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
  dark:     { r: 0.098, g: 0.098, b: 0.098 }, // #191919 (logo color)
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function solid(color) {
  return [{ type: "SOLID", color }];
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

// Text that wraps at a fixed width
function makeWrappedText(content, size, color, weight, width) {
  const t = figma.createText();
  t.fontName = { family: "Inter", style: weight };
  t.fontSize = size;
  t.fills = solid(color);
  t.textAutoResize = "HEIGHT";
  t.resize(width, 20);
  t.characters = content;
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

// ─── SCREEN HEADER (headerRedesign — centered SVG logo, no progress bar) ──────
const ZIP_LOGO_SVG = `<svg width="65" height="22" viewBox="0 0 65 22" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M1.81635 17.5474L2.32973 21.7154H20.3506L19.7627 16.9439H11.3731L11.2985 16.3535L19.0385 10.9785L18.5208 6.80615H0.5L1.08797 11.5776H9.50823L9.58283 12.1724L1.81635 17.5474Z" fill="#191919"/>
  <path d="M20.6201 6.80615L22.463 21.7154H40.4969L38.676 6.80615H20.6201Z" fill="#AA8FFF"/>
  <path d="M59.4112 12.1866C58.9722 8.83656 56.3396 6.80726 52.7415 6.82038H40.7451L42.5881 21.7297H47.9852L47.6166 18.7469H53.3207C57.8228 18.7469 59.8806 15.9522 59.4112 12.1866ZM52.746 14.5658H47.1032L46.6644 10.9883H52.3378C53.6542 10.9883 54.3563 11.7493 54.466 12.7727C54.4999 13.0082 54.4796 13.2484 54.4065 13.4749C54.3334 13.7014 54.2093 13.9083 54.0438 14.0799C53.8785 14.2515 53.6761 14.3833 53.4519 14.4652C53.2278 14.5471 53.0409 14.5658 52.746 14.5658Z" fill="#191919"/>
  <path d="M26.1152 4.88723C27.0674 3.87697 26.9095 2.18879 25.7598 1.11292C24.6102 0.03704 22.899 -0.0154369 21.9423 0.994837C20.9858 2.00512 21.1482 3.69765 22.2978 4.77353C23.4475 5.84941 25.1587 5.89751 26.1152 4.88723Z" fill="#191919"/>
</svg>`;

function makeScreenHeader(parentW) {
  const HEADER_H = 56;
  const h = figma.createFrame();
  h.name = "Header";
  h.resize(parentW, HEADER_H);
  h.fills = solid(T.white);
  h.strokes = solid(T.grey400);
  h.strokeWeight = 1;
  h.strokeAlign = "INSIDE";
  h.clipsContent = false;

  // Centered Zip logo SVG (with -7px optical offset matching real ZipLogo component)
  const logo = figma.createNodeFromSvg(ZIP_LOGO_SVG);
  logo.name = "ZipLogo";
  logo.resize(65, 22);
  logo.x = (parentW - 65) / 2 - 7;
  logo.y = (HEADER_H - 22) / 2 - 7;
  h.appendChild(logo);

  // CloseIconThin (24×24, matches real component)
  const CLOSE_SVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.75 5.25L5.25 18.75" stroke="#1A0826" stroke-width="1.5" stroke-linecap="square" stroke-linejoin="round"/>
    <path d="M18.75 18.75L5.25 5.25" stroke="#1A0826" stroke-width="1.5" stroke-linecap="square" stroke-linejoin="round"/>
  </svg>`;
  const close = figma.createNodeFromSvg(CLOSE_SVG);
  close.name = "CloseIcon";
  close.resize(24, 24);
  close.x = parentW - 8 - 24;
  close.y = (HEADER_H - 24) / 2;
  h.appendChild(close);

  return h;
}

// ─── PAYMENT PLAN SPOTLIGHT VARIANTS ──────────────────────────────────────────

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

  const panelW = (w - 1) / 2;

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

  const divider = makeRect("Divider", 1, 60, T.grey400);
  divider.x = panelW + 1; divider.y = 0;
  inner.appendChild(divider);

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

// ─── PAYINNINSTALLMENTGRAPHIC (accordion expanded) ────────────────────────────
function makeInstallmentCircles(innerW) {
  const CIRCLE_SIZE = 32;
  const colW = innerW / 4;

  const grid = figma.createFrame();
  grid.name = "PayInNInstallmentGraphic";
  grid.fills = [];
  grid.clipsContent = false;
  grid.resize(innerW, 80);

  const installments = [
    { num: "1", price: "$62.50", date: "Due Today", active: true },
    { num: "2", price: "$62.50", date: "Mar 7th",   active: false },
    { num: "3", price: "$62.50", date: "Mar 21st",  active: false },
    { num: "4", price: "$62.50", date: "Apr 4th",   active: false },
  ];

  let maxH = 0;
  installments.forEach((inst, i) => {
    const centerX = i * colW + colW / 2;
    const circleX = centerX - CIRCLE_SIZE / 2;

    // Circle
    const circle = figma.createEllipse();
    circle.resize(CIRCLE_SIZE, CIRCLE_SIZE);
    circle.x = circleX; circle.y = 0;
    if (inst.active) {
      circle.fills = solid(T.fearlessnessMedium);
      circle.strokes = solid(T.fearlessnessMedium);
    } else {
      circle.fills = [];
      circle.strokes = solid(T.grey500);
    }
    circle.strokeWeight = 2;
    circle.strokeAlign = "INSIDE";
    grid.appendChild(circle);

    // Number inside circle
    const num = makeText(inst.num, 13, inst.active ? T.white : T.grey600, inst.active ? "Semi Bold" : "Regular");
    num.x = circleX + (CIRCLE_SIZE - num.width) / 2;
    num.y = (CIRCLE_SIZE - num.height) / 2;
    grid.appendChild(num);

    // Price below circle
    const price = makeText(inst.price, 12, inst.active ? T.confidence : T.grey600, inst.active ? "Medium" : "Regular");
    price.x = centerX - price.width / 2;
    price.y = CIRCLE_SIZE + 5;
    grid.appendChild(price);

    // Date below price
    const date = makeText(inst.date, 10, T.grey600, "Regular");
    date.x = centerX - date.width / 2;
    date.y = CIRCLE_SIZE + 5 + price.height + 2;
    grid.appendChild(date);

    const itemH = CIRCLE_SIZE + 5 + price.height + 2 + date.height;
    if (itemH > maxH) maxH = itemH;
  });

  grid.resize(innerW, maxH);
  return grid;
}

// ─── PLAN CARD (spotlight + expanded accordion with circles) ──────────────────
function makePlanCardFull(spotlightFn, cardW) {
  const INNER_PAD = 16;
  const innerW = cardW - INNER_PAD * 2;
  const spotlight = spotlightFn(innerW);

  const card = makeCard("PlanCard", cardW, 100);
  card.clipsContent = false;

  spotlight.x = INNER_PAD;
  spotlight.y = INNER_PAD;
  card.appendChild(spotlight);

  // Accordion toggle row (showing as open: chevron up)
  const toggleY = INNER_PAD + spotlight.height + INNER_PAD;
  const toggle = figma.createFrame();
  toggle.name = "AccordionToggle";
  toggle.resize(cardW, 40);
  toggle.fills = solid(T.white);
  toggle.strokes = solid(T.grey400);
  toggle.strokeWeight = 1;
  toggle.strokeAlign = "INSIDE";
  toggle.strokeTopWeight = 1;
  toggle.strokeBottomWeight = 0;
  toggle.strokeLeftWeight = 0;
  toggle.strokeRightWeight = 0;
  toggle.clipsContent = false;
  toggle.x = 0; toggle.y = toggleY;

  const toggleLabel = makeText("Payment plan summary", 13, T.grey700, "Regular");
  toggleLabel.x = 16;
  toggleLabel.y = (40 - toggleLabel.height) / 2;
  toggle.appendChild(toggleLabel);

  const chevron = makeText("▲", 10, T.grey500, "Regular"); // up = open
  chevron.x = cardW - 16 - chevron.width;
  chevron.y = (40 - chevron.height) / 2;
  toggle.appendChild(chevron);
  card.appendChild(toggle);

  // Accordion body: installment circles
  const bodyY = toggleY + 40;
  const circles = makeInstallmentCircles(innerW);
  circles.x = INNER_PAD;
  circles.y = bodyY + INNER_PAD;
  card.appendChild(circles);

  card.resize(cardW, bodyY + INNER_PAD + circles.height + INNER_PAD);
  return card;
}

// ─── SIMPLE ORDER SUMMARY ─────────────────────────────────────────────────────
function makeOrderSummary(parentW) {
  const H = 52;
  const card = makeCard("OrderSummary", parentW, H);

  const label = makeText("Order total", 13, T.confidence, "Semi Bold");
  label.x = 16; label.y = (H - label.height) / 2;
  card.appendChild(label);

  const amount = makeText("$250.00", 15, T.confidence, "Bold");
  amount.x = parentW - 16 - 20 - amount.width;
  amount.y = (H - amount.height) / 2;
  card.appendChild(amount);

  const chevron = makeText("▼", 10, T.grey500, "Regular");
  chevron.x = parentW - 16 - chevron.width;
  chevron.y = (H - chevron.height) / 2;
  card.appendChild(chevron);

  return card;
}

// ─── EXISTING PAYMENT METHOD ──────────────────────────────────────────────────
function makePaymentMethod(parentW) {
  const PAD = 12;
  const ICON_SIZE = 30;
  const ROW_H = ICON_SIZE + PAD * 2; // 54

  const card = figma.createFrame();
  card.name = "PaymentMethod";
  card.resize(parentW, ROW_H);
  card.fills = solid(T.white);
  card.cornerRadius = 8;
  card.strokes = [];
  card.effects = [{
    type: "DROP_SHADOW",
    color: { r: 0, g: 0, b: 0, a: 0.078 },
    offset: { x: 0, y: 8 },
    radius: 16,
    spread: -8,
    visible: true,
    blendMode: "NORMAL",
  }];
  card.clipsContent = false;

  // Visa SVG icon (30×30)
  const VISA_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 48 48">
    <path fill="#2100c4" d="M45,35c0,2.209-1.791,4-4,4H7c-2.209,0-4-1.791-4-4V13c0-2.209,1.791-4,4-4h34c2.209,0,4,1.791,4,4V35z"/>
    <path fill="#fff" d="M15.186,19l-2.626,7.832c0,0-0.667-3.313-0.733-3.729c-1.495-3.411-3.701-3.221-3.701-3.221L10.726,30v-0.002h3.161L18.258,19H15.186z M17.689,30h2.871l1.736-11h-2.907L17.689,30z M38.008,19h-3.021l-4.71,11h2.852l0.588-1.571h3.596L37.619,30h2.613L38.008,19z M34.513,26.328l1.563-4.157l0.818,4.157H34.513z M26.369,22.206c0-0.606,0.498-1.057,1.926-1.057c0.928,0,1.991,0.674,1.991,0.674l0.466-2.309c0,0-1.358-0.515-2.691-0.515c-3.019,0-4.576,1.444-4.576,3.272c0,3.306,3.979,2.853,3.979,4.551c0,0.291-0.231,0.964-1.888,0.964c-1.662,0-2.759-0.609-2.759-0.609l-0.495,2.216c0,0,1.063,0.606,3.117,0.606c2.059,0,4.915-1.54,4.915-3.752C30.354,23.586,26.369,23.394,26.369,22.206z"/>
    <path fill="#f5bc00" d="M12.212,24.945l-0.966-4.748c0,0-0.437-1.029-1.573-1.029s-4.44,0-4.44,0S10.894,20.84,12.212,24.945z"/>
  </svg>`;
  const visaIcon = figma.createNodeFromSvg(VISA_SVG);
  visaIcon.name = "VisaIcon";
  visaIcon.resize(ICON_SIZE, ICON_SIZE);
  visaIcon.x = PAD;
  visaIcon.y = (ROW_H - ICON_SIZE) / 2;
  card.appendChild(visaIcon);

  // Brand name, type, digits — inline with gap 12
  const GAP = 12;
  let textX = PAD + ICON_SIZE + GAP;

  const brandName = makeText("Visa", 14, T.confidence, "Medium");
  brandName.x = textX; brandName.y = (ROW_H - brandName.height) / 2;
  card.appendChild(brandName);
  textX += brandName.width + GAP;

  const cardType = makeText("debit", 13, T.grey600, "Regular");
  cardType.x = textX; cardType.y = (ROW_H - cardType.height) / 2;
  card.appendChild(cardType);
  textX += cardType.width + GAP;

  const digits = makeText("•••• 4242", 13, T.grey600, "Regular");
  digits.x = textX; digits.y = (ROW_H - digits.height) / 2;
  card.appendChild(digits);

  // AngleRight arrow (right edge)
  const ARROW_SVG = `<svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 2L7 7L2 12" stroke="#1A0826" stroke-width="1.5" stroke-linecap="square" stroke-linejoin="round"/>
  </svg>`;
  const arrow = figma.createNodeFromSvg(ARROW_SVG);
  arrow.name = "AngleRight";
  arrow.resize(8, 14);
  arrow.x = parentW - PAD - 8;
  arrow.y = (ROW_H - 14) / 2;
  card.appendChild(arrow);

  return card;
}

// ─── DYNAMIC TILA (matches real component structure) ──────────────────────────
function makeTila(parentW) {
  const PAD = 16;
  const innerW = parentW - PAD * 2;

  const card = figma.createFrame();
  card.name = "DynamicTILA";
  card.fills = solid(T.white);
  card.strokes = solid(T.grey400);
  card.strokeWeight = 1;
  card.strokeAlign = "INSIDE";
  card.cornerRadius = 12;
  card.clipsContent = true;
  card.resize(parentW, 100);

  let y = PAD;

  function addRow(label, value, size, color, weight) {
    const lbl = makeText(label, size, color, weight);
    lbl.x = PAD; lbl.y = y;
    card.appendChild(lbl);
    const val = makeText(value, size, color, weight);
    val.x = parentW - PAD - val.width; val.y = y;
    card.appendChild(val);
    y += Math.max(lbl.height, val.height);
  }

  function addDivider() {
    const d = makeRect("Divider", parentW, 1, T.grey400);
    d.x = 0; d.y = y;
    card.appendChild(d);
    y += 1;
  }

  function addWrapped(text, size, color, weight, gap = 0) {
    const t = makeWrappedText(text, size, color, weight, innerW);
    t.x = PAD; t.y = y;
    card.appendChild(t);
    y += t.height + gap;
  }

  // Title
  const title = makeText("Federal Truth in Lending Disclosure", 13, T.confidence, "Semi Bold");
  title.x = PAD; title.y = y;
  card.appendChild(title);
  y += title.height + 12;

  // Due today
  addRow("Due today", "$62.50", 12, T.confidence, "Regular");
  y += 12;

  addDivider();
  y += 12;

  // Remaining payments section
  addRow("Remaining payments", "3", 12, T.confidence, "Regular");
  y += 8;
  addRow("Amount of payments", "$62.50", 12, T.confidence, "Regular");
  y += 8;
  addRow("First due", "In 2 weeks", 12, T.confidence, "Regular");
  y += 12;

  addDivider();
  y += 12;

  // Uppercase amount groups with descriptors
  const amountGroups = [
    { label: "ANNUAL PERCENTAGE RATE", value: "0%",      desc: "The cost of your credit as a yearly rate." },
    { label: "FINANCE CHARGE",         value: "$0.00",   desc: "The dollar amount the credit will cost you." },
    { label: "AMOUNT FINANCED",        value: "$250.00", desc: "The amount of credit provided to you or on your behalf." },
    { label: "TOTAL OF PAYMENTS",      value: "$250.00", desc: "The amount you will have paid after you have made all payments as scheduled." },
  ];

  amountGroups.forEach((grp, i) => {
    addRow(grp.label, grp.value, 12, T.confidence, "Medium");
    y += 3;
    addWrapped(grp.desc, 11, T.grey600, "Regular", i < amountGroups.length - 1 ? 12 : 0);
  });

  y += 12;
  addDivider();
  y += 12;

  // Info lines
  const infoLines = [
    "Prepayment: If you pay off early, you will not have to pay a penalty.",
    "Late payment: If a payment is late, you may be charged a late fee.",
    "See your contract documents for any additional information about nonpayment, default, any required repayment in full before the scheduled date, and prepayment refunds and penalties.",
  ];
  infoLines.forEach((line, i) => {
    addWrapped(line, 12, T.confidence, "Regular", i < infoLines.length - 1 ? 8 : 0);
  });

  y += 12;
  addDivider();
  y += 12;

  // Itemization
  const itemLines = [
    { text: "Itemization of amount financed", weight: "Medium" },
    { text: "Amount paid to merchant: $250.00", weight: "Regular" },
    { text: "Origination fee: $0.00",           weight: "Regular" },
    { text: "Other fee amount: $0.00",           weight: "Regular" },
  ];
  itemLines.forEach((item, i) => {
    const t = makeText(item.text, 12, T.confidence, item.weight);
    t.x = PAD; t.y = y;
    card.appendChild(t);
    y += t.height + (i < itemLines.length - 1 ? 6 : 0);
  });

  y += PAD;
  card.resize(parentW, y);
  return card;
}

// ─── LEGAL COPY ───────────────────────────────────────────────────────────────
function makeLegalCopy(parentW) {
  const t = makeWrappedText(
    'By tapping "Agree and continue", I acknowledge I have read the Truth in Lending Disclosure and grant Zip authorization to charge my card on or after payment due dates. Subject to our Terms & Conditions.',
    10, T.grey600, "Regular", parentW
  );
  t.name = "LegalCopy";
  return t;
}

// ─── CTA BUTTON ───────────────────────────────────────────────────────────────
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

// ─── MOBILE SCREEN SHELL ──────────────────────────────────────────────────────
function buildMobileScreen(name, bodyComponents) {
  const W = 390;
  const shell = figma.createFrame();
  shell.name = name;
  shell.resize(W, 100);
  shell.fills = solid(T.white);
  shell.cornerRadius = 28;
  shell.clipsContent = true;

  const header = makeScreenHeader(W);
  header.x = 0; header.y = 0;
  shell.appendChild(header);

  // No progress bar — headerRedesign variant
  const PADDING = 20;
  const GAP = 12;
  let yOff = header.height + 8;

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

// ─── SECTION HEADER (variation label above frame) ─────────────────────────────
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

  const subTxt = makeWrappedText(subtitle, 13, T.grey700, "Regular", 700);
  subTxt.x = 50; subTxt.y = titleTxt.height + 10;
  group.appendChild(subTxt);

  group.resize(800, subTxt.y + subTxt.height + 8);
  return group;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  figma.showUI(__html__, { visible: true, width: 280, height: 60 });

  await loadFonts();

  let page = figma.root.children.find(p => p.name === "AI POC - CKO Due Today Test");
  if (!page) {
    page = figma.createPage();
    page.name = "AI POC - CKO Due Today Test";
  }
  figma.currentPage = page;
  page.children.slice().forEach(n => n.remove());

  const FRAME_GAP = 80;
  const LABEL_GAP = 24;
  let pageY = 60;
  const PAGE_X = 60;

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

  const CARD_W = 390 - 40;

  variations.forEach(v => {
    const header = makeSectionHeader(v.title, v.subtitle, v.badgeLabel, v.badgeColor);
    header.x = PAGE_X; header.y = pageY;
    page.appendChild(header);
    pageY += header.height + LABEL_GAP;

    const planCard     = makePlanCardFull(v.spotlightFn, CARD_W);
    const orderSummary = makeOrderSummary(CARD_W);
    const paymentMethod = makePaymentMethod(CARD_W);
    const tila         = makeTila(CARD_W);
    const legal        = makeLegalCopy(CARD_W);
    const cta          = makeCTA(CARD_W, v.ctaLabel);

    const screen = buildMobileScreen(`${v.id} — Full Screen`, [
      planCard, orderSummary, paymentMethod, tila, legal, cta,
    ]);
    screen.x = PAGE_X; screen.y = pageY;
    page.appendChild(screen);

    pageY += screen.height + FRAME_GAP;
  });

  figma.viewport.scrollAndZoomIntoView(page.children);
  figma.closePlugin("✅ AI POC - CKO Due Today Test frames updated.");
}

main().catch(err => figma.closePlugin("❌ Error: " + err.message));
