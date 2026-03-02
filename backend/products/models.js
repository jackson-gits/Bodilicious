import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserProfile",
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const ingredientSchema = new mongoose.Schema({
  key_actives: [String],
  botanical_extracts: [String],
  others: [String]
}, { _id: false });

const usageSchema = new mongoose.Schema({
  time: String,
  frequency: String,
  routine_step: String
}, { _id: false });

const productSchema = new mongoose.Schema(
  {
    pid: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    brand: { type: String, default: "Bodilicious" },
    images: {
      type: [String],
      required: true,
    },
    description: { type: String, required: true },

    category: { type: String, enum: ["skin", "hair", "body", "makeup", "lip", "other"], required: true },
    sub_category: String,
    product_type: String,
    item_form: String,

    ingredients: ingredientSchema,
    benefits: [String],
    concerns_targeted: [String],
    usage: usageSchema,

    price: { type: Number, required: true },
    stock: { type: Number, default: 0, min: 0 },

    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    reviews: [reviewSchema],

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Add indexes for performant filtering
productSchema.index({ category: 1 });
productSchema.index({ product_type: 1 });
productSchema.index({ concerns_targeted: 1 });
productSchema.index({ price: 1 });
productSchema.index({ stock: 1 });

// Allow Mongoose to auto-create the collection on startup when explicitly requested.
productSchema.set("autoCreate", true);


const Product =
  mongoose.models.Product ||
  mongoose.model("Product", productSchema);

// Optional helper to create the collection explicitly after DB connects.
export const initProductCollection = async () => {
  await Product.createCollection();
};

export default Product;
