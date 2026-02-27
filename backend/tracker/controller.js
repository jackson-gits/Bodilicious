import mongoose from "mongoose";
import Order from "./models.js";
import Product from "../products/models.js";
import UserProfile from "../profile/models.js";
import { getShiprocketToken } from "./shiprocketservice.js";



/* =========================================================
   CREATE ORDER (Transaction + Shiprocket Integration)
========================================================= */

export const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items, shippingDetails } = req.body;
    const userId = req.user._id;

    if (!items || items.length === 0) {
      throw new Error("No items provided");
    }

    if (!shippingDetails?.address) {
      throw new Error("Shipping details required");
    }

    let totalAmount = 0;
    const orderItems = [];

    // 🔹 Validate stock + calculate total
    for (const item of items) {
      const product = await Product.findById(item.productId).session(session);

      if (!product) throw new Error("Product not found");

      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }

      totalAmount += product.price * item.quantity;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        priceAtPurchase: product.price,
      });

      product.stock -= item.quantity;
      await product.save({ session });
    }

    // 🔹 Create Order in MongoDB
    const [order] = await Order.create(
      [
        {
          user: userId,
          items: orderItems,
          totalAmount,
          paymentStatus: "paid",
          orderStatus: "processing",
          shippingDetails,
        },
      ],
      { session }
    );

    await UserProfile.findByIdAndUpdate(
      userId,
      { $push: { orders: order._id } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();



    /* =========================================================
       SHIPROCKET INTEGRATION (Non-blocking)
    ========================================================= */

    try {
      if (process.env.SHIPROCKET_EMAIL && process.env.SHIPROCKET_PASSWORD) {

        // Let's get the token
        const token = await getShiprocketToken();

        // Map items
        const shiprocketItems = await Promise.all(
          items.map(async (item) => {
            const product = await Product.findById(item.productId);
            return {
              name: product.name,
              sku: product.pid || product._id.toString(),
              units: item.quantity,
              selling_price: product.price,
              discount: 0,
              tax: 0,
              hsn: "33049910",
            };
          })
        );

        // Format to pass strict Shiprocket validation
        const safePhone = (shippingDetails.phone || "").replace(/\D/g, "");
        const finalPhone = safePhone.length >= 10 ? safePhone.slice(-10) : "9999999999";

        const safePincode = (shippingDetails.pincode || "").replace(/\D/g, "");
        const finalPincode = safePincode.length === 6 ? safePincode : "110001";

        const nameParts = (shippingDetails.name || "").trim().split(" ");
        const firstName = nameParts[0] || "Customer";
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "User";

        const payload = {
          order_id: order._id.toString(),
          order_date: new Date().toISOString().split("T")[0],
          pickup_location: "Home",
          billing_customer_name: firstName,
          billing_last_name: lastName,
          billing_address: shippingDetails.address || "No Address Provided",
          billing_city: shippingDetails.city || "Delhi",
          billing_pincode: finalPincode,
          billing_state: shippingDetails.state || "Delhi",
          billing_country: "India",
          billing_email: shippingDetails.email || "customer@bodilicious.in",
          billing_phone: finalPhone,
          shipping_is_billing: true,
          order_items: shiprocketItems,
          payment_method: "Prepaid",
          sub_total: totalAmount,
          length: 10,
          breadth: 10,
          height: 10,
          weight: 0.5,
        };

        const createRes = await fetch(
          "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          }
        );

        if (createRes.ok) {
          const data = await createRes.json();
          const shipmentId = data.shipment_id;
          const shiprocketOrderId = data.order_id;

          if (shipmentId) {
            // Save shipmentId and shiprocketOrderId immediately
            await Order.findByIdAndUpdate(order._id, { shipmentId, shiprocketOrderId });

            const awbRes = await fetch(
              "https://apiv2.shiprocket.in/v1/external/courier/assign/awb",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ shipment_id: shipmentId }),
              }
            );

            if (awbRes.ok) {
              const awbData = await awbRes.json();
              const awbCode = awbData?.response?.data?.awb_code || null;

              if (awbCode) {
                await Order.findByIdAndUpdate(order._id, {
                  awb: awbCode,
                });
                order.awb = awbCode;
              }
            } else {
              console.error("AWB Assignment failed:", await awbRes.text());
            }
          }
        } else {
          const errText = await createRes.text();
          console.error("Shiprocket Create Order Failed:", createRes.status, errText);
        }
      }
    } catch (shipErr) {
      console.error("Shiprocket error:", shipErr.message);
    }

    // Populate the newly created order so frontend receives product details
    const populatedOrder = await Order.findById(order._id).populate("items.product");

    return res.status(201).json({
      success: true,
      data: populatedOrder,
    });

  } catch (err) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();

    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};



