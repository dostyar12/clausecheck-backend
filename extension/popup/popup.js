const API_BASE = "https://clausecheck-backend.dostyar50.workers.dev";

const activatedView = document.getElementById("activated-view");
const activateView = document.getElementById("activate-view");
const keyInput = document.getElementById("key-input");
const activateBtn = document.getElementById("activate-btn");
const errorMsg = document.getElementById("error-msg");

async function init() {
  const { licenseKey, licenseValid } = await chrome.storage.local.get([
    "licenseKey",
    "licenseValid",
  ]);

  if (licenseKey && licenseValid) {
    showActivated();
  } else if (licenseKey) {
    await verifyAndShow(licenseKey);
  } else {
    showActivate();
  }
}

async function verifyAndShow(key) {
  try {
    const res = await fetch(`${API_BASE}/api/verify-license`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ licenseKey: key }),
    });
    const data = await res.json();

    if (data.valid) {
      await chrome.storage.local.set({ licenseValid: true });
      showActivated();
    } else {
      await chrome.storage.local.remove(["licenseKey", "licenseValid"]);
      showActivate();
      showError("Invalid license key");
    }
  } catch {
    showError("Could not reach server. Try again later.");
    showActivate();
  }
}

function showActivated() {
  activatedView.classList.remove("hidden");
  activateView.classList.add("hidden");
}

function showActivate() {
  activatedView.classList.add("hidden");
  activateView.classList.remove("hidden");
}

function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.classList.remove("hidden");
}

activateBtn.addEventListener("click", async () => {
  const key = keyInput.value.trim().toUpperCase();
  if (!key) {
    showError("Please enter a key");
    return;
  }

  errorMsg.classList.add("hidden");
  activateBtn.disabled = true;
  activateBtn.textContent = "Verifying...";

  try {
    const res = await fetch(`${API_BASE}/api/verify-license`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ licenseKey: key }),
    });
    const data = await res.json();

    if (data.valid) {
      await chrome.storage.local.set({ licenseKey: key, licenseValid: true });
      showActivated();
    } else {
      showError("Invalid license key");
    }
  } catch {
    showError("Could not reach server. Is the backend running?");
  } finally {
    activateBtn.disabled = false;
    activateBtn.textContent = "Activate";
  }
});

init();
