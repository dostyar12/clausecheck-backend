async function sendLicenseEmail(email, licenseKey) {
  const apiKey = process.env.EMAIL_API_KEY;
  if (!apiKey) {
    console.warn("EMAIL_API_KEY not set, skipping email");
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: "ClauseCheck <onboarding@resend.dev>",
      to: email,
      subject: "Your ClauseCheck License Key",
      html: `
        <h2>Welcome to ClauseCheck!</h2>
        <p>Your license key is:</p>
        <p style="font-size: 24px; font-weight: bold; background: #f4f4f4; padding: 12px; border-radius: 8px; text-align: center; letter-spacing: 2px;">${licenseKey}</p>
        <p>Enter this key in the ClauseCheck extension popup to activate.</p>
        <p style="color: #666; font-size: 12px;">Keep this email for your records.</p>
      `,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Email send failed: ${response.status} ${err}`);
  }
}

module.exports = { sendLicenseEmail };
