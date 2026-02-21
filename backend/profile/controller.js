import UserProfile from "./models.js";
import Product from "../products/models.js";
import Order from "../tracker/models.js";
export const getProfile = async (req, res) => {
  try {
    const user = await UserProfile.findById(req.user._id)
      .populate("wishlist")
      .populate("recentlyBought")
      .populate({
        path: "orders",
        populate: {
          path: "items.product",
        },
      });

    res.json({
      success: true,
      data: user,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
export const updateProfile = async (req, res) => {
  try {
    const updatedUser = await UserProfile.findByIdAndUpdate(
      req.user._id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedUser,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    const product = await Product.findById(productId);
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    const user = await UserProfile.findById(req.user._id);

    if (!user.wishlist.includes(productId)) {
      user.wishlist.push(productId);
      await user.save();
    }

    res.json({ success: true, message: "Added to wishlist" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    const user = await UserProfile.findById(req.user._id);

    user.wishlist = user.wishlist.filter(
      (id) => id.toString() !== productId
    );

    await user.save();

    res.json({ success: true, message: "Removed from wishlist" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate("items.product");

    res.json({
      success: true,
      data: orders,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
export const getRecentlyBought = async (req, res) => {
  try {
    const user = await UserProfile.findById(req.user._id)
      .populate("recentlyBought");

    res.json({
      success: true,
      data: user.recentlyBought,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

