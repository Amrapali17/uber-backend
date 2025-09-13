import express from "express";
import { createPayment, confirmPayment, getPayments } from "../controllers/paymentController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = express.Router();


router.post("/create", authMiddleware, createPayment);
router.post("/confirm", authMiddleware, confirmPayment);
router.get("/", authMiddleware, getPayments); 

router.get("/all", authMiddleware, adminMiddleware, getPayments); 

export default router;
