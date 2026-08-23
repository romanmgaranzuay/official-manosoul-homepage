![Astro](https://img.shields.io/badge/Astro-FF5D01?style=for-the-badge&logo=astro&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Cloudflare](https://img.shields.io/badge/Cloudflare-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white)
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

## 🖥️ Example Stripe Checkout Session
<img width="1080" height="608" alt="stripe-checkout" src="https://github.com/user-attachments/assets/0ca70846-33be-4890-9e28-fb4357084c6c" />
*Note: This example checkout session is in Stripe Test Mode to demonstrate secure webhook handling and temporary R2 asset generation without needing to process live transactions.*

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

## 🔐 Environment Variables & Local Development Security

To run this project locally, create a `.env` file in the root directory. 

> ⚠️ **Security Policy:** Never commit `.env` to version control. Local environment variables are explicitly ignored in `.gitignore`. Production secrets are managed via Vercel's Encrypted Environment Store.

```env
# Stripe Configuration
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Cloudflare R2 Credentials (PoLP Scope: Object Read/Write)
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=your_bucket_name

# Transactional Mail
RESEND_API_KEY=re_...
```

## Local Webhook Tunneling

To test Stripe payment fulfillment locally without exposing development ports:
```bash
stripe listen --forward-to localhost:4321/api/stripe-webhook
```

## 🛑 Threat Model & Failure Mitigation

| Attack / Failure Vector | Defense Mechanism | Risk Mitigation |
| :--- | :--- | :--- |
| **API Replay Attacks** | Stripe Webhook Cryptographic Verification (`HMAC-SHA256`) | Rejects forged POST events trying to trigger free asset generation. |
| **Direct Asset Exfiltration** | Private R2 Bucket + 15-Min Presigned URLs | Prevents public enumeration or direct hotlinking of master audio files. |
| **Distributed Bot Spam** | Astro Edge Middleware Origin Filtering | Drops unauthorized cross-origin API calls before execution. |
| **Mail Delivery Interception** | Strict DNS Authentication (SPF, DKIM, DMARC) | Prevents domain impersonation and spoofed download emails. |

## Repository File Structure

- `src/pages/index.astro` assembles the homepage sections.
- `src/pages/listen/[slug].astro` builds one smart-link page per release.
- `src/pages/api/create-checkout.ts` creates Stripe checkout sessions for digital merch.
- `src/pages/api/stripe-webhook.ts` turns completed payments into download links and emails.
- `src/content/releases/` stores release metadata used on the music and listen pages.
- `src/content/shop/` stores one JSON file per merch item.
- `public/images/` and `public/icons/` hold static assets that are served directly by path.

## Content Notes

- Release cover art now lives in `public/images/cover_art/` and is referenced with `/images/...` paths.
- Merch items are stored as individual JSON files so each product can be edited independently.
- The layout and sections use a small set of utility comments to explain why the page is split into full-width and centered regions.

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

## Documentation

Astro docs: https://docs.astro.build
