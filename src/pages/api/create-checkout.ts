import type { APIRoute } from 'astro';
import Stripe from 'stripe';

// This route must run on the server so Stripe can create a checkout session.
export const prerender = false; 

// Pin the Stripe API version so the SDK behavior stays predictable.
const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-07-29.dahlia', 
});

export const POST: APIRoute = async ({ request, url }) => {
  try {
    const body = await request.json();
    const { priceId, r2ObjectKey } = body;

    if (!priceId || !r2ObjectKey) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    // Persist the R2 key in metadata so the webhook can build the download link after payment.
    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'payment',
      success_url: `${url.origin}/success`,
      cancel_url: `${url.origin}/#shop`,
      metadata: {
        item_type: 'digital',
        r2_object_key: r2ObjectKey, 
      },
    });

    return new Response(JSON.stringify({ url: session.url }), { status: 200 });

  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};