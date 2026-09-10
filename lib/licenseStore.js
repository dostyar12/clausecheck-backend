const crypto = require("crypto");

const store = new Map();

function generateKey() {
  const seg = () =>
    crypto.randomBytes(2).toString("hex").toUpperCase();
  return `CC-${seg()}-${seg()}-${seg()}`;
}

function createLicense({ email = null, paymentId = null } = {}) {
  const key = generateKey();
  const record = {
    key,
    email,
    paymentId,
    createdAt: new Date().toISOString(),
    active: true,
  };
  store.set(key, record);
  return record;
}

function verifyLicense(key) {
  const record = store.get(key);
  if (!record) return { valid: false };
  return { valid: record.active === true };
}

function getLicense(key) {
  return store.get(key) || null;
}

module.exports = { createLicense, verifyLicense, getLicense };
