import express from "express";
import { createPayment, confirmPayment, getPayments } from "../controllers/paymentController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = express.Router();

// User actions
router.post("/create", authMiddleware, createPayment);
router.post("/confirm", authMiddleware, confirmPayment);
router.get("/", authMiddleware, getPayments); // Only user's own payments

// Admin route: view all payments
router.get("/all", authMiddleware, adminMiddleware, getPayments); 

export default router;
