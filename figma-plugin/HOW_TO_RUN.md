# How to Run the Figma Plugin

This plugin creates a new Figma page called **"AI POC - CKO Due Today Test"** with all 4 variation frames (Control, A, B, C).

## Steps

1. **Open Figma desktop app**

2. **Open any file** (existing file or create a blank one — the plugin adds a new page, it won't modify existing content)

3. **Import the plugin:**
   - Menu bar → **Plugins** → **Development** → **Import plugin from manifest...**
   - Navigate to this folder and select `manifest.json`

4. **Run the plugin:**
   - Menu bar → **Plugins** → **Development** → **AI POC - CKO Due Today Test** → **Run**

5. **Done** — a new page named "AI POC - CKO Due Today Test" will appear in the left panel with all 4 frames. The plugin closes automatically with a ✅ confirmation.

## What Gets Created

A page with 4 labeled sections, stacked vertically:

| Section | Description |
|---|---|
| **Control** | Current production experience |
| **Variation A** | Subtle "Due Today" label swap |
| **Variation B** | Bold purple hero amount with pill badge |
| **Variation C** | Split "Due Today / Order Total" two-column panel |

Each frame shows the **full /payment screen** in the correct render order:
1. Payment plan card (the variation component)
2. Order total accordion
3. Card on file (Visa ···· 4242)
4. Truth in Lending Disclosure
5. Legal copy
6. "Agree and continue" button

## Re-running

If you want to regenerate the frames (e.g. after edits to `code.js`), just run the plugin again — it clears the page and rebuilds from scratch.
