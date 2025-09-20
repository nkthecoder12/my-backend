const { getRazorpayInstance } = require("../config/razorpay");
const Enrollment = require("../models/Enrollment");

// Course pricing configuration
const COURSE_PRICES = {
  "Ethical Hacking": 10000,
  "Cybersecurity":10000 ,
  "SOC Analyst": 1,
  "CCNA": 10000,
  "Java": 8000,
  "Python": 8000
};

const VALID_COURSES = Object.keys(COURSE_PRICES);

async function createOrder(req, res) {
  try {
    const { name, email, phone, course } = req.body;
    
    // Validate required fields
    if (!name || !email || !phone || !course) {
      return res.status(400).json({ message: "name, email, phone, course are required" });
    }

    // Validate course selection
    if (!VALID_COURSES.includes(course)) {
      return res.status(400).json({ message: "Invalid course selected" });
    }

    // Get price for the selected course
    const price = COURSE_PRICES[course];

    const razorpay = getRazorpayInstance();

    const order = await razorpay.orders.create({
      amount: Math.round(price * 100), // Convert to paise
      currency: "INR",
      payment_capture: 1,
      notes: { name, email, phone, course, price },
    });

    const enrollment = await Enrollment.create({
      name,
      email,
      phone,
      course,
      price,
      paymentStatus: "PENDING",
      razorpayOrderId: order.id,
    });

    return res.status(201).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
      enrollmentId: enrollment._id,
      course,
      price,
    });
  } catch (err) {
    console.error("Error creating order:", err);
    
    // Enhanced error handling for DB failures
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: "Validation error", 
        details: err.message 
      });
    }
    
    if (err.name === 'MongoError' || err.name === 'MongooseError') {
      return res.status(500).json({ 
        message: "Database error occurred. Please try again." 
      });
    }
    
    return res.status(500).json({ message: "Failed to create order" });
  }
}

module.exports = { createOrder };
