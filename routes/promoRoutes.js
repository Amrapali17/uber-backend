import express from "express";
import { getPromoCodes, addPromoCode } from "../controllers/promoController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public / Auth routes
router.get("/", authMiddleware, getPromoCodes); // Get all promo codes
router.post("/", authMiddleware, addPromoCode); // Add promo code (admin only)

export default router;
