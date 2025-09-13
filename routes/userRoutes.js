import express from "express";
import { signupUser, loginUser, getUsers, getProfile, updateProfile } from "../controllers/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";


const router = express.Router();


router.post("/signup", signupUser);
router.post("/login", loginUser);

router.get("/users", authMiddleware, adminMiddleware, getUsers);


router.get("/profile", authMiddleware, getProfile);  
router.put("/profile", authMiddleware, updateProfile);

export default router;
