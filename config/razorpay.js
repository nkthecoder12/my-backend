const Razorpay = require("razorpay");

function getRazorpayInstance() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  
  if (!key_id || !key_secret) {
    throw new Error("RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET not set in environment");
  }
  
  return new Razorpay({ key_id, key_secret });
}

module.exports = { getRazorpayInstance };
