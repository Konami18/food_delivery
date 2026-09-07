import express from "express";
import { addPromo, validatePromo, applyPromo, getAllPromos, updatePromo, deletePromo } from "../../controllers/products-management/promoController.js";
import authMiddleware from "../../middleware/auth.js";

const promoRouter = express.Router();

// Add promo code (Admin)
promoRouter.post("/add", addPromo);

// Validate promo code (User)
promoRouter.post("/validate", authMiddleware, validatePromo);

// Apply promo code after successful payment (User)
promoRouter.post("/apply", authMiddleware, applyPromo);

// Get all promo codes (Admin)
promoRouter.get("/list", getAllPromos);

// Update promo code (Admin)
promoRouter.post("/update", updatePromo);

// Delete promo code (Admin)
promoRouter.post("/delete", deletePromo);

export default promoRouter;
