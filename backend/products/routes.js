import express from "express";
import { validate } from "../middleware/validate.js";
import {
  createProductSchema,
  updateProductSchema,
} from "./schema.js";
import {
  createProduct,
  getAllProducts,
  getProductByPid,
  updateProductByPid,
  deleteProductByPid,
} from "./controller.js";


const router = express.Router();

router.post("/", validate(createProductSchema), createProduct);

router.get("/all", getAllProducts);

router.get("/:pid", getProductByPid);

router.patch("/:pid", validate(updateProductSchema), updateProductByPid);

router.delete("/:pid", deleteProductByPid);


export default router;
