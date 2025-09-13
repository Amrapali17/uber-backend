import express from "express";
import {
  requestRide,
  acceptRide,
  completeRide,
  cancelRide,
  getRides,
  getAvailableRides,
  getRideById,
  updateDriverLocation
} from "../controllers/rideController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/request", authMiddleware, requestRide);
router.post("/accept", authMiddleware, acceptRide);
router.post("/complete", authMiddleware, completeRide);
router.post("/cancel/:ride_id", authMiddleware, cancelRide);

router.put("/driver-location/:ride_id", authMiddleware, updateDriverLocation);


router.get("/available", authMiddleware, getAvailableRides); 
router.get("/all", authMiddleware, adminMiddleware, getRides); 
router.get("/:ride_id", authMiddleware, getRideById); 
router.get("/", authMiddleware, getRides); 

export default router;
