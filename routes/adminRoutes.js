// routes/adminRoutes.js
import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";
import { getUsers } from "../controllers/userController.js";
import { getRides } from "../controllers/rideController.js";
import { getPayments } from "../controllers/paymentController.js";

const router = express.Router();

// All routes protected by auth + admin check
router.use(authMiddleware, adminMiddleware);

// Users
router.get("/users", getUsers);

// Rides
router.get("/rides", getRides); // Admin sees all rides

// Payments
router.get("/payments", getPayments); // Admin sees all payments

export default router;
