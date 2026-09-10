const { explainText } = require("../lib/ai");
const { verifyLicense } = require("../lib/licenseStore");

const rateLimitMap = new Map();
const DAILY_LIMIT = 200;

function checkRateLimit(key) {
  const now = new Date();
  const dateKey = `${key}:${now.toISOString().slice(0, 10)}`;
  const count = rateLimitMap.get(dateKey) || 0;
  if (count >= DAILY_LIMIT) return false;
  rateLimitMap.set(dateKey, count + 1);
  return true;
}

async function handleExplain(req, res) {
  try {
    const { text, licenseKey } = req.body;

    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "text is required" });
    }
    if (!licenseKey || typeof licenseKey !== "string") {
      return res.status(400).json({ error: "licenseKey is required" });
    }

    const { valid } = verifyLicense(licenseKey);
    if (!valid) {
      return res.status(403).json({ error: "Invalid or inactive license key" });
    }

    if (!checkRateLimit(licenseKey)) {
      return res.status(429).json({ error: "Daily rate limit reached (200/day)" });
    }

    const result = await explainText(text);
    res.json(result);
  } catch (err) {
    console.error("Explain error:", err);
    res.status(500).json({ error: "Failed to process request" });
  }
}

module.exports = { handleExplain };
