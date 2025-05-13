const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Connection, clusterApiUrl } = require("@solana/web3.js");

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

// ✅ Test Solana connection route
app.get("/solana-ping", async (req, res) => {
  try {
    const version = await connection.getVersion();
    res.json({ status: "Connected", version });
  } catch (err) {
    res.status(500).json({ error: "Solana connection failed", details: err.message });
  }
});

// 🔁 You can add more routes here later for trading, prices, etc.

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
