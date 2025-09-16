const express = require("express");
const router = express.Router();
const { createOrder } = require("../controllers/enrollController");
const { verifyPayment } = require("../controllers/paymentController");

router.post("/enroll", createOrder);
router.post("/verify-payment", verifyPayment);

module.exports = router;
