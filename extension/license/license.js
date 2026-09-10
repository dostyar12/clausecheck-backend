function getLicense() {
  return chrome.storage.local.get("licenseKey").then((r) => r.licenseKey || null);
}

async function setLicense(key) {
  await chrome.storage.local.set({ licenseKey: key, licenseValid: false });
}

async function isActivated() {
  const { licenseValid } = await chrome.storage.local.get("licenseValid");
  return licenseValid === true;
}

module.exports = { getLicense, setLicense, isActivated };
