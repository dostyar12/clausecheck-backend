const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-nowpayments-sig",
};

const PRIVACY_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>ClauseCheck — Privacy Policy</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #111827; line-height: 1.6; background: #f9fafb; }
    .wrap { max-width: 680px; margin: 0 auto; padding: 40px 24px 80px; }
    .logo { font-size: 18px; font-weight: 700; display: inline-block; margin-bottom: 20px; color: #111827; text-decoration: none; }
    h1 { font-size: 28px; margin-bottom: 8px; }
    .meta { font-size: 13px; color: #6b7280; margin-bottom: 32px; }
    h2 { font-size: 18px; margin: 28px 0 8px; }
    p, li { font-size: 15px; color: #374151; }
    p { margin-bottom: 12px; }
    ul { padding-left: 20px; margin-bottom: 12px; }
    li { margin-bottom: 4px; }
    a { color: #2563eb; }
  </style>
</head>
<body>
  <div class="wrap">
    <a href="/" class="logo">ClauseCheck</a>
    <h1>Privacy Policy</h1>
    <p class="meta">Last updated: September 2026</p>
    <p>ClauseCheck is a browser extension that explains legal text (Terms of Service, contracts, leases) in plain English. We collect the minimum data necessary to deliver the service.</p>
    <h2>What data we collect</h2>
    <ul>
      <li><strong>Selected text:</strong> When you use the extension, the text you select is sent to our backend for analysis. It is processed and immediately discarded — we do not store, log, or share the text you submit.</li>
      <li><strong>License key:</strong> A single activation key stored locally in your browser. This is sent to our server to verify your purchase. No password, email, or personal profile is created or stored.</li>
      <li><strong>Email (at purchase only):</strong> Your email address is shared with NOWPayments solely to deliver your license key by email. We do not store your email after delivery.</li>
    </ul>
    <h2>What we do NOT collect</h2>
    <ul>
      <li>No browsing history, cookies, or tracking data</li>
      <li>No analytics, telemetry, or fingerprinting</li>
      <li>No accounts, passwords, or personally identifiable information</li>
      <li>No third-party cookies or trackers</li>
    </ul>
    <h2>Third-party services</h2>
    <ul>
      <li><strong>Google Gemini (AI):</strong> Selected text is sent to Google's API to generate an explanation. Google does not retain the data used to generate responses.</li>
      <li><strong>NOWPayments:</strong> Handles payment processing. Subject to their own privacy policy.</li>
    </ul>
    <h2>Data storage</h2>
    <p>All data (license key, activation status) is stored locally in your browser's extension storage. No data is stored on our servers after the analysis response is returned to you.</p>
    <h2>Changes to this policy</h2>
    <p>If we update this policy, we will note the date of the most recent change above. Continued use of the extension after changes constitutes acceptance of the updated policy.</p>
    <h2>Contact</h2>
    <p>Questions about this policy: <a href="mailto:support@clausecheck.app">support@clausecheck.app</a></p>
  </div>
</body>
</html>`;

const SYSTEM_PROMPT = `You are a legal text analyst. The user will provide a clause or excerpt from a contract, Terms of Service, lease, or legal document.

Your job is to explain it in plain English, flag risks, and assign a risk score.

Respond ONLY with valid JSON in this exact format:
{
  "summary": "Plain English explanation of what this clause means (1-3 sentences)",
  "redFlags": ["Risk 1", "Risk 2", "Risk 3"],
  "riskScore": "Low" | "Medium" | "High" | "Critical"
}

Rules:
- summary: Clear, jargon-free explanation. No legal terms without defining them.
- redFlags: Specific concerns the user should watch out for. Empty array if none.
- riskScore: Based on how much the clause favors one party, how binding it is, and how easy it is to miss.
- Never add commentary outside the JSON.
- Never include markdown fences (no backticks). Just raw JSON.`;

export default {
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    if (url.pathname === "/health" || url.pathname === "/") {
      return json({ status: "ok" });
    }
    if (url.pathname === "/api/explain" && request.method === "POST") {
      return handleExplain(request, env);
    }
    if (url.pathname === "/api/demo/explain" && request.method === "POST") {
      return handleDemoExplain(request, env);
    }
    if (url.pathname === "/api/verify-license" && request.method === "POST") {
      return handleVerify(request, env);
    }
    if (url.pathname === "/api/checkout" && request.method === "POST") {
      return handleCheckout(request, env);
    }
    if (url.pathname === "/api/webhook/nowpayments" && request.method === "POST") {
      return handleWebhook(request, env, ctx);
    }
    if (url.pathname === "/paid") {
      return new Response(
        "<h2>Payment received!</h2><p>Your license key will arrive by email shortly. Check your inbox (and spam folder).</p>",
        { headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }
    if (url.pathname === "/privacy") {
      return new Response(PRIVACY_HTML, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }
    return json({ error: "Not found" }, 404);
  },
};

async function handleExplain(request, env) {
  try {
    const body = await request.json();
    const text = body.text;
    const licenseKey = body.licenseKey ? String(body.licenseKey).trim().toUpperCase() : null;

    if (!text || typeof text !== "string") {
      return json({ error: "text is required" }, 400);
    }
    if (!licenseKey) {
      return json({ error: "licenseKey is required" }, 400);
    }

    const record = await env.LICENSES.get(`license:${licenseKey}`, "json");
    if (!record || !record.active) {
      return json({ error: "Invalid or inactive license key" }, 403);
    }

    const today = new Date().toISOString().slice(0, 10);
    const rlKey = `rl:${licenseKey}:${today}`;
    const count = (await env.LICENSES.get(rlKey, "json")) || 0;

    if (count >= 200) {
      return json({ error: "Daily rate limit reached (200/day)" }, 429);
    }

    const result = await explainText(text, env);
    await env.LICENSES.put(rlKey, JSON.stringify(count + 1));

    return json(result);
  } catch (err) {
    console.error("Explain error:", err);
    return json({ error: "Failed to process request" }, 500);
  }
}

async function handleDemoExplain(request, env) {
  try {
    const body = await request.json();
    const text = body.text;

    if (!text || typeof text !== "string") {
      return json({ error: "text is required" }, 400);
    }
    if (text.length > 1200) {
      return json({ error: "Demo limited to 1200 characters" }, 400);
    }

    const ip = request.headers.get("CF-Connecting-IP") || "anon";
    const today = new Date().toISOString().slice(0, 10);
    const rlKey = `rl:demo:${ip}:${today}`;
    const count = (await env.LICENSES.get(rlKey, "json")) || 0;

    if (count >= 5) {
      return json({ error: "Demo limit reached for today" }, 429);
    }

    const result = await explainText(text, env);
    await env.LICENSES.put(rlKey, JSON.stringify(count + 1));

    return json(result);
  } catch (err) {
    console.error("Demo explain error:", err);
    return json({ error: "Failed to process request" }, 500);
  }
}

async function handleVerify(request, env) {
  try {
    const body = await request.json();
    const licenseKey = body.licenseKey ? String(body.licenseKey).trim().toUpperCase() : null;

    if (!licenseKey) {
      return json({ error: "licenseKey is required" }, 400);
    }

    const record = await env.LICENSES.get(`license:${licenseKey}`, "json");
    return json({ valid: !!record && record.active === true });
  } catch (err) {
    console.error("Verify error:", err);
    return json({ error: "Verification failed" }, 500);
  }
}

async function handleCheckout(request, env) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";

    const res = await fetch("https://api.nowpayments.io/v1/invoice", {
      method: "POST",
      headers: {
        "x-api-key": env.NOWPAYMENTS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        price_amount: 12,
        price_currency: "usd",
        pay_currency: "usdttrc20",
        order_id: `cc-${Date.now()}`,
        order_description: JSON.stringify({ email }),
        ipn_callback_url: "https://clausecheck-backend.dostyar50.workers.dev/api/webhook/nowpayments",
        success_url: "https://clausecheck-1d1.pages.dev/thanks",
        cancel_url: "https://clausecheck-1d1.pages.dev/",
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return json({ error: data.message || "Checkout failed" }, res.status);
    }
    if (!data.invoice_url) {
      return json({ error: "No checkout URL returned" }, 502);
    }

    return json({ invoiceUrl: data.invoice_url });
  } catch (err) {
    console.error("Checkout error:", err);
    return json({ error: "Checkout failed" }, 500);
  }
}

async function handleWebhook(request, env, ctx) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-nowpayments-sig");
    const secret = env.NOWPAYMENTS_IPN_SECRET;

    if (!(await verifySignature(rawBody, signature, secret))) {
      return json({ error: "Invalid signature" }, 401);
    }

    const body = JSON.parse(rawBody);

    if (body.payment_status !== "finished") {
      return json({ status: "ignored", payment_status: body.payment_status });
    }

    const paidAmount = body.price_amount ? Number(body.price_amount) : 0;
    if (paidAmount < 11) {
      return json({ status: "ignored", reason: "amount below minimum" });
    }

    let email = null;
    if (body.order_description) {
      try {
        email = JSON.parse(body.order_description).email;
      } catch (e) {}
    }

    const key = generateKey();
    const record = {
      key,
      email,
      paymentId: body.payment_id ? String(body.payment_id) : null,
      createdAt: new Date().toISOString(),
      active: true,
    };

    await env.LICENSES.put(`license:${key}`, JSON.stringify(record));
    await env.LICENSES.put(`payment:${record.paymentId}`, key);

    if (email) {
      ctx.waitUntil(sendLicenseEmail(email, key, env));
    }

    return json({ status: "ok", licenseKey: key });
  } catch (err) {
    console.error("Webhook error:", err);
    return json({ error: "Webhook processing failed" }, 500);
  }
}

async function explainText(text, env) {
  let lastError = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${env.AI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ parts: [{ text: `Explain this legal text:\n\n"${text}"` }] }],
        }),
      }
    );

    if (response.status === 429 || response.status === 503) {
      lastError = new Error(`AI API temporary failure: ${response.status}`);
      await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
      continue;
    }

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`AI API error: ${response.status} ${err}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) throw new Error("No content in AI response");

    try {
      const cleaned = content.replace(/```json\n?|\n?```/g, "").trim();
      return JSON.parse(cleaned);
    } catch (e) {
      lastError = new Error("AI response was not valid JSON");
      if (attempt < 2) {
        await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
        continue;
      }
      throw lastError;
    }
  }
  throw lastError || new Error("AI request failed");
}

async function verifySignature(rawBody, signature, secret) {
  if (!signature || !secret) return false;
  try {
    const parsed = JSON.parse(rawBody);
    const sorted = sortObject(parsed);
    const signedString = JSON.stringify(sorted);

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-512" },
      false,
      ["sign"]
    );
    const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signedString));
    const hex = Array.from(new Uint8Array(mac))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return hex.toLowerCase() === signature.toLowerCase();
  } catch (e) {
    return false;
  }
}

