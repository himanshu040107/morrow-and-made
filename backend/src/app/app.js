import "dotenv/config";
import express from "express";
import appRoutes from "../routes/app.routes.js";
import cookieParser from "cookie-parser";
import productRoutes from "../routes/product.routes.js";
import cors from "cors";
const app = express();

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim());

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error("Origin is not allowed by CORS"));
    },
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
console.log("App loaded");

app.use("/api/auth", appRoutes);
app.use("/api/products", productRoutes);

export default app;
