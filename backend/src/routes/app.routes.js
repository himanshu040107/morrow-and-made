import { Router } from "express";
import {
  registerUserController,
  loginUserController,
  refreshTokenController,
  logoutController,
  getMeController,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import {
  registerValidator,
  loginValidator,
} from "../validators/auth.validator.js";
const router = Router();

console.log("Auth routes loaded");

// Register route
router.post("/register", registerValidator, registerUserController);

//Login router
router.post("/login", loginValidator, loginUserController);

// refresh token route
router.post("/refresh-token", refreshTokenController);

// Logout route
router.post("/logout", logoutController);

//getMe router
router.get("/me", authenticate, getMeController);

export default router;
