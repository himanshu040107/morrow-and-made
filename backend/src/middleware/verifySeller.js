import jwt from "jsonwebtoken";
import config from "../config/config.js";
import User from "../models/user.model.js"
// Middleware to verify seller role
export const verifySeller = async(req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ message: "Authorization header is required" });
  }
  if (!req.headers.authorization.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Invalid Authorization header format" });
  }
  const accessToken = req.headers.authorization.split(" ")[1];
  if (!accessToken) {
    return res.status(401).json({ message: "Access Token is required" });
  }
  try {
    const decoded = jwt.verify(accessToken, config.ACCESS_TOKEN_SECRET);
    if(!decoded.id){
        return res.status(401).json({ message: "Invalid Access Token" });
    }
    const user=await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    if (user.role !== "seller") {
      return res.status(403).json({ message: "Access denied. Only sellers are allowed." });
    }
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Error in verifySeller middleware:", error);
    res.status(401).json({ message: "Invalid Access Token" });
  }
};