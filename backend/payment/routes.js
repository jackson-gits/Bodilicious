import { Router } from "express";
import { verifyPayment, razorpayWebhook } from "./controller.js";
import { protect } from "../middleware/auth.js";

const router = Router();

// Endpoint to manually verify a payment signature from frontend
router.post("/verify", protect, verifyPayment);

// Webhook endpoint for Razorpay to hit
router.post("/webhook", razorpayWebhook);

export default router;
