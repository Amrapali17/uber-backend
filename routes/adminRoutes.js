
import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";
import { getUsers } from "../controllers/userController.js";
import { getRides } from "../controllers/rideController.js";
import { getPayments } from "../controllers/paymentController.js";

const router = express.Router();

router.use(authMiddleware, adminMiddleware);


router.get("/users", getUsers);

router.get("/rides", getRides); 


router.get("/payments", getPayments); 

export default router;
