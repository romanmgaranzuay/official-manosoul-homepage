// src/middleware.ts
import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, request } = context;

  // 1. Only intercept POST requests hitting the checkout endpoint
  if (url.pathname.startsWith('/api/create-checkout') && request.method === 'POST') {
    
    // Extract the origin of the request
    const origin = request.headers.get('origin') || request.headers.get('referer');
    
    // Define exactly who is allowed to talk to this API
    const allowedOrigins = [
      'https://www.manosoul.com',
      'https://manosoul.com',
      'http://localhost:4321' // Crucial for your local dev testing
    ];

    // 2. Check if the incoming request matches an allowed origin
    const isAllowed = origin && allowedOrigins.some(allowed => origin.startsWith(allowed));

    if (!isAllowed) {
      console.warn(`Blocked unauthorized API request from origin: ${origin}`);
      
      // 3. Drop the request immediately with a 403 Forbidden status
      return new Response(JSON.stringify({ 
        error: 'Forbidden: Unauthorized Origin' 
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // If the origin is allowed, or if it's a completely different page, proceed normally
  return next();
});