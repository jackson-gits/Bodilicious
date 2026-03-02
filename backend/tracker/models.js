import mongoose from "mongoose";

/* =========================================
   Order Item Schema
========================================= */
const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  priceAtPurchase: {
    type: Number,
    required: true,
  },
});


/* =========================================
   Shipping Snapshot Schema
========================================= */
const shippingDetailsSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
  },
  { _id: false }
);


/* =========================================
   Main Order Schema
========================================= */
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserProfile",
      required: true,
      index: true,
    },

    items: [orderItemSchema],

    totalAmount: {
      type: Number,
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["cod", "razorpay"],
      default: "cod",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
      index: true,
    },

    orderStatus: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "processing",
      index: true,
    },

    /* =========================================
       Razorpay Fields
    ========================================= */

    razorpayOrderId: {
      type: String,
      default: null,
    },

    razorpayPaymentId: {
      type: String,
      default: null,
    },

    razorpaySignature: {
      type: String,
      default: null,
    },

    /* =========================================
       Shiprocket Fields
    ========================================= */

    awb: {
      type: String,
      default: null,
      index: true,
    },

    shipmentId: {
      type: Number,
      default: null,
    },

    shiprocketOrderId: {
      type: Number,
      default: null,
    },

    /* =========================================
       Shipping Snapshot
    ========================================= */

    shippingDetails: {
      type: shippingDetailsSchema,
      required: true,
    },

    /* =========================================
       Soft Delete
    ========================================= */

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);


/* =========================================
   Automatically exclude deleted orders
========================================= */
orderSchema.pre(/^find/, function () {
  this.where({ isDeleted: false });
});


const Order =
  mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;