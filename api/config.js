/**
 * Vercel Serverless Function — /api/config
 * Serves runtime config to the frontend without exposing secrets.
 *
 * Environment Variables (Vercel Dashboard):
 * ERP_SPACE_URL = https://franklnwrld-erp.hf.space
 * ERP_HF_TOKEN  = hf_xxxxxxxxxxxx (only if HF Space is private)
 */
export default function handler(req, res) {
  const origin = req.headers.origin || '';

  const allowedOrigins = [
    'https://radiant-medical.dev.havenir.com',
    'https://radiant-medical.frappe.cloud',
    'https://automation.akatechsolution.com',
    'https://aero-woad.vercel.app',
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
    'http://localhost:3000',
    'http://localhost:5500',
  ].filter(Boolean);

  // Set CORS headers for allowed origins
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'false');
  } 
  // Fallback for local development
  else if (process.env.NODE_ENV === 'development') {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  // Handle preflight OPTIONS request (must come before method check)
  if (req.method === 'OPTIONS') {
    res.setHeader('Cache-Control', 'no-cache');
    return res.status(204).end();
  }

  // Only allow GET for config
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Cache for 60 seconds
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');

  return res.status(200).json({
    url: process.env.ERP_SPACE_URL || '',
    token: process.env.ERP_HF_TOKEN || '',
  });
}
