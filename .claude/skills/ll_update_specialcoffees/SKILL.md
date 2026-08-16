---
name: ll-update-specialcoffees
description: Updates ONLY the "Cafés especiales" (Special Coffees) section of Lift & Latte's HTML menu (carta.html), from the "Especiales" sheet (Table3) of an Excel file, including only the coffees marked as available (column "Disponible" with an "x"). Use it when the user runs /ll_update_specialcoffees, or asks to update, refresh, or change the availability of special/origin coffees from an attached Excel file. Do not use this skill for changes to the rest of the menu — that's ll_update_menu.
---

# ll_update_specialcoffees

Updates only the `<section class="categoria" id="especiales">` (Special Coffees) section of `carta.html`, from the Excel's **"Especiales"** sheet (table named `Table3`), filtering only the available coffees.

## Current structure of `carta.html` (important)

`carta.html` has no inline `<style>`, no own `<header>`, and no own footer — it uses `<div data-include="nav.html">` and `<div data-include="footer.html">` for the site's general menu and footer, and a `<nav class="categorias-carta">` for the menu's categories. All styles (including `.especiales-tabla` and `.item-extra`) live in `styles.css` under selectors prefixed with `.carta-page`. **Don't touch any of that** — this skill should only modify content inside `<section class="categoria" id="especiales">...</section>`.

## When it's invoked

The user types `/ll_update_specialcoffees` and attaches (or references) an Excel file with a special-coffees sheet, usually `Carta.xlsx`, sheet **"Especiales"**.

## Expected Excel format (sheet "Especiales", Table3)

Columns, in this order:

1. **Disponible** — contains `x` if the coffee is currently available; empty if not.
2. **Item name** — coffee name and origin.
3. **Variedad** (variety)
4. **Proceso** (process)
5. **Descripción** — tasting notes / profile.
6. **Filtro** — price supplement if ordered as filter (can be `0`, a number, or a string like `+ 1€`).
7. **Espresso** — price supplement if ordered as espresso.
8. **Retail** — price of the take-home bag.
9. **Category** (usually always "Cafés especiales", ignore if it adds no new information).
10. **Recomendación** (optional, recommended brew method — include it in the description if present and adds value).

Exact column names may vary slightly between versions of the file — inspect the sheet before assuming anything, and confirm which column marks availability if unsure.

## Workflow

1. **Locate the Excel file.** The user provides it as input in one of two ways:
   - A **local path** (absolute or relative) stated in the message.
   - A **file attached/referenced** directly in the conversation — in that case, use the path exposed by the system as-is (e.g. in the prompt or a context block), don't rewrite it.
   If there's neither a path nor an attached file, ask for the Excel file before continuing.

2. **Read the "Especiales" sheet** with openpyxl via Bash:
   ```bash
   python3 -c "
   import openpyxl
   wb = openpyxl.load_workbook('<path_to_excel>', data_only=True)
   ws = wb['Especiales']
   for row in ws.iter_rows(values_only=True):
       print(row)
   "
   ```
   If `openpyxl` isn't installed, install it first (`pip install openpyxl` or `pip3 install openpyxl`, depending on the environment).

3. **Filter only rows with "x" (or equivalent, case/whitespace-insensitive) in the Disponible column.** Discard the rest — they must not appear in the menu even if they have all other data filled in.

4. **Keep Table3's row order** (the Excel's row order), don't reorder alphabetically or by price.

5. **Locate `carta.html`** in the project root and, within it, the exact section:
   ```html
   <section class="categoria" id="especiales">
     ...
   </section>
   ```
   This is the only section you should modify. Don't touch any other `<section>`, the `<nav class="categorias-carta">` (unless the `#especiales` link doesn't exist, in which case add it), `styles.css`, or the nav/footer `data-include`s.

6. **Rebuild the `.especiales-tabla` table's `<tbody>`** with one `<tr>` per available coffee, keeping the structure already in use:
   ```html
   <tr>
     <td>
       <div class="item-info">
         <span class="item-nombre">Name — Origin</span>
         <span class="item-desc">Variety, process. Tasting notes. Recommendation if applicable.</span>
       </div>
     </td>
     <td class="precio-col">{Filtro}</td>
     <td class="precio-col">{Espresso}</td>
     <td class="precio-col">{Retail}</td>
   </tr>
   ```
   - Price columns go **in this order: Filtro, Espresso, Retail**, matching Table3 and the existing `<thead>` header (`Café | Filtro | Espresso | Retail`).
   - Price format: `X,XX €`, with a decimal comma.
   - If the Filtro or Espresso value is `0` (no supplement), still show it as `+0,00 €` (with a leading `+`), to keep visual consistency with coffees that do have a supplement.
   - If the value is already a positive supplement, show it as `+X,XX €`.
   - Retail never has a leading `+` — it's the final price of the bag, not a supplement.
   - If Filtro or Espresso come in empty (not `0`, but no value) in the Excel, treat them the same as `0` → `+0,00 €`, unless the user says otherwise.

7. **Don't duplicate the `<thead>`** — it already exists with the Café/Filtro/Espresso/Retail columns left-aligned; don't rewrite it unless it's missing.

8. **Apply the change with the edit tool**, replacing only the content between `<tbody>` and `</tbody>` of `.especiales-tabla` (or the whole `id="especiales"` section if the table doesn't exist yet and needs to be created from scratch, using the `.especiales-tabla` / `.item-extra` classes already present in `styles.css`).

9. **Verify before delivering:**
   - That only coffees with "x" in Disponible appear.
   - That the order matches Table3's.
   - That the three price columns are in Filtro / Espresso / Retail order.
   - That no other section of `carta.html`, `styles.css`, or the nav/footer includes changed.

10. **Summarize for the user**: which coffees came in, which ones went out (became unavailable) compared to the previous version, and confirm the rest of the menu wasn't touched.

## Common mistakes to avoid

- Don't include coffees without "x" in Disponible, even if they have a full description and prices.
- Don't change the order of price columns (always Filtro, Espresso, Retail).
- Don't touch the regular Café section, Otras bebidas, or any other category — that's `ll_update_menu`'s job.
- Don't forget the `+` sign on zero-value supplements.
- Don't add inline `<style>` or touch `styles.css` unless the `.especiales-tabla`/`.item-extra` classes are entirely missing.
