// src/pages/api/stripe-webhook.ts
import { Resend } from 'resend';
import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const prerender = false;

// Stripe verifies the checkout event before we generate any download access.
const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-07-29.dahlia',
});

// Cloudflare R2 is accessed through the S3-compatible API for signed downloads.
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
    // Stripe needs the raw request body for signature verification.
    const rawBody = await request.text();
    
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      import.meta.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error(`Webhook Signature Verification Failed: ${err.message}`);
    return new Response(JSON.stringify({ error: `Webhook Error: ${err.message}` }), { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    const r2ObjectKey = session.metadata?.r2_object_key;
    const customerEmail = session.customer_details?.email;

    if (r2ObjectKey) {
      try {
        const fileName = r2ObjectKey.split('/').pop() || 'Digital_Download';

        // Generate a short-lived signed URL so the buyer can download the purchased file.
        const command = new GetObjectCommand({
          Bucket: import.meta.env.R2_BUCKET_NAME,
          Key: r2ObjectKey,
          ResponseContentDisposition: `attachment; filename="${fileName}"`,
        });

        const downloadUrl = await getSignedUrl(r2Client, command, { expiresIn: 900 });

        console.log(`Generated Presigned Download URL for ${customerEmail}: ${downloadUrl}`);

        if (customerEmail) {
          // Send the download link by email once the payment has cleared.
          const { data, error } = await resend.emails.send({
            from: 'Manosoul Shop <shop@manosoul.com>', 
            to: customerEmail,
            subject: 'Your Download is Ready! | Manosoul',
            html: `
              <!DOCTYPE html>
              <html lang="en">
                <head>
                  <style>
                    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&family=Space+Grotesk:wght@500;700&display=swap');
                  </style>
                </head>
                <body style="margin: 0; padding: 0; background-color: #ffffff;">
                  <div style="font-family: 'Plus Jakarta Sans', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff; color: #000000;">
                    
                    <h1 style="font-family: 'Space Grotesk', monospace; font-size: 24px; font-weight: 700; text-transform: uppercase; letter-spacing: -0.05em; margin-bottom: 8px;">Order Confirmed</h1>
                    
                    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                      Thank you for your support! Your digital files are securely packaged and ready for download.
                    </p>
                    
                    <div style="border: 1px solid #000000; padding: 24px; margin-bottom: 32px;">
                      <p style="font-size: 14px; font-weight: 700; margin-top: 0; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em;">
                        Item: ${fileName}
                      </p>
                      <p style="font-size: 14px; margin-bottom: 24px; color: #333333;">
                        <strong>Security Note:</strong> This secure download link will expire in exactly 15 minutes.
                      </p>
                      
                      <a href="${downloadUrl}" style="display: inline-block; width: 100%; box-sizing: border-box; text-align: center; padding: 16px 24px; background-color: #000000; color: #ffffff; text-decoration: none; font-family: 'Space Grotesk', monospace; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; transition: background-color 0.3s ease;">
                        Download Files
                      </a>
                    </div>

                    <div style="border-top: 1px solid #eeeeee; padding-top: 24px;">
                      <p style="font-size: 12px; color: #666666; text-align: center;">
                        If you have any issues with your download, please reply directly to this email.<br><br>
                        &copy; ${new Date().getFullYear()} Manosoul. All rights reserved.
                      </p>
                    </div>

                  </div>
                </body>
              </html>
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