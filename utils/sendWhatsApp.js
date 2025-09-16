const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromWhatsApp = process.env.TWILIO_WHATSAPP_FROM; // e.g., 'whatsapp:+14155238886'

let client = null;
if (accountSid && authToken) {
  try {
    client = require("twilio")(accountSid, authToken);
  } catch (_) {
    client = null;
  }
}

async function sendWhatsAppMessage({ toPhone, name, paymentId }) {
  if (!client || !fromWhatsApp) return;
  const to = toPhone.startsWith("whatsapp:") ? toPhone : `whatsapp:+91${toPhone}`;
  const body = `Hi ${name}, your payment was successful! Payment ID: ${paymentId}. Welcome to Cyber Guardians.`;
  try {
    await client.messages.create({ from: fromWhatsApp, to, body });
  } catch (err) {
    console.error("WhatsApp send failed", err?.message || err);
  }
}

module.exports = { sendWhatsAppMessage };
