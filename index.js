const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Example endpoint to trigger bot logic
app.post('/start', async (req, res) => {
    const { action, walletAddress } = req.body;
    console.log(`Received bot trigger from ${walletAddress} with action ${action}`);

    // Simulate response (actual bot logic will be plugged in)
    res.json({
        message: `Bot started for wallet ${walletAddress}`,
        status: "success"
    });
});

app.get("/", (req, res) => {
    res.send("Solana Bot Backend is Running!");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});