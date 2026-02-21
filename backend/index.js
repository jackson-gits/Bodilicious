import { Router } from "express";
import productRoutes from "./products/routes.js";
import profileRoutes from "./profile/routes.js";
const router = Router();

router.use("/products", productRoutes);
router.use("/user",profileRoutes);

export default router;
