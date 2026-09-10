const crypto = require("crypto");
const { createLicense } = require("../lib/licenseStore");
const { sendLicenseEmail } = require("../lib/email");

function verifyNowPaymentsSignature(body, signature, secret) {
  if (!signature || !secret) return false;
  const hmac = crypto.createHmac("sha512", secret);
  hmac.update(JSON.stringify(body));
  const hash = hmac.digest("hex");
  return hash === signature;
}

async function handleWebhook(req, res) {
  try {
    const signature = req.headers["x-nowpayments-sig"];
    const body = req.body;

    if (!verifyNowPaymentsSignature(body, process.env.NOWPAYMENTS_IPN_SECRET)) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    if (body.payment_status !== "finished") {
      return res.status(200).json({ status: "ignored", payment_status: body.payment_status });
    }

    const email = body.order_description
      ? JSON.parse(body.order_description).email
      : null;

    const license = createLicense({
      email,
      paymentId: body.payment_id?.toString() || null,
    });

    if (email) {
      await sendLicenseEmail(email, license.key);
    }

    res.status(200).json({ status: "ok", licenseKey: license.key });
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).json({ error: "Webhook processing failed" });
  }
}

module.exports = { handleWebhook };
