import express from "express";
import { sendNotification, getNotifications } from "../controllers/notificationController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Send notification manually
router.post("/send", authMiddleware, sendNotification);

// Get notifications for driver
router.get("/", authMiddleware, getNotifications);

export default router;
