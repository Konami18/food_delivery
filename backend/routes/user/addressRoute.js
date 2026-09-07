import express from "express";
import { addAddress, getAddresses, updateAddress, deleteAddress, setDefaultAddress } from "../../controllers/user-management/addressController.js";
import authMiddleware from "../../middleware/auth.js";

const addressRouter = express.Router();

// All routes require authentication
addressRouter.post("/add", authMiddleware, addAddress);
addressRouter.post("/list", authMiddleware, getAddresses);
addressRouter.post("/update", authMiddleware, updateAddress);
addressRouter.post("/delete", authMiddleware, deleteAddress);
addressRouter.post("/setdefault", authMiddleware, setDefaultAddress);

export default addressRouter;
