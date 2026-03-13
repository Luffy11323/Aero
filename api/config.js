// api/config.js  ← new file in your repo
export default function handler(req, res) {
  res.json({
    url:   process.env.ERP_URL,
    token: process.env.ERP_TOKEN,
  });
}
