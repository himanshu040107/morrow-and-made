import { Router } from "express";
import upload from "../multer.js";
import { verifySeller } from "../middleware/verifySeller.js";
import { authenticate } from "../middleware/authenticate.js";
import {
  createProductController,
  getAllProductsController,
  getSingleProductController,
  updateProductController,
  deleteProductController,
} from "../controllers/product.controller.js";
import {
  createProductValidator,
  updateProductValidator,
  deleteProductValidator,
  getSingleProductValidator,
  getAllProductsValidator,
} from "../validators/product.validator.js";
const router = Router();

// Create a new product route
router.post(
  "/",
  authenticate,
  upload.single("productImage"),
  createProductValidator,
  verifySeller,
  createProductController,
);

// Get all products route
router.get("/", getAllProductsValidator, getAllProductsController);

// Get a single product route
router.get("/:id", getSingleProductValidator, getSingleProductController);

//update product route
router.put(
  "/:id",
  authenticate,
  verifySeller,
  upload.single("productImage"),
  updateProductValidator,
  updateProductController,
);

//delete product route
router.delete("/:id", authenticate, verifySeller, deleteProductValidator, deleteProductController);

export default router;
