import type { APIRoute } from 'astro';
import Stripe from 'stripe';

// This opts this specific route out of static build, running it on the server
export const prerender = false; 

// Initializing with the exact API version installed to clear the TypeScript error
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

    // Generate the secure payment session
    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'payment',
      success_url: `${url.origin}/success`,
      cancel_url: `${url.origin}/#shop`,
      // CRITICAL: We pass the Cloudflare path in the metadata so Phase 4 can access it!
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