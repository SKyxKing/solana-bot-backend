const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Connection, PublicKey } = require('@solana/web3.js');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 10000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Solana connection
const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');

// Function to get wallet balance from Solana blockchain
const getWalletBalance = async (walletAddress) => {
  try {
    const publicKey = new PublicKey(walletAddress);
    const balance = await connection.getBalance(publicKey);
    // Convert lamports to SOL (1 SOL = 1e9 lamports)
    return balance / 1e9;
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    return null;
  }
};

// Function to get token price from an API (Jupiter API)
const getTokenPrice = async () => {
  try {
    const response = await axios.get('https://quote-api.jup.ag/v6/price?ids=So11111111111111111111111111111111111111112');
    if (response.data && response.data[0] && response.data[0].price) {
      return response.data[0].price;
    }
    return null;
  } catch (error) {
    console.error('Error fetching token price:', error);
    return null;
  }
};

// Health check endpoint
app.get('/solana-ping', (req, res) => {
  res.json({ status: 'Connected', version: { 'solana-core': '2.1.21', 'feature-set': 1416569292 } });
});

// Wallet balance endpoint
app.get('/wallet-balance', async (req, res) => {
  const { walletAddress, token } = req.query;

  if (!walletAddress || !token) {
    return res.status(400).json({ error: 'Missing walletAddress or token parameter' });
  }

  try {
    const balance = await getWalletBalance(walletAddress);
    const price = await getTokenPrice();

    if (balance === null || price === null) {
      return res.status(500).json({ error: 'Failed to fetch data' });
    }

    res.json({
      balance,
      price,
      totalValue: balance * price,
    });
  } catch (error) {
    console.error('Error in /wallet-balance endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 🔥 NEW: Get dynamic crypto info from CoinGecko (e.g., BTC, ETH, etc.)
app.get('/crypto-info', async (req, res) => {
  const { coinId } = req.query;

  if (!coinId) {
    return res.status(400).json({ error: 'Missing coinId query parameter' });
  }

  try {
    const priceRes = await axios.get(`https://api.coingecko.com/api/v3/simple/price`, {
      params: {
        ids: coinId,
        vs_currencies: 'usd',
      },
    });

    const chartRes = await axios.get(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart`, {
      params: {
        vs_currency: 'usd',
        days: '7', // Last 7 days of data
      },
    });

    const price = priceRes.data[coinId]?.usd ?? null;
    const chart = chartRes.data?.prices ?? [];

    if (price === null || chart.length === 0) {
      return res.status(500).json({ error: 'Failed to retrieve crypto info from CoinGecko' });
    }

    res.json({ price, chart });
  } catch (error) {
    console.error('Error fetching CoinGecko data:', error.message);
    res.status(500).json({ error: 'Failed to fetch CoinGecko data' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
