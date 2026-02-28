import crypto from "crypto";
import Order from "../tracker/models.js";
import { getShiprocketToken } from "../tracker/shiprocketservice.js";
import Product from "../products/models.js";

/* =========================================================
   VERIFY PAYMENT SIGNATURE (From Frontend)
========================================================= */
export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const userId = req.user._id;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ success: false, message: "Missing Razorpay details" });
        }

        const order = await Order.findOne({ razorpayOrderId: razorpay_order_id, user: userId }).populate("items.product");

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // Verify signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            order.paymentStatus = "failed";
            await order.save();
            return res.status(400).json({ success: false, message: "Invalid payment signature" });
        }

        // Payment is valid
        if (order.paymentStatus !== "paid") {
            order.paymentStatus = "paid";
            order.razorpayPaymentId = razorpay_payment_id;
            order.razorpaySignature = razorpay_signature;
            await order.save();

            // Trigger Shiprocket now that it's paid
            await triggerShiprocket(order);
        }

        return res.status(200).json({ success: true, message: "Payment verified successfully", data: order });

    } catch (err) {
        console.error("Payment verification error:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
};


/* =========================================================
   RAZORPAY WEBHOOK
========================================================= */
export const razorpayWebhook = async (req, res) => {
    try {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const signature = req.headers["x-razorpay-signature"];

        // Verify webhook signature
        const expectedSignature = crypto
            .createHmac("sha256", webhookSecret)
            .update(JSON.stringify(req.body))
            .digest("hex");

        if (expectedSignature !== signature) {
            return res.status(400).json({ success: false, message: "Invalid webhook signature" });
        }

        const { event, payload } = req.body;

        if (event === "payment.captured") {
            const payment = payload.payment.entity;
            const razorpayOrderId = payment.order_id;

            const order = await Order.findOne({ razorpayOrderId }).populate("items.product");

            if (order && order.paymentStatus !== "paid") {
                order.paymentStatus = "paid";
                order.razorpayPaymentId = payment.id;
                await order.save();

                // Trigger Shiprocket
                await triggerShiprocket(order);
            }
        } else if (event === "payment.failed") {
            const payment = payload.payment.entity;
            const razorpayOrderId = payment.order_id;
            await Order.findOneAndUpdate({ razorpayOrderId }, { paymentStatus: "failed" });
        }

        return res.status(200).json({ success: true, message: "Webhook processed" });

    } catch (err) {
        console.error("Webhook processing error:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
};


/* =========================================================
   HELPER: TRIGGER SHIPROCKET
========================================================= */
async function triggerShiprocket(order) {
    try {
        if (!process.env.SHIPROCKET_EMAIL || !process.env.SHIPROCKET_PASSWORD) return;

        // Ensure we don't accidentally create twice if it already has an AWB or shipmentId
        if (order.shiprocketOrderId || order.shipmentId) return;

        const token = await getShiprocketToken();
        const shippingDetails = order.shippingDetails;

        const shiprocketItems = order.items.map(item => ({
            name: item.product.name,
            sku: item.product.pid || item.product._id.toString(),
            units: item.quantity,
            selling_price: item.product.price,
            discount: 0,
            tax: 0,
            hsn: "33049910",
        }));

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
            sub_total: order.totalAmount, // Ensure to use order amount here
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
                        await Order.findByIdAndUpdate(order._id, { awb: awbCode });
                        order.awb = awbCode;
                    }
                }
            }
        } else {
            console.error("Shiprocket Prepaid Order Failed:", await createRes.text());
        }
    } catch (err) {
        console.error("Delayed Shiprocket error:", err.message);
    }
}
