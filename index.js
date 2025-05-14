const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const { Connection, PublicKey } = require('@solana/web3.js');

const app = express();
const port = process.env.PORT || 10000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Solana connection
const connection = new Connection('https://api.mainnet-beta.solana.com');

// Function to fetch wallet balance
async function getWalletBalance(walletAddress) {
  try {
    const publicKey = new PublicKey(walletAddress);
    const balance = await connection.getBalance(publicKey);
    return balance / 1e9; // Convert lamports to SOL
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    return null;
  }
}

// Function to fetch the current price of SOL from CoinGecko API
async function getTokenPrice() {
  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
    return response.data.solana.usd;
  } catch (error) {
    console.error('Error fetching token price:', error);
    return null;
  }
}

// Endpoint to fetch wallet balance and token price
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

    // Send the wallet balance and token price as the response
    res.json({
      balance,
      price,
      totalValue: balance * price, // Total value of the wallet in USD
    });
  } catch (error) {
    console.error('Error in /wallet-balance endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Starting the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
