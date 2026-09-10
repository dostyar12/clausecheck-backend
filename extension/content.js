const API_BASE = "https://clausecheck-backend.dostyar50.workers.dev";

if (!window.__clausecheckLoaded) {
  window.__clausecheckLoaded = true;
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === "explain") {
      handleExplain(msg.text)
        .then(() => sendResponse({ ok: true }))
        .catch((err) => sendResponse({ ok: false, error: String(err) }));
      return true;
    }
  });
}

async function handleExplain(text) {
  removeOverlay();

  const loadingEl = createLoadingOverlay();
  document.body.appendChild(loadingEl);

  try {
    const { licenseKey } = await chrome.storage.local.get("licenseKey");
    if (!licenseKey) {
      loadingEl.remove();
      showError("Please enter your license key in the extension popup.");
      return;
    }

    const res = await fetch(`${API_BASE}/api/explain`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, licenseKey }),
    });

    const data = await res.json();
    loadingEl.remove();

    if (!res.ok) {
      showError(data.error || "Failed to explain text");
      return;
    }

    showResult(data);
  } catch (err) {
    loadingEl.remove();
    showError("Could not reach ClauseCheck server. Is the backend running?");
  }
}

function createLoadingOverlay() {
  const el = document.createElement("div");
  el.id = "clausecheck-loading";
  el.innerHTML = `
    <div class="cc-loading-inner">
      <div class="cc-spinner"></div>
      <span>Analyzing legal text...</span>
    </div>
  `;
  return el;
}

function showResult({ summary, redFlags, riskScore }) {
  const colors = { Low: "#22c55e", Medium: "#f59e0b", High: "#ef4444", Critical: "#7f1d1d" };
  const color = colors[riskScore] || "#6b7280";

  const overlay = document.createElement("div");
  overlay.id = "clausecheck-overlay";
  overlay.innerHTML = `
    <div class="cc-panel">
      <div class="cc-header">
        <span class="cc-logo">ClauseCheck</span>
        <span class="cc-badge" style="background:${color}">${riskScore} Risk</span>
        <button class="cc-close">&times;</button>
      </div>
      <div class="cc-body">
        <p class="cc-summary">${escapeHtml(summary)}</p>
        ${redFlags.length ? `
          <div class="cc-flags">
            <strong>Red Flags:</strong>
            <ul>${redFlags.map((f) => `<li>${escapeHtml(f)}</li>`).join("")}</ul>
          </div>
        ` : '<p class="cc-noflags">No major red flags found.</p>'}
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  overlay.querySelector(".cc-close").addEventListener("click", () => overlay.remove());
  overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });
}

function showError(message) {
  const overlay = document.createElement("div");
  overlay.id = "clausecheck-overlay";
  overlay.innerHTML = `
    <div class="cc-panel cc-error">
      <div class="cc-header">
        <span class="cc-logo">ClauseCheck</span>
        <button class="cc-close">&times;</button>
      </div>
      <div class="cc-body">
        <p>${escapeHtml(message)}</p>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.querySelector(".cc-close").addEventListener("click", () => overlay.remove());
  overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });
}

function removeOverlay() {
  const existing = document.getElementById("clausecheck-overlay");
  if (existing) existing.remove();
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
