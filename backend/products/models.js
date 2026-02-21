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

const productSchema = new mongoose.Schema(
  {
    pid: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    images: {
  type: [String],
  required: true,
},
    description: { type: String, required: true },
    uses: [String],
    symptomsCured: [String],
    isActive: {
  type: Boolean,
  default: true,
},

    ingredients: [String],
    type: { type: String, enum: ["skin", "hair", "other"], required: true },
    rating: Number,
ratingCount: Number,
    reviews: [reviewSchema],
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
  },
  { timestamps: true }
);

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
