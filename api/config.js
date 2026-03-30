/**
 * Vercel Serverless Function — /api/config
 * =========================================
 * Serves runtime config to the frontend without exposing secrets in HTML.
 *
 * Add these in Vercel → Project → Settings → Environment Variables:
 *
 *   ERP_SPACE_URL   = https://franklnwrld-erp.hf.space
 *   ERP_HF_TOKEN    = hf_xxxxxxxxxxxx  (only when HF Space is Private)
 *
 * ⚠️  NEVER add to Vercel env:
 *   - ERP_API_KEY / ERP_API_SECRET  → HF Space secrets only
 *   - GEMINI_API_KEY                → HF Space secrets only
 *   - SUPABASE_KEY                  → HF Space secrets only
 */
export default function handler(req, res) {

  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS — allowed origins
  const origin = req.headers.origin || '';
  const allowed = [
    'https://automation.akatechsolution.com',  // production domain
    'https://aero-woad.vercel.app',            // Vercel preview
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : '',
    'http://localhost:3000',
    'http://localhost:5500',
  ].filter(Boolean);

  if (allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  // Cache 60s — avoids hitting this on every single page load
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');

  return res.status(200).json({
    url:   process.env.ERP_SPACE_URL || '',  // HF Space base URL
    token: process.env.ERP_HF_TOKEN  || '',  // empty when Space is public
  });
}