/* =========================================================
   TRACK ORDER (Real Shiprocket Tracking)
========================================================= */

export const trackShiprocketOrder = async (req, res) => {
  try {
    const { awb } = req.params;
    const userId = req.user._id;

    let order;

    if (mongoose.Types.ObjectId.isValid(awb)) {
      order = await Order.findOne({
        _id: awb,
        user: userId,
      });
    } else {
      order = await Order.findOne({
        awb,
        user: userId,
      });
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (!order.awb) {
      return res.status(400).json({
        success: false,
        message: "AWB not generated yet",
      });
    }

    if (!process.env.SHIPROCKET_EMAIL) {
      return res.status(500).json({
        success: false,
        message: "Shiprocket credentials not configured",
      });
    }

    const token = await getShiprocketToken();

    const trackRes = await fetch(
      `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${order.awb}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!trackRes.ok) {
      throw new Error("Tracking failed");
    }

    const trackData = await trackRes.json();

    const info = trackData?.tracking_data;

    if (!info || info.track_status === 0) {
      return res.status(404).json({
        success: false,
        message: "Tracking not available yet",
      });
    }

    const timeline =
      info.shipment_track_activities?.map((a) => ({
        status: a.activity,
        location: a.location,
        date: a.date,
        completed: true,
      })) || [];

    return res.json({
      success: true,
      data: {
        awb: order.awb,
        status: info.shipment_status || "Processing",
        expectedDelivery: "Coming soon",
        timeline,
      },
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};



/* =========================================================
   GET MY ORDERS
========================================================= */
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate("items.product");

    return res.json({
      success: true,
      data: orders,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};



/* =========================================================
   GET SINGLE ORDER
========================================================= */
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

    return res.json({
      success: true,
      data: order,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};



/* =========================================================
   CANCEL ORDER
========================================================= */
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      user: req.user._id,
      orderStatus: { $in: ["processing", "pending"] },
    });

    if (!order) {
      return res.status(400).json({
        success: false,
        message: "Order cannot be cancelled or not found",
      });
    }

    /* =========================================================
       Cancel on Shiprocket if shipmentId/AWB exists
    ========================================================= */
    if (order.awb || order.shiprocketOrderId) {
      try {
        if (process.env.SHIPROCKET_EMAIL) {
          const token = await getShiprocketToken();

          if (order.awb) {
            await fetch("https://apiv2.shiprocket.in/v1/external/orders/cancel/awbs", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({ awbs: [order.awb] })
            });
          } else if (order.shiprocketOrderId) {
            await fetch("https://apiv2.shiprocket.in/v1/external/orders/cancel", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({ ids: [order.shiprocketOrderId] })
            });
          }
        }
      } catch (err) {
        console.error("Failed to cancel on Shiprocket:", err.message);
      }
    }

    order.orderStatus = "cancelled";
    await order.save();

    return res.json({
      success: true,
      data: order,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};



/* =========================================================
   SOFT DELETE ORDER
========================================================= */
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      {
        _id: req.params.orderId,
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

    return res.json({
      success: true,
      data: {},
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};