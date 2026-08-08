// src/pages/api/stripe-webhook.ts
import { Resend } from 'resend';
import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const prerender = false;

// Initialize Stripe SDK
const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-07-29.dahlia',
});

// Initialize Cloudflare R2 Client via S3 Compatible API
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${import.meta.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: import.meta.env.R2_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.R2_SECRET_ACCESS_KEY,
  },
});

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const POST: APIRoute = async ({ request }) => {
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return new Response(JSON.stringify({ error: 'Missing Stripe signature' }), { status: 400 });
  }

  let event: Stripe.Event;

  try {
    // Read raw body string for cryptographic signature verification
    const rawBody = await request.text();
    
    // Verify that the request actually came from Stripe (prevents spoofing attacks)
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      import.meta.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error(`Webhook Signature Verification Failed: ${err.message}`);
    return new Response(JSON.stringify({ error: `Webhook Error: ${err.message}` }), { status: 400 });
  }

  // Handle successful payments
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    // Extract metadata set during Phase 3 checkout creation
    const r2ObjectKey = session.metadata?.r2_object_key;
    const customerEmail = session.customer_details?.email;

    if (r2ObjectKey) {
      try {
        // Derive clean filename for the download header (e.g. "masters/endless.wav" -> "endless.wav")
        const fileName = r2ObjectKey.split('/').pop() || 'download.wav';

        // Configure S3 GetObject command with ResponseContentDisposition
        const command = new GetObjectCommand({
          Bucket: import.meta.env.R2_BUCKET_NAME,
          Key: r2ObjectKey,
          ResponseContentDisposition: `attachment; filename="${fileName}"`,
        });

        // Generate a temporary 15-minute presigned download URL (900 seconds)
        const downloadUrl = await getSignedUrl(r2Client, command, { expiresIn: 900 });

        console.log(`Generated Presigned Download URL for ${customerEmail}: ${downloadUrl}`);

        // --- NEW: PHASE 5 EMAIL DISPATCH ---
        if (customerEmail) {
          const { data, error } = await resend.emails.send({
            from: 'Manosoul Store <onboarding@resend.dev>', 
            to: customerEmail,
            subject: 'Your Download: Hold the Rose (Lossless WAV)',
            html: `
              <div style="font-family: sans-serif; max-w-md; margin: 0 auto; padding: 20px;">
                <h1 style="color: #0f1d15;">Thank you for your purchase!</h1>
                <p>Your high-resolution master file is ready.</p>
                <p><strong>Note:</strong> For security, this link will expire in exactly 15 minutes.</p>
                <a href="${downloadUrl}" style="display: inline-block; padding: 12px 24px; background-color: #0f1d15; color: #faf8f5; text-decoration: none; font-weight: bold; margin-top: 20px;">
                  Download Track Now
                </a>
              </div>
            `,
          });

          if (error) {
            console.error('Failed to send email:', error);
          } else {
            console.log(`Email sent successfully to ${customerEmail}! Email ID: ${data?.id}`);
          }
        }

      } catch (error: any) {
        console.error('Failed to generate presigned R2 URL:', error);
        return new Response(JSON.stringify({ error: 'Failed to generate download link' }), { status: 500 });
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
};