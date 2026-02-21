import express from "express";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

import {
  getProfile,
  updateProfile,
  addToWishlist,
  removeFromWishlist,
  getRecentlyBought,
  getMyOrders,
 
} from "./controller.js";
import UserProfile from "./models.js";

import { updateUserProfileSchema } from "./schema.js";

const router = express.Router();

/*
  PROFILE
  Base: /api/users
*/

// GET /api/users
router.get("/", protect, getProfile);

// PUT /api/users
router.put(
  "/",
  protect,
  validate(updateUserProfileSchema),
  updateProfile
);

// DELETE /api/users
router.delete("/", protect, async (req, res) => {
  await UserProfile.findByIdAndDelete(req.user._id);
  res.json({ success: true, message: "Account deleted" });
});

/*
  WISHLIST
*/

// GET /api/users/wishlist
router.get("/wishlist", protect, async (req, res) => {
  const user = await UserProfile.findById(req.user._id)
    .populate("wishlist");
  res.json({ success: true, data: user.wishlist });
});

// POST /api/users/wishlist
router.post("/wishlist", protect, addToWishlist);

// DELETE /api/users/wishlist/:productId
router.delete("/wishlist/:productId", protect, removeFromWishlist);

/*
  ORDERS
*/

// GET /api/users/orders
router.get("/orders", protect, getMyOrders);


// GET /api/users/recent
router.get("/recent", protect, getRecentlyBought);

export default router;
