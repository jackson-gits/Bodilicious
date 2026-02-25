import { Router } from "express";
import {
  handleChat,
  burstLimiter,
  chatLimiter
} from "./controller.js";

const router = Router();

/*
  POST /chat
  - burstLimiter: protects against spam floods
  - chatLimiter: 500 requests/day per IP
*/
router.post(
  "/",
  burstLimiter,
  chatLimiter,
  handleChat
);

export default router;