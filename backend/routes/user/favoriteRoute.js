import express from "express";
import { addToFavorites, removeFromFavorites, getFavorites, checkFavorite, getFavoriteIds } from "../../controllers/user-management/favoriteController.js";
import authMiddleware from "../../middleware/auth.js";

const favoriteRouter = express.Router();

// All routes require authentication
favoriteRouter.post("/add", authMiddleware, addToFavorites);
favoriteRouter.post("/remove", authMiddleware, removeFromFavorites);
favoriteRouter.post("/list", authMiddleware, getFavorites);
favoriteRouter.get("/check/:foodId", authMiddleware, checkFavorite);
favoriteRouter.post("/ids", authMiddleware, getFavoriteIds);

export default favoriteRouter;
