import { Router } from "express";
import productRoutes from "./products/routes.js";
import profileRoutes from "./profile/routes.js";
import chatRoutes from "./chat/routes.js";

const router = Router();

router.use("/products", productRoutes);
router.use("/user", profileRoutes);
router.use("/chat", chatRoutes);

export default router;
