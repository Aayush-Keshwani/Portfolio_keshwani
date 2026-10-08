# Aayush Keshwani: Interactive Resume

A side-scrolling, game-style resume. Scroll down, press the arrow keys, or swipe.
A robot walks through a meadow, swims across a lake, then rides a hot-air balloon.

## Files

    index.html     page structure and all resume content (the cards)
    css/style.css  colors, layout, scenery, robot and balloon animations
    js/main.js     contact details, SVG props, scroll engine and travel modes

## Run it locally

Unzip the folder and double-click `index.html`. No build step or install needed.
Keep the `css` and `js` folders next to `index.html`.

Optional local server:

    cd aayush-interactive-resume
    python3 -m http.server 8000
    # then open http://localhost:8000

## Fonts

Silkscreen (headings) and Figtree (body) load from Google Fonts, so you need an
internet connection to see them. Offline, the page falls back to Courier New and
your system sans-serif font and still works.

## Edit your content

- Resume cards, in `index.html`: search for `<!-- Level` to find each section.
- Skill bars, in `index.html`: each `<div class="skill" data-n="3">` takes 1 (Beginner)
  to 5 (Expert). Add `data-label="Beginner–Intermediate"` for a custom label.
- Contact rows, in `js/main.js`: edit the `CONTACT` list at the top.
- Project links: the `bkt_ephemeral` card in `index.html` is a placeholder. Edit its text and link.
- Scenery and props, in `js/main.js`: `buildProps()` places trees, signs, coral and
  balloons. Positions are in `vw` units from the start of the world.
- Colors, in `css/style.css`: the `:root` block at the top holds the palette.
- Where stages switch, in `index.html` and `js/main.js`: the `#wback` block holds the
  grass, pond and sand widths, and `buildProps()` places the parked balloon.
