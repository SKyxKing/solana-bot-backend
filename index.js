const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Connection, clusterApiUrl } = require("@solana/web3.js");
const fetch = require("node-fetch");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// ✅ Connect to Solana Mainnet
const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");

// ✅ Health check route
app.get("/", (req, res) => {
  res.send("✅ Solana bot backend is live.");
});

// ✅ Solana ping test route
app.get("/solana-ping", async (req, res) => {
  try {
    const version = await connection.getVersion();
    res.json({ status: "Connected", version });
  } catch (err) {
    res.status(500).json({ error: "Solana connection failed", details: err.message });
  }
});

// ✅ Real-time token price route (e.g. /token-price?symbol=SOL)
app.get("/token-price", async (req, res) => {
  const symbol = req.query.symbol?.toUpperCase() || "SOL";

  // Token map to use Jupiter symbols to token mint addresses
  const tokenMap = {
    SOL: "So11111111111111111111111111111111111111112",
    USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    USDT: "Es9vMFrzaCERpE2Wk6t5jf7Joc6ABMaBeK7u4RY1pL9D",
    BONK: "DezXzFnvUQ7t8u2dU9TnFbGqiyRMz2GHDTsX4zGmfcRi",
    WBTC: "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E",
    // Add more tokens if needed
  };

  const mint = tokenMap[symbol];
  if (!mint) {
    return res.status(400).json({ error: "Unsupported token symbol." });
  }

  try {
    const response = await fetch(`https://quote-api.jup.ag/v6/price?ids=${mint}`);
    const data = await response.json();
    const price = data?.data?.[mint]?.price;

    if (!price) {
      return res.status(404).json({ error: "Price not found." });
    }

    res.json({
      symbol,
      price,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch price", details: err.message });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running on port
