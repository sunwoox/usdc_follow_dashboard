const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;
const CG_API_KEY = process.env.CG_API_KEY || "";

// 5분 캐시
const CACHE_TTL_MS = 5 * 60 * 1000;
let usdcCache = {
  fetchedAt: 0,
  data: null
};

app.use(express.static("public"));

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/api/usdc", async (req, res) => {
  try {
    const now = Date.now();

    // 캐시가 유효하면 CoinGecko를 다시 치지 않음
    if (usdcCache.data && now - usdcCache.fetchedAt < CACHE_TTL_MS) {
      return res.json({
        cached: true,
        fetchedAt: usdcCache.fetchedAt,
        ...usdcCache.data
      });
    }

    const url =
      "https://api.coingecko.com/api/v3/coins/usd-coin/market_chart?vs_currency=usd&days=90";

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "x-cg-demo-api-key": CG_API_KEY
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

    if (!data || !Array.isArray(data.market_caps)) {
      return res.status(500).json({
        error: "Unexpected response shape",
        data
      });
    }

    // 프론트 기존 형식 유지
    const normalized = {
      data: data.market_caps.map(([time, marketCapUsd]) => ({
        time,
        marketCapUsd: String(marketCapUsd)
      }))
    };

    usdcCache = {
      fetchedAt: now,
      data: normalized
    };

    return res.json({
      cached: false,
      fetchedAt: usdcCache.fetchedAt,
      ...normalized
    });
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
