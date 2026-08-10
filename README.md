# Official Artist Homepage & Serverless Store Architecture

A high-performance, serverless e-commerce and media delivery platform built with Astro, TypeScript, and multi-cloud security practices.

## 🏗️ Architecture Overview

```text
[ Client / Web Browser ]
│
▼
[ Vercel Edge Network ] (CORS & Origin Security Middleware)
│
├──► [ Astro Serverless API ] ──► [ Stripe API ] (Payment Processing)
│                                       │
│                                       ▼
│                            [ Webhook Event (HMAC) ]
│                                       │
├──► [ Presigned URL Generator ] ◄──────┘
│            │
│            ▼
├──► [ Cloudflare R2 ] (Private Object Storage)
│
└──► [ Resend API ] (Transactional Delivery w/ SPF/DKIM/DMARC)
```
## 🛡️ Security Implementations

* **Cryptographic Event Verification:** Webhooks sent from Stripe are cryptographically verified using `stripe-signature` headers before processing fulfillment logic.
* **Temporal Access Control:** Assets inside Cloudflare R2 are entirely private. Access is granted strictly through 15-minute AWS S3 presigned URLs generated on-demand upon completed payment.
* **Custom Middleware Defense:** API routes (`/api/create-checkout`) are guarded by origin-checking middleware to mitigate Cross-Site Request Forgery (CSRF) and block unauthorized bot traffic.
* **Email Security & Alignment:** Transactional email infrastructure is hardened using DKIM cryptographic signing, SPF authorization, and DMARC policies.
* **Secrets Management:** Zero hardcoded API keys; complete isolation of development vs. production environment variables within Vercel's encrypted secrets store.

## 🧰 Tech Stack

* **Frontend/Framework:** Astro, Tailwind CSS, TypeScript
* **Deployment/Compute:** Vercel (Serverless Edge Engine)
* **Object Storage:** Cloudflare R2 (S3-Compatible API)
* **Integrations:** Stripe API, Resend API
* **Security & DNS:** Cloudflare, AWS SDK (`@aws-sdk/client-s3`)

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
