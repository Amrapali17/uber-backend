// 1️⃣ Import and configure dotenv first, at the very top
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

import userRoutes from "./routes/userRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import rideRoutes from "./routes/rideRoutes.js";
import { getUsers } from "./controllers/userController.js";  
import notificationRoutes from "./routes/notificationRoutes.js";
import promoRoutes from "./routes/promoRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

// ✅ Remove any dynamic dotenv import
// if (process.env.NODE_ENV !== "production") {
//   import('dotenv').then(dotenv => dotenv.config());
// }

const app = express();
app.use(cors());
app.use(express.json());

console.log("Stripe Secret Key:", process.env.STRIPE_SECRET_KEY ? "Loaded" : "Not Loaded");
console.log("Stripe Publishable Key:", process.env.STRIPE_PUBLISHABLE_KEY ? "Loaded" : "Not Loaded");
console.log("Supabase URL:", process.env.SUPABASE_URL ? "Loaded" : "Not Loaded");
console.log("Supabase Service Role Key:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "Loaded" : "Not Loaded");

app.get("/test", (req, res) => {
  res.send("Server is running!");
});

app.use("/api/auth", userRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/rides", rideRoutes);
app.get("/api/users", getUsers); 
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/promos", promoRoutes);

app.get("/", (req, res) => {
  res.send("🚀 Uber Clone Backend Running!");
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log("🔌 A user connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
