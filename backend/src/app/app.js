import express from "express";
import appRoutes from "../routes/app.routes.js";
import cookieParser from "cookie-parser";
import productRoutes from "../routes/product.routes.js";
import cors from "cors";
const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
console.log("App loaded");

app.use("/api/auth", appRoutes);
app.use("/api/products", productRoutes);

export default app;
