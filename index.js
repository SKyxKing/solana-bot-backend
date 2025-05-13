const express = require("express");
const fetch = require("node-fetch");
const app = express();
const port = process.env.PORT || 10000;

app.get("/solana-ping", (req, res) => {
  res.json({ status: "Connected", version: { solanaCore: "2.1.21" } });
});

app.get("/token-price", async (req, res) => {
  const symbol = req.query.symbol?.toUpperCase() || "SOL";

  const tokenMap = {
    SOL: "solana",
    USDC: "usd-coin",
    USDT: "tether",
    BONK: "bonk-token",
    WBTC: "wrapped-bitcoin",
    // Add more tokens if needed
  };

  const tokenId = tokenMap[symbol];
  if (!tokenId) {
    return res.status(400).json({ error: "Unsupported token symbol." });
  }

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=usd`
    );

    if (!response.ok) {
      return res.status(500).json({ error: "Failed to fetch price" });
    }

    const data = await response.json();
    const price = data[tokenId]?.usd;

    if (!price) {
      return res.status(404).json({ error: "Price not found." });
    }

    res.json({
      symbol,
      price,
    });
  } catch (err) {
    console.error("Error fetching price:", err);
    res.status(500).json({ error: "Failed to fetch price", details: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
