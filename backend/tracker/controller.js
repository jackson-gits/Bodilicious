import mongoose from "mongoose";
import Order from "./models.js";
import Product from "../products/models.js";
import UserProfile from "../profile/models.js";

/*
  CREATE ORDER
  Professional version with transaction
*/

export const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items } = req.body;
    const userId = req.user._id;

    if (!items || items.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "No items provided",
      });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId)
        .session(session);

      if (!product) {
        throw new Error("Product not found");
      }

      if (product.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for ${product.name}`
        );
      }

      // Calculate total securely
      totalAmount += product.price * item.quantity;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        priceAtPurchase: product.price,
      });

      // Deduct stock
      product.stock -= item.quantity;
      await product.save({ session });
    }

    // Create order
    const order = await Order.create(
      [
        {
          user: userId,
          items: orderItems,
          totalAmount,
          paymentStatus: "paid", // change when integrating payment gateway
        },
      ],
      { session }
    );

    // Update user profile
    await UserProfile.findByIdAndUpdate(
      userId,
      {
        $push: {
          orders: order[0]._id,
        },
      },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      data: order[0],
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    })
      .sort({ createdAt: -1 })
      .populate("items.product");

    res.json({
      success: true,
      data: orders,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
export const getSingleOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      user: req.user._id,
    }).populate("items.product");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
export const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOneAndUpdate(
      {
        _id: orderId,
        user: req.user._id,
      },
      { isDeleted: true },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      message: "Order removed from your history",
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


export const cancelOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    }).session(session);

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.orderStatus !== "processing") {
      throw new Error("Order cannot be cancelled");
    }

    // Restore stock
    for (const item of order.items) {
      const product = await Product.findById(item.product)
        .session(session);

      if (product) {
        product.stock += item.quantity;
        await product.save({ session });
      }
    }

    order.orderStatus = "cancelled";
    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({
      success: true,
      message: "Order cancelled successfully",
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const trackShiprocketOrder = async (req, res) => {
  try {
    const { awb } = req.params;
    const email = process.env.SHIPROCKET_EMAIL;
    const password = process.env.SHIPROCKET_PASSWORD;

    // If we have credentials, make a real call to Shiprocket
    if (email && password) {
      // 1. Authenticate with Shiprocket to get token
      const authResponse = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      if (!authResponse.ok) {
        throw new Error("Failed to authenticate with Shiprocket");
      }

      const authData = await authResponse.json();
      const token = authData.token;

      // 2. Fetch tracking details
      const trackResponse = await fetch(`https://apiv2.shiprocket.in/v1/external/courier/track/awb/${awb}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (!trackResponse.ok) {
        throw new Error("Failed to fetch tracking details from Shiprocket");
      }

      const trackData = await trackResponse.json();

      // Ensure we have valid tracking data
      if (!trackData.tracking_data || trackData.tracking_data.track_status === 0) {
        throw new Error("Invalid AWB or no tracking details found");
      }

      const info = trackData.tracking_data;
      const history = info.shipment_track_activities || [];

      // Map Shiprocket response to the frontend's expected format
      const mappedTimeline = history.map(activity => ({
        status: activity.activity,
        location: activity.location,
        date: activity.date,
        completed: true
      }));

      // In Shiprocket, tracking activities are returned most recent first.
      // E.g., latest update is at index 0.

      const responseData = {
        awb: awb,
        status: info.shipment_status || "Processing",
        expectedDelivery: info.error ? "Unavailable" : "Coming soon",
        timeline: mappedTimeline
      };

      return res.json({
        success: true,
        data: responseData
      });

    } else {
      // Fallback: Mock Data if no credentials available
      const mockTimeline = [
        { status: "Delivered", location: "Customer Address", date: new Date().toLocaleDateString(), completed: true },
        { status: "Out for Delivery", location: "Local Hub", date: new Date(Date.now() - 86400000).toLocaleDateString(), completed: true },
        { status: "In Transit", location: "Regional Center", date: new Date(Date.now() - 172800000).toLocaleDateString(), completed: true },
        { status: "Shipped", location: "Warehouse", date: new Date(Date.now() - 259200000).toLocaleDateString(), completed: true },
      ];

      return res.json({
        success: true,
        data: {
          awb: awb,
          status: "Delivered",
          expectedDelivery: mockTimeline[0].date,
          timeline: mockTimeline
        }
      });
    }

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};