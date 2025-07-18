// PayPal is currently disabled
// const paypal = require("paypal-rest-sdk");

// paypal.configure({
//   mode: process.env.PAYPAL_MODE || "sandbox",
//   client_id: process.env.PAYPAL_CLIENT_ID || "",
//   client_secret: process.env.PAYPAL_CLIENT_SECRET || "",
// });

// Dummy paypal object for when PayPal is disabled
const paypal = {
  payment: {
    create: () => {}
  }
};

module.exports = paypal;
