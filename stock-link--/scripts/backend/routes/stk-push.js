const response = await axios.post(
  'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',

  {
    BusinessShortCode: process.env.SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: amount,
    PartyA: phone,
    PartyB: process.env.SHORTCODE,
    PhoneNumber: phone,
    CallBackURL: "https://f3d1-102-89-14-24.ngrok-free.app/api/mpesa/stk-callback", // <== Important!
    AccountReference: "StockLink",
    TransactionDesc: "Payment for goods",
  },
  {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  }
);

module.exports = router;