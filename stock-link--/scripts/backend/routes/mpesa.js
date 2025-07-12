const express = require('express');
const router = express.Router();
const axios = require('axios');
const moment = require('moment');

const consumerKey = process.env.MPESA_CONSUMER_KEY;
const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
const shortCode = process.env.MPESA_SHORTCODE; // 174379
const passkey = process.env.MPESA_PASSKEY;
const callbackUrl = process.env.MPESA_CALLBACK_URL;

router.post('/stk-push', async (req, res) => {
  const { phone, amount } = req.body;
  console.log("📦 Full req.body:", req.body);
  console.log("🔥 Received STK Push request:", phone, amount);

  try {
    // 1. Encode credentials
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

    // 2. Get access token
    const tokenResponse = await axios.get(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      { headers: { Authorization: `Basic ${auth}` } }
    );
    const accessToken = tokenResponse.data.access_token;

    // 3. Generate password
    const timestamp = moment().format('YYYYMMDDHHmmss');
    const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');

    // 4. Send STK Push
    const stkResponse = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        BusinessShortCode: shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: phone,
        PartyB: shortCode,
        PhoneNumber: phone,
        CallBackURL: callbackUrl,
        AccountReference: 'CompanyXLTD',
        TransactionDesc: 'Order Payment',
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.status(200).json(stkResponse.data);
  } catch (error) {
    console.error("❌ STK Push Error:", error?.response?.data || error.message);
    res.status(500).json({ error: 'Failed to initiate STK Push', details: error.message });
  }
});

// Handle callback from Safaricom
router.post('/stk-callback', (req, res) => {
  console.log("📞 STK Callback Received:", JSON.stringify(req.body, null, 2));

  // You can store this in DB or log it to file for now
  res.status(200).json({ message: 'Callback received successfully' });
});


module.exports = router;


