/**
 * Vercel Serverless Function — /api/config
 * Serves runtime config to the frontend without exposing secrets in HTML.
 *
 * Add these in Vercel → Project → Settings → Environment Variables:
 *
 * ERP_SPACE_URL = https://franklnwrld-erp.hf.space
 * ERP_HF_TOKEN = hf_xxxxxxxxxxxx (only when HF Space is Private)
 *
 * ⚠️ NEVER add to Vercel env:
 * - ERP_API_KEY / ERP_API_SECRET → HF Space secrets only
 * - GEMINI_API_KEY → HF Space secrets only
 * - SUPABASE_KEY → HF Space secrets only
 */
export default function handler(req, res) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const origin = req.headers.origin || '';

  // ✅ Allowed Origins - Updated with your new domain
  const allowedOrigins = [
    'https://radiant-medical.dev.havenir.com',           // Development / Preview
    'https://radiant-medical.frappe.cloud',             // ← NEW: Added this one
    'https://automation.akatechsolution.com',
    'https://aero-woad.vercel.app',
    process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : '',
    'http://localhost:3000',
    'http://localhost:5500',
  ].filter(Boolean);

  // Set CORS headers if origin is allowed
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'false');
  } 
  // Optional: Allow all origins in development only
  else if (process.env.NODE_ENV === 'development') {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  // Handle preflight OPTIONS requests (very important for CORS)
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // Cache 60s — avoids hitting this on every single page load
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');

  return res.status(200).json({
    url: process.env.ERP_SPACE_URL || '', 
    token: process.env.ERP_HF_TOKEN || '', 
  });
}
