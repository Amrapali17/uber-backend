import express from "express";
import { getPromoCodes, addPromoCode } from "../controllers/promoController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();


router.get("/", authMiddleware, getPromoCodes); 
router.post("/", authMiddleware, addPromoCode); 

export default router;
