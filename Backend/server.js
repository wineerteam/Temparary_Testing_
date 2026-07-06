import express from "express";
import "dotenv/config";
import dns from "dns";
dns.setServers(['8.8.8.8', '8.8.4.4']);
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import chatRoutes from "./routes/chat.js";
import authRoutes from "./auth/routes/authRoutes.js";
import { protect } from "./auth/middlewares/authMiddleware.js";
import { authLimiter, xssClean, mongoSanitizer } from "./auth/middlewares/security.js";

const app = express();
app.set("trust proxy", 1);
const PORT = process.env.PORT || 8080;

app.use(helmet());
app.use(express.json());
app.use(cookieParser());
// app.use(mongoSanitizer()); // Incompatible with Express 5 req.query getter
// app.use(xssClean);         // Incompatible with Express 5 req.query getter

app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}));

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api", protect, chatRoutes);

app.listen(PORT, () => {
    console.log(`server running on ${PORT}`);
    connectDB();
});

const connectDB = async() => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected with Database!");
    } catch(err) {
        console.log("Failed to connect with Db", err);
    }
}




