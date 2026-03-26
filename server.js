const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/api/usdc", async (req, res) => {
  const url = "https://api.coincap.io/v2/assets/usd-coin/history?interval=d1";

  try {
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        Accept: "application/json",
        "User-Agent": "usdc-dashboard/1.0"
      }
    });

    return res.json(response.data);
  } catch (error) {
    console.error("USDC upstream error:", {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      data: error.response?.data
    });

    return res.status(500).json({
      error: "Server fetch failed",
      message: error.message,
      code: error.code || null,
      status: error.response?.status || null,
      data: error.response?.data || null
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
