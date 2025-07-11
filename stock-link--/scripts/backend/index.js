//const express = require('express');
const bodyParser = require('body-parser');
const axios = require("axios");
const moment = require("moment");
require("dotenv").config();
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');

//const express = require("express");
//const cors = require("cors");

const express = require("express");
const app = express();
const mpesaRoutes = require('./routes/mpesa');
app.use(express.json());
app.use(cors());

app.post("/api/mpesa/callback", (req, res) => {
  console.log("📦 Callback received:", JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});


const productRoutes = require('./routes/products');
const salesRoutes = require('./routes/sales');
const authRoutes = require('./routes/auth');

const healthCheck = (req, res) => res.status(200).json({ status: 'ok' });

function startExpressApp() {
  const app = express();
  const PORT = process.env.PORT || 5000;

  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  app.use(helmet());
  app.use(cors());
  app.use(bodyParser.json({ limit: '10mb' }));




  // Add this to your backend server
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

  app.get('/api/health', healthCheck);
  app.use('/api/products', productRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/sales', salesRoutes);
  app.use('/uploads', express.static(uploadsDir));

  app.use((err, req, res, next) => {
    console.error('❌ Server error:', err.stack);
    res.status(500).json({ error: 'Internal server error' });
  });

  app.listen(PORT, '127.0.0.1', () => {
    console.log(`✅ Backend server running at http://127.0.0.1:${PORT}`);
    console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📦 Node.js version: ${process.version}`);
  });
}

// 👇 This was missing
startExpressApp();

// server.js or index.js
app.use(express.json());
app.use('/api/mpesa', mpesaRoutes);
//app.use('/api/mpesa', mpesaRoutes); // ✅ This connects all /api/mpesa/... endpoints
app.use("/api/mpesa", require("./routes/mpesa"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
app.use(cors({
  origin: "http://localhost:3000"
}));


//Daraja API
app.post("/api/mpesa/stk-push", async (req, res) => {
  const { phone, amount } = req.body;

  console.log("🔥 STK Push requested to:", phone, "for", amount);

  if (!phone || !amount) {
    return res.status(400).json({ error: "Missing phone or amount" });
  }

  const consumerKey = process.env.DARAJA_CONSUMER_KEY;
  const consumerSecret = process.env.DARAJA_CONSUMER_SECRET;
  const shortcode = "174379"; // Sandbox paybill
  const passkey = process.env.DARAJA_PASSKEY;

  const timestamp = moment().format("YYYYMMDDHHmmss");
  const password = Buffer.from(shortcode + passkey + timestamp).toString("base64");

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

  try {
    // Step 1: Get access token
    const tokenRes = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    const access_token = tokenRes.data.access_token;

    // Step 2: Send STK Push
    const stkRes = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: phone,
        PartyB: shortcode,
        PhoneNumber: phone,
        CallBackURL: "https://myapp.com/api/mpesa/callback", // update later with ngrok
        AccountReference: "StockLink",
        TransactionDesc: "Stock purchase",
      },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    console.log("✅ STK Push Success:", stkRes.data);
    res.status(200).json(stkRes.data);
  } catch (error) {
    console.error("❌ STK Push Failed:", error.response?.data || error.message);
    res.status(500).json({ error: "STK Push failed" });
  }
});







