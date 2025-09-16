const crypto = require("crypto");
const Enrollment = require("../models/Enrollment");
const { appendEnrollmentRow } = require("../config/googleSheets");
const { sendWhatsAppMessage } = require("../utils/sendWhatsApp");

async function verifyPayment(req, res) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment verification fields" });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      await Enrollment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { paymentStatus: "FAILED", razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature }
      );
      return res.status(400).json({ message: "Invalid signature" });
    }

    const enrollment = await Enrollment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        paymentStatus: "PAID",
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      },
      { new: true }
    );

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    try {
      await appendEnrollmentRow({
        name: enrollment.name,
        email: enrollment.email,
        phone: enrollment.phone,
        course: enrollment.course,
        price: enrollment.price,
        paymentId: enrollment.razorpayPaymentId,
        status: enrollment.paymentStatus,
      });
    } catch (e) {
      console.error("Failed to append to Google Sheets", e);
      // Don't fail the payment verification if Google Sheets fails
    }

    try {
      if (sendWhatsAppMessage) {
        await sendWhatsAppMessage({
          toPhone: enrollment.phone,
          name: enrollment.name,
          paymentId: enrollment.razorpayPaymentId,
        });
      }
    } catch (e) {
      console.error("Failed to send WhatsApp message", e);
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("Error verifying payment:", err);
    return res.status(500).json({ message: "Verification failed" });
  }
}

async function webhook(req, res) {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    if (!secret || !signature) return res.status(400).end();

    // Use rawBody for HMAC validation
    const payload = Buffer.isBuffer(req.rawBody) ? req.rawBody.toString() : JSON.stringify(req.body);

    const shasum = crypto.createHmac("sha256", secret);
    shasum.update(payload);
    const digest = shasum.digest("hex");

    if (digest !== signature) {
      return res.status(400).json({ message: "Invalid webhook signature" });
    }

    const event = JSON.parse(payload);
    if (event && event.event === "payment.captured") {
      const paymentId = event.payload.payment.entity.id;
      const orderId = event.payload.payment.entity.order_id;

      const enrollment = await Enrollment.findOneAndUpdate(
        { razorpayOrderId: orderId },
        { paymentStatus: "PAID", razorpayPaymentId: paymentId },
        { new: true }
      );

      if (enrollment) {
        try {
          await appendEnrollmentRow({
            name: enrollment.name,
            email: enrollment.email,
            phone: enrollment.phone,
            course: enrollment.course,
            price: enrollment.price,
            paymentId: enrollment.razorpayPaymentId,
            status: enrollment.paymentStatus,
          });
        } catch (e) {
          console.error("Failed to append to Google Sheets via webhook", e);
          // Don't fail the webhook if Google Sheets fails
        }

        try {
          if (sendWhatsAppMessage) {
            await sendWhatsAppMessage({
              toPhone: enrollment.phone,
              name: enrollment.name,
              paymentId: enrollment.razorpayPaymentId,
            });
          }
        } catch (e) {
          console.error("Failed to send WhatsApp message via webhook", e);
        }
      }
    }

    return res.json({ status: "ok" });
  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(500).end();
  }
}

module.exports = { verifyPayment, webhook };
