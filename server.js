const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

// 정적 파일 제공
app.use(express.static("public"));

// 테스트용 루트
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// USDC 히스토리 API 프록시
app.get("/api/usdc", async (req, res) => {
  try {
    const url = "https://api.coincap.io/v2/assets/usd-coin/history?interval=d1";

    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "usdc-dashboard/1.0"
      }
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({
        error: "Upstream API error",
        status: response.status,
        body: text
      });
    }

    const data = await response.json();
    return res.json(data);
  } catch (error) {
    return res.status(500).json({
      error: "Server fetch failed",
      message: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});