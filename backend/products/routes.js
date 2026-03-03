import express from "express";
import { validate } from "../middleware/validate.js";
import { protect } from "../middleware/auth.js";
import {
  createProductSchema,
  updateProductSchema,
  createReviewSchema,
} from "./schema.js";
import {
  createProduct,
  getAllProducts,
  getProductByPid,
  updateProductByPid,
  deleteProductByPid,
  addReview,
} from "./controller.js";

const router = express.Router();

router.post("/", validate(createProductSchema), createProduct);

router.get("/", getAllProducts);

router.get("/:pid", getProductByPid);

router.patch("/:pid", validate(updateProductSchema), updateProductByPid);

router.delete("/:pid", deleteProductByPid);

router.post("/:pid/reviews", protect, validate(createReviewSchema), addReview);

export default router;
