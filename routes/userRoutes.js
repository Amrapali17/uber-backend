import express from "express";
import { signupUser, loginUser, getUsers, getProfile, updateProfile } from "../controllers/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Public routes
router.post("/signup", signupUser);
router.post("/login", loginUser);

// Admin-only routes
router.get("/users", authMiddleware, adminMiddleware, getUsers);

// Logged-in user routes
router.get("/profile", authMiddleware, getProfile);  // ✅ corrected
router.put("/profile", authMiddleware, updateProfile);

export default router;
