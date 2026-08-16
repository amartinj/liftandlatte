---
name: ll-update-menu
description: Updates Lift & Latte's HTML menu (carta.html) from a new product list in an Excel file (sheet "Carta"), WITHOUT touching the "Cafés especiales" (Special Coffees) section. Always edits the project's own carta.html directly. Invoke it whenever the user runs /ll_update_menu, or asks to update/regenerate the menu, change products, prices, categories, or descriptions of Lift & Latte's general menu from an attached Excel file. Do not use this skill for special-coffee changes — that's ll_update_specialcoffees.
---

# ll_update_menu

Updates `carta.html` with a new product list, keeping the `id="especiales"` (Special Coffees) section and everything that doesn't depend on the product list (structure, included general nav, included footer, category nav, styles in styles.css) completely untouched.

Always edit the project's own `carta.html` (repo root) directly — it's the single source of truth, there is no separate template file to fall back on.

## Current structure of `carta.html` (important)

`carta.html` has **no** inline `<style>` and no own `<header>`. Its structure is:

```html
<body class="carta-page with-scroll">
<div data-include="nav.html"></div>

<nav class="categorias-carta">
  <a href="#cafe">Café</a>
  ...
</nav>

<main>
  <section class="categoria" id="cafe"> ... </section>
  <section class="categoria" id="especiales"> ... </section>
  ...
</main>

<div data-include="footer.html"></div>
</body>
```

- The general menu (`data-include="nav.html"`) and footer (`data-include="footer.html"`) are partials shared with the rest of the site. **Never touch them** from this skill.
- The `<nav class="categorias-carta">` is the menu's own category submenu (`#id` links to each section). It can change if categories are added or removed (see below).
- All visual styles (`.item`, `.item-info`, `.item-nombre`, `.especiales-tabla`, colors, typography, etc.) live in **`styles.css`**, under selectors prefixed with `.carta-page` (e.g. `.carta-page .item`, `.carta-page nav.categorias-carta a`). There is no `<style>` inside `carta.html` — don't add one.

## When it's invoked

The user types `/ll_update_menu` and attaches (or references) an Excel file with the product list, usually `Carta.xlsx`, sheet **"Carta"**.

## Expected Excel format (sheet "Carta")

Typical columns: product name, price, category, and optionally a description column. The exact order and column names may vary slightly between versions of the file — inspect the sheet before assuming anything.

## Workflow

1. **Locate the Excel file.** The user provides it as input in one of two ways:
   - A **local path** (absolute or relative) stated in the message.
   - A **file attached/referenced** directly in the conversation — in that case, use the path exposed by the system as-is (e.g. in the prompt or a context block), don't rewrite it.
   If there's neither a path nor an attached file, ask for the Excel file before continuing.

2. **Read the "Carta" sheet** (not the special-coffees sheet). Use Python with openpyxl via Bash, for example:
   ```bash
   python3 -c "
   import openpyxl
   wb = openpyxl.load_workbook('<path_to_excel>', data_only=True)
   ws = wb['Carta']
   for row in ws.iter_rows(values_only=True):
       print(row)
   "
   ```
   If `openpyxl` isn't installed, install it first (`pip install openpyxl` or `pip3 install openpyxl`, depending on the environment).

3. **Open the project's `carta.html`** (repo root) — this is what you'll edit.

4. **Identify the `id="especiales"` section in `carta.html` and do NOT touch it.** This is this skill's most important rule: any `<section class="categoria" id="especiales">...</section>` must remain exactly the same, byte for byte, in the output file. Also don't touch the `<a href="#especiales">Cafés especiales</a>` link in `<nav class="categorias-carta">`.

5. **Recompute the remaining sections** (Café, Otras bebidas, Smoothies, Salados, Caprichos, Bowls, Fruta, or whichever apply according to the "categoría" column in the Excel) from the new list:
   - Group products by category, in the order categories appear in the Excel (or the order already used in the HTML if it doesn't change).
   - Each product is a `<div class="item">`. If it has a description, wrap name + description in `<div class="item-info">` with `<span class="item-nombre">` and `<span class="item-desc">`; if it has no description, use `<span class="item-nombre">` directly as a sibling of `<span class="item-precio">`.
   - Prices in `X,XX €` format (decimal comma, € symbol with a space before it).
   - If a category disappears from the Excel, remove its `<section>` and its entry in `<nav class="categorias-carta">`. If a new category appears, add its `<section>` (with a lowercase `id`, no accents or spaces) and its nav entry, inserting it in the same relative order it appears in the Excel — but keep "Cafés especiales" wherever it already was.
   - Respect the existing CSS classes (`.item`, `.item-info`, `.item-nombre`, `.item-desc`, `.item-precio`, etc.) — don't invent new ones. Since styles live in `styles.css` and not in `carta.html`, 99% of the time you won't need to touch CSS. If a genuinely new case requires it (e.g. a product without a numeric price, like `.item-extra`), add the rule to `styles.css` under the `.carta-page` prefix, never as a `<style>` inside `carta.html`.
   - **Every `<section class="categoria">` must always have its opening tag `<section class="categoria" id="...">` followed by its `<h2>`.** Check this explicitly: a known error in manual edits was losing a section's opening tag, leaving its `<h2>` dangling inside the previous section. Before delivering, confirm the number of opening `<section` tags matches the number of closing `</section>` tags and the number of entries in `<nav class="categorias-carta">`.

6. **Apply changes with the edit tool** section by section instead of rewriting the whole file, unless the user explicitly asks for a full rebuild. This minimizes the risk of accidentally breaking the special-coffees section.

7. **Verify before delivering:**
   - That the `id="especiales"` section is still present and unchanged.
   - That every `<div class="item">` is properly closed and prices have the correct format.
   - That the `<nav class="categorias-carta">` links point to `id`s that exist in the document.
   - That every `<section class="categoria" id="...">` has its opening and closing tags correctly paired (see point 5).
   - That no inline `<style>` was added and `<div data-include="nav.html">` / `<div data-include="footer.html">` weren't touched.

8. **Summarize for the user** what changed: products added, removed, moved between categories, or updated prices. Be concise — a short list is enough. Explicitly mention that the Special Coffees section wasn't touched.

## Common mistakes to avoid

- Don't rename or reorder existing section `id`s unless the Excel explicitly requires it.
- Don't duplicate products that already exist in another category.
- Don't touch the special-coffees table (`.especiales-tabla`, `.item-extra`) — that's `ll_update_specialcoffees`'s job.
- Don't change typography, color palette, the general menu, or the footer unless the user explicitly asks for it.
- Don't add an inline `<style>` to `carta.html` or a own `<header>` — that structure became obsolete after the site's styles and menus were unified.
