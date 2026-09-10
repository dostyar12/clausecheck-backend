const express = require("express");
const { handleExplain } = require("./routes/explain");
const { handleVerify } = require("./routes/verify-license");
const { handleWebhook } = require("./routes/webhook");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok" }));
app.post("/api/explain", handleExplain);
app.post("/api/verify-license", handleVerify);
app.post("/api/webhook/nowpayments", handleWebhook);

app.listen(PORT, () => {
  console.log(`ClauseCheck backend running on port ${PORT}`);
});
