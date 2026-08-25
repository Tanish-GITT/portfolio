# Portfolio — Tanish Saini

A single-page portfolio site. Plain HTML, CSS, and JavaScript: no build step,
no dependencies, no framework. Open `index.html` in a browser and it works.

Live at **https://tanish-gitt.github.io/portfolio/**

```
portfolio/
├── index.html          all content lives here
├── styles.css          all styling; palette is at the top in :root
├── main.js             theme toggle, nav highlighting, scroll reveal
├── .gitignore          blocks *.pdf from ever being committed
├── assets/
│   └── og-image.png    1200×630 link-preview card
├── tools/
│   └── make_og_image.py  regenerates the card above
└── README.md
```

## Privacy — deliberate choices

This site publishes **email, GitHub, and LinkedIn only**. Two things were
removed on purpose:

- **No phone number.** A public page is crawled by scrapers and spam bots,
  not just recruiters.
- **No résumé PDF.** The CV contains a phone number and address. It is not in
  this folder and not in git history. The Contact section says the résumé is
  available on request, so recruiters email first.

`.gitignore` blocks `*.pdf` as a standing guard. If you ever want to publish
the CV, remove your phone number and address from the PDF *before* committing
it — anything pushed to a public repo stays recoverable from history and forks
even after you delete the file.

## Viewing it locally

Double-clicking `index.html` works. For a closer match to production, serve it:

```bash
python -m http.server 8000
```

Then open <http://localhost:8000>.

## What's still a placeholder

Search `index.html` for `TODO` — one thing left:

1. **Project repo links.** All six project links point at your GitHub profile
   (`github.com/Tanish-GITT`) rather than the specific repos, because I didn't
   have the repo URLs. Three are in the project headings, three in the
   "Source" links.

Optional: your CV lists no dates for the AI Developer experience, so there's a
commented-out `entry__dates` line in that section. Uncomment and fill it in if
you want dates shown.

## The link-preview image

`assets/og-image.png` is the 1200×630 card that appears when the URL is shared
on LinkedIn, WhatsApp, Slack, or X. It's generated, not hand-drawn — the source
is [tools/make_og_image.py](tools/make_og_image.py), which uses the same
palette and fonts as the site.

If you change your name, role, or tagline on the page, regenerate the card so
the two don't drift apart:

```bash
python tools/make_og_image.py
```

That needs Pillow (`python -m pip install Pillow`), which is already installed
on this machine. The script is a build tool, not part of the site — it isn't
served to visitors.

Because LinkedIn and WhatsApp cache preview images aggressively, a change won't
show up in an existing share. Force a re-scrape with the
[LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/).

## Editing content

Everything is in `index.html`, in the order it appears on the page, with each
section marked by a comment banner. To add a job or a project, copy an
existing `<article class="entry">` or `<article class="project">` block and
edit it — the styling is automatic.

Keep experience and education in reverse-chronological order (newest first).

## Publishing an update

The site is a GitHub Pages repo, so pushing to `main` deploys it. Changes go
live within a minute or two:

```bash
git add . && git commit -m "Update projects" && git push
```

## Changing the look

The whole palette is in `:root` at the top of `styles.css`. Change `--accent`
and the links, buttons, and highlights follow. The dark palette is defined
twice on purpose — once under `@media (prefers-color-scheme: dark)` for
visitors who never touch the toggle, once under `:root[data-theme="dark"]` for
visitors who do. Edit both, or neither.

Fonts are system fonts, so there are no webfont requests and no layout shift.
`--font-serif` drives headings, `--font-sans` the body text.

## Printing

The stylesheet has a print block, so `Ctrl+P` produces a clean one-page
résumé: the nav, theme toggle, and buttons drop out, colors flatten to black
on white, link URLs print in parentheses next to their text, and entries won't
split across a page break. This is a convenient way to generate a CV without
publishing one.

## Custom domain, later

Buying something like `tanishsaini.com` needs no rework: add the domain in
Settings → Pages, add a `CNAME` file, and point two DNS records at GitHub.
About ten minutes.

## Accessibility notes

These are built in — worth not breaking them:

- A skip link, semantic landmarks, and one `<h1>` per page.
- Every section is labelled by its heading via `aria-labelledby`.
- Visible focus rings on all interactive elements.
- Scroll reveal and smooth scrolling both switch off under
  `prefers-reduced-motion`.
- With JavaScript disabled, all content is visible and every link works. The
  reveal animation is opt-in from JS specifically so nothing can get stuck
  invisible.
