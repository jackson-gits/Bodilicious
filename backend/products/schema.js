import { z } from "zod";

/*
  PRODUCT CREATION
  - No rating
  - No reviews
  - No isActive
  - No extra fields allowed
*/
export const createProductSchema = z
  .object({
    pid: z.string().min(1, "Product ID is required"),

    name: z.string().min(1, "Name is required"),

    images: z
      .array(z.string().url("Each image must be a valid URL"))
      .min(1, "At least one image is required"),

    description: z.string().min(1, "Description is required"),

    uses: z.array(z.string().trim()).optional(),

    symptomsCured: z.array(z.string().trim()).optional(),

    ingredients: z.array(z.string().trim()).optional(),

    type: z.enum(["skin", "hair", "other"]),

    price: z.number().positive("Price must be greater than 0"),

    stock: z
      .number()
      .int("Stock must be an integer")
      .nonnegative("Stock cannot be negative"),
  })
  .strict();

/*
  PRODUCT UPDATE
  - Partial updates
  - Still no forbidden fields
*/
export const updateProductSchema =
  createProductSchema.partial().strict();

/*
  REVIEW CREATION
  - user comes from req.user
  - client cannot fake identity
*/
export const createReviewSchema = z
  .object({
    rating: z
      .number()
      .min(1, "Rating must be at least 1")
      .max(5, "Rating cannot exceed 5"),

    comment: z.string().trim().optional(),
  })
  .strict();
