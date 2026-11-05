import { body, param, query } from "express-validator";
import { validationResult } from "express-validator";
// Validation for creating a product
export const createProductValidator = [
  body("productName")
    .notEmpty()
    .withMessage("Product name is required")
    .isString()
    .withMessage("Product name must be a string"),
  body("productDescription")
    .notEmpty()
    .withMessage("Product description is required")
    .isString()
    .withMessage("Product description must be a string"),
  body("productPrice")
    .notEmpty()
    .withMessage("Product price is required")
    .isNumeric()
    .withMessage("Product price must be a number"),
  body("stock")
    .notEmpty()
    .withMessage("Stock is required")
    .isNumeric()
    .withMessage("Stock must be a number"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

// Validation for updating a product
export const updateProductValidator = [
  body("productName")
    .optional()
    .isString()
    .withMessage("Product name must be a string"),
  body("productDescription")
    .optional()
    .isString()
    .withMessage("Product description must be a string"),
  body("productPrice")
    .optional()
    .isNumeric()
    .withMessage("Product price must be a number"),
  body("stock").optional().isNumeric().withMessage("Stock must be a number"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

// Validation for deleting a product
export const deleteProductValidator = [
  param("id")
    .notEmpty()
    .withMessage("Product id is required")
    .isMongoId()
    .withMessage("Invalid product id"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

// Validation for getting a single product
export const getSingleProductValidator = [
  param("id")
    .notEmpty()
    .withMessage("Product id is required")
    .isMongoId()
    .withMessage("Invalid product id"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

// Validation for getting all products
export const getAllProductsValidator = [
  query("page").optional().isNumeric().withMessage("Page must be a number"),
  query("limit").optional().isNumeric().withMessage("Limit must be a number"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
