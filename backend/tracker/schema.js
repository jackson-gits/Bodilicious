import { z } from "zod";

// Mongo ObjectId validation
const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID");

// Order item validation
const orderItemSchema = z.object({
  productId: objectId,
  quantity: z
    .number({
      required_error: "Quantity is required",
    })
    .int("Quantity must be an integer")
    .min(1, "Quantity must be at least 1"),
});

// Create Order Schema
export const createOrderSchema = z
  .object({
    items: z
      .array(orderItemSchema)
      .min(1, "At least one item is required"),
  })
  .strict();
