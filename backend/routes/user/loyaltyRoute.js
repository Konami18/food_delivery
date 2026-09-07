import express from "express";
import { getPoints, addPoints, redeemPoints, getRewardsInfo } from "../../controllers/user-management/loyaltyController.js";
import authMiddleware from "../../middleware/auth.js";

const loyaltyRouter = express.Router();

// All routes require authentication
loyaltyRouter.post("/points", authMiddleware, getPoints);
loyaltyRouter.post("/add", addPoints); // Called internally after order
loyaltyRouter.post("/redeem", authMiddleware, redeemPoints);
loyaltyRouter.post("/rewards", authMiddleware, getRewardsInfo);

export default loyaltyRouter;
