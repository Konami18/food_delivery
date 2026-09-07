import express from "express"
import authMiddleware from "../../middleware/auth.js"
import { placeOrder, verifyOrder, userOrders, listOrders, updateStatus, getOrderTracking } from "../../controllers/orders-management/orderController.js"

const orderRoute = express.Router();

orderRoute.post("/place", authMiddleware, placeOrder, placeOrder);
orderRoute.post("/verify", verifyOrder)
orderRoute.post("/userorders", authMiddleware, userOrders);
orderRoute.get("/list", listOrders)
orderRoute.post("/status",updateStatus)
orderRoute.get("/tracking/:orderId", authMiddleware, getOrderTracking);

export default orderRoute;