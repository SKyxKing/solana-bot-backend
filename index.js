const express = require('express');
const axios = require('axios'); // This is the dependency we'll use for API calls
const { Connection, PublicKey } = require('@solana/web3.js'); // For Solana Blockchain interaction

const app = express();
const port = process.env.PORT || 10000;

app.use(express.json());

// Fetch Token Price (SOL, ETH, etc.) from CoinGecko
async function getTokenPrice(symbol) {
  try {
    const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd`);
    return response.data[symbol] ? response.data[symbol].usd : null; // USD price of token
  } catch (error) {
    console.error('Error fetching price:', error);
    return null;
  }
}

// Fetch Solana Wallet Balance
async function getSolanaBalance(walletAddress) {
  const connection = new Connection('https://api.mainnet-beta.solana.com');
  try {
    const publicKey = new PublicKey(walletAddress);
    const balance = await connection.getBalance(publicKey);
    return balance / 1e9; // Convert lamports to SOL
  } catch (err) {
    console.error("Error fetching Solana balance:", err);
    return null;
  }
}

// API Endpoint to fetch wallet balance and token price
app.get("/wallet-balance", async (req, res) => {
  const { walletAddress, token } = req.query;

  if (!walletAddress || !token) {
    return res.status(400).json({ error: "Wallet address and token are required" });
  }

  // Fetch balance (only supporting SOL for now)
  let balance;
  if (token.toUpperCase() === 'SOL') {
    balance = await getSolanaBalance(walletAddress);
  } else {
    return res.status(400).json({ error: "Unsupported token" });
  }

  if (balance === null) {
    return res.status(500).json({ error: "Failed to fetch wallet balance" });
  }

  // Fetch price from CoinGecko
  const price = await getTokenPrice(token.toLowerCase());
  if (!price) {
    return res.status(500).json({ error: "Failed to fetch token price" });
  }

  const totalValue = balance * price;

  res.json({
    walletAddress,
    balance,
    price,
    totalValue,
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
