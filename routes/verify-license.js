const { verifyLicense } = require("../lib/licenseStore");

async function handleVerify(req, res) {
  try {
    const { licenseKey } = req.body;

    if (!licenseKey || typeof licenseKey !== "string") {
      return res.status(400).json({ error: "licenseKey is required" });
    }

    const result = verifyLicense(licenseKey);
    res.json(result);
  } catch (err) {
    console.error("Verify error:", err);
    res.status(500).json({ error: "Verification failed" });
  }
}

module.exports = { handleVerify };
