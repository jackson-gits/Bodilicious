import UserProfile from "./models.js";
import Product from "../products/models.js";
import Order from "../tracker/models.js";

/*
  GET PROFILE
  GET /api/v1/user
*/
export const getProfile = async (req, res) => {
  try {
    const user = await UserProfile.findById(req.user._id)
      .populate("wishlist")
      .populate("recentlyBought")
      .populate("cart.product")
      .populate({
        path: "orders",
        populate: {
          path: "items.product",
        },
      });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/*
  UPDATE PROFILE
*/
export const updateProfile = async (req, res) => {
  try {
    const updatedUser = await UserProfile.findByIdAndUpdate(
      req.user._id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: updatedUser });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/*
  ADD TO WISHLIST
  POST /api/v1/user/wishlist
*/
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await UserProfile.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { wishlist: productId } }, // prevents duplicates
      { new: true }
    );

    res.json({ success: true, message: "Added to wishlist" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/*
  REMOVE FROM WISHLIST
  DELETE /api/v1/user/wishlist/:productId
*/
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({ message: "Product ID required" });
    }

    const updatedUser = await UserProfile.findByIdAndUpdate(
      req.user._id,
      { $pull: { wishlist: productId } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ success: true, message: "Removed from wishlist" });
  } catch (err) {
    console.error("Wishlist delete error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
/*
  SYNC CART
  POST /api/v1/user/cart
*/
export const syncCart = async (req, res) => {
  try {
    const { cartItems } = req.body;

    if (!Array.isArray(cartItems)) {
      return res.status(400).json({ message: "Invalid cart payload" });
    }

    const user = await UserProfile.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.cart = cartItems.map(item => ({
      product: item.productId,
      quantity: item.quantity,
    }));

    await user.save();

    res.json({ success: true, cart: user.cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/*
  GET MY ORDERS
*/
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate("items.product");

    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/*
  GET RECENTLY BOUGHT
*/
export const getRecentlyBought = async (req, res) => {
  try {
    const user = await UserProfile.findById(req.user._id)
      .populate("recentlyBought");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ success: true, data: user.recentlyBought });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};