import express from "express";
import { protect } from "../middleware/auth.js";

import {
  createOrder,
  getMyOrders,
  getSingleOrder,
  cancelOrder,
  deleteOrder,
  trackShiprocketOrder,
} from "./controller.js";

const router = express.Router();

/*
  ORDERS / TRACKER
  Base: /api/orders
*/

// =============================
// CREATE ORDER
// POST /api/orders
// =============================
router.post("/", protect, createOrder);

// =============================
// GET MY ORDERS
// GET /api/orders
// =============================
router.get("/", protect, getMyOrders);

// =============================
// TRACK ORDER (Shiprocket)
// GET /api/orders/shiprocket/:awb
// ⚠ Must be ABOVE :orderId route
// =============================
router.get("/shiprocket/:awb", protect, trackShiprocketOrder);

// =============================
// GET SINGLE ORDER
// GET /api/orders/:orderId
// =============================
router.get("/:orderId", protect, getSingleOrder);

// =============================
// CANCEL ORDER
// PATCH /api/orders/:orderId/cancel
// =============================
router.patch("/:orderId/cancel", protect, cancelOrder);

// =============================
// SOFT DELETE ORDER
// DELETE /api/orders/:orderId
// =============================
router.delete("/:orderId", protect, deleteOrder);

export default router;