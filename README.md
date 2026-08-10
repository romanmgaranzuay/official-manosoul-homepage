# Manosoul Homepage

Official Astro website for Manosoul. The site combines a landing page, music and video sections, merch checkout, and a smart-link page for individual releases.

## Project Layout

```text
/
├── public/
│   ├── icons/
│   └── images/
├── src/
│   ├── components/
│   ├── content/
│   │   ├── releases/
│   │   └── shop/
│   ├── layouts/
│   ├── pages/
│   │   ├── api/
│   │   └── listen/
│   └── styles/
├── astro.config.mjs
├── tailwind.config.mjs
└── package.json
```

## How The Site Is Structured

- `src/pages/index.astro` assembles the homepage sections.
- `src/pages/listen/[slug].astro` builds one smart-link page per release.
- `src/pages/api/create-checkout.ts` creates Stripe checkout sessions for digital merch.
- `src/pages/api/stripe-webhook.ts` turns completed payments into download links and emails.
- `src/content/releases/` stores release metadata used on the music and listen pages.
- `src/content/shop/` stores one JSON file per merch item.
- `public/images/` and `public/icons/` hold static assets that are served directly by path.

## Local Development

Run these from the project root:

| Command | Action |
| :-- | :-- |
| `npm install` | Install dependencies |
| `npm run dev` | Start the Astro dev server |
| `astro dev --background` | Start the dev server in the background when working in VS Code |
| `npm run build` | Build the production site |
| `npm run preview` | Preview the production build locally |
| `npm run astro -- --help` | Show Astro CLI help |

## Content Notes

- Release cover art now lives in `public/images/cover_art/` and is referenced with `/images/...` paths.
- Merch items are stored as individual JSON files so each product can be edited independently.
- The layout and sections use a small set of utility comments to explain why the page is split into full-width and centered regions.

## Documentation

Astro docs: https://docs.astro.build
