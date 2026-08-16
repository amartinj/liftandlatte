# lift & latte

Static site (GitHub Pages, see `CNAME`), no build step, no framework. Plain HTML + `styles.css` + a small client-side include.

## Structure

- `nav.html` / `footer.html`: shared menu and footer partials, loaded on every page via `<div data-include="nav.html"></div>` + `include.js` (fetch + injection; also fills in the copyright year).
- `styles.css`: styles for the whole site, including the ones specific to `carta.html` under the `.carta-page` prefix, and `bingo.html`'s under `.bingo-lift-latte`.
- `carta.html`: the site's menu (products and prices). Uses the shared included nav/footer plus its own category submenu (`nav.categorias-carta`). No inline `<style>` and no own `<header>` — everything lives in `styles.css`.
- `menu.html`: legacy page (iframe to a Google Drive PDF), no longer linked from the main nav. Don't confuse with `carta.html`.
- Remaining pages (`index.html`, `intro.html`, `find_us.html`, `cb_lncp_sl.html`, `cb_wholesale.html`, `404.html`): share the same template with included nav/footer.

## Project skills

See `.claude/skills/`:
- `ll_update_menu`: updates the general products/prices in `carta.html` from an Excel file (sheet "Carta"), without touching the Special Coffees section.
- `ll_update_specialcoffees`: updates only the Special Coffees section of `carta.html` from an Excel file (sheet "Especiales"), including only the ones marked as available.

## Verification

To preview changes locally, the `data-include` fetches require serving the site over HTTP (they don't work opening the files directly via `file://`). Use the static server defined in `.claude/launch.json`.
