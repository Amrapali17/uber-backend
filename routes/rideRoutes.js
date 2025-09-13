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

// Rider/Driver actions
router.post("/request", authMiddleware, requestRide);
router.post("/accept", authMiddleware, acceptRide);
router.post("/complete", authMiddleware, completeRide);
router.post("/cancel/:ride_id", authMiddleware, cancelRide);

router.put("/driver-location/:ride_id", authMiddleware, updateDriverLocation);

// GET rides
router.get("/available", authMiddleware, getAvailableRides); // Driver sees available rides
router.get("/all", authMiddleware, adminMiddleware, getRides); // Admin sees all rides
router.get("/:ride_id", authMiddleware, getRideById); // Ride detail
router.get("/", authMiddleware, getRides); // Rider/Driver sees own rides

export default router;