function sortObject(obj) {
  if (Array.isArray(obj)) {
    return obj.map(sortObject);
  }
  if (obj && typeof obj === "object") {
    return Object.keys(obj)
      .sort()
      .reduce((result, k) => {
        result[k] = sortObject(obj[k]);
        return result;
      }, {});
  }
  return obj;
}

async function sendLicenseEmail(email, licenseKey, env) {
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": env.EMAIL_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: "ClauseCheck", email: "poorchaser@gmail.com" },
        to: [{ email }],
        subject: "Your ClauseCheck License Key",
        htmlContent: `
          <h2>Welcome to ClauseCheck!</h2>
          <p>Your license key is:</p>
          <p style="font-size: 24px; font-weight: bold; background: #f4f4f4; padding: 12px; border-radius: 8px; text-align: center; letter-spacing: 2px;">${licenseKey}</p>
          <p>Enter this key in the ClauseCheck extension popup to activate.</p>
          <p style="color: #666; font-size: 12px;">Keep this email for your records.</p>
          <p style="color: #888; font-size: 11px;">Need help? Reply to this email.</p>
        `,
      }),
    });
    if (!response.ok) {
      console.error("Email send failed:", response.status, await response.text());
    }
  } catch (e) {
    console.error("Email error:", e);
  }
}

function generateKey() {
  const seg = () =>
    Array.from(crypto.getRandomValues(new Uint8Array(2)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase();
  return `CC-${seg()}-${seg()}-${seg()}`;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}