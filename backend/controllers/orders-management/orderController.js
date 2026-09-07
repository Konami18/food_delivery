import orderModel from "../../models/order/orderModel.js";
import userModel from "../../models/user/userModel.js"
import QRCode from 'qrcode';
import { sendOrderConfirmation, sendOrderStatusUpdate } from "../../config/emailService.js";

//placing user order for frontend
const placeOrder = async (req, res) => {

    try {
        // Calculate estimated delivery time (45 minutes from now)
        const estimatedDelivery = new Date();
        estimatedDelivery.setMinutes(estimatedDelivery.getMinutes() + 45);

        const newOrder = new orderModel({
            userId: req.body.userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address,
            estimatedDelivery: estimatedDelivery,
            statusHistory: [{
                status: "Order Placed",
                timestamp: new Date(),
                note: "Your order has been received"
            }]
        })

        await newOrder.save();
        await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

        // Generate QR code for payment
        const accountNumber = process.env.BANK_ACCOUNT_NUMBER || "0123456789";
        const accountName = process.env.BANK_ACCOUNT_NAME || "DALN FOOD DELIVERY";
        const bankCode = "VIETQR";
        
        const amountVND = Math.round(req.body.amount);
        const description = `DALN${newOrder._id.toString().slice(-6)}`;

        // VietQR format
        const qrContent = `2|99|${accountNumber}|${accountName}|${amountVND}|${description}|${bankCode}`;

        const qrCodeImage = await QRCode.toDataURL(qrContent, {
            errorCorrectionLevel: 'M',
            type: 'image/png',
            width: 300,
            margin: 1,
        });

        res.json({ 
            success: true, 
            orderId: newOrder._id,
            qrCode: qrCodeImage,
            paymentInfo: {
                bankName: bankCode,
                accountNumber: accountNumber,
                accountName: accountName,
                amount: amountVND,
                content: description
            }
        })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })

    }
}

const verifyOrder = async (req, res) => {
    const { orderId, success } = req.body;
    try {
        if (success == "true") {
            await orderModel.findByIdAndUpdate(orderId, { payment: true });
            
            // Get order and user details
            const order = await orderModel.findById(orderId);
            const user = await userModel.findById(order.userId);
            
            // Send confirmation email
            if (user && user.email) {
                await sendOrderConfirmation(order, user.email, user.name);
            }

            // Add loyalty points (1 point per 1000 VND spent)
            const pointsToAdd = Math.floor(order.amount / 1000);
            await userModel.findByIdAndUpdate(order.userId, {
                $inc: { loyaltyPoints: pointsToAdd }
            });
            
            res.json({ 
                success: true, 
                message: "Paid",
                pointsEarned: pointsToAdd
            })
        }
        else {
            await orderModel.findByIdAndDelete(orderId);
            res.json({ success: false, message: "Not Paid" })
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

//user order for frontend
const userOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({ userId: req.body.userId });
        res.json({ success: true, data: orders })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })

    }
}

//danh sach dat hang cho admin
const listOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        res.json({ success: true, data: orders })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })

    }
}

// api cho cập nhật đơn hàng 
const updateStatus = async (req, res) => {
    try {
        const { orderId, status, deliveryPerson } = req.body;
        
        // Get current order
        const order = await orderModel.findById(orderId);
        
        // Add status to history
        const statusUpdate = {
            status: status,
            timestamp: new Date(),
            note: getStatusNote(status)
        };
        
        // Update order with new status and add to history
        const updateData = {
            status: status,
            $push: { statusHistory: statusUpdate }
        };
        
        // If delivery person info provided, add it
        if (deliveryPerson) {
            updateData.deliveryPerson = deliveryPerson;
        }
        
        await orderModel.findByIdAndUpdate(orderId, updateData);
        
        // Send status update email
        const user = await userModel.findById(order.userId);
        if (user && user.email) {
            await sendOrderStatusUpdate(orderId, status, user.email, user.name);
        }
        
        res.json({ success: true, message: "Status Updated" })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })

    }
}

// Helper function to get status note
const getStatusNote = (status) => {
    const statusNotes = {
        "Food Processing": "Restaurant is preparing your order",
        "Out for delivery": "Your order is on the way",
        "Delivered": "Order delivered successfully"
    };
    return statusNotes[status] || "Status updated";
};

// Get order details with tracking info
const getOrderTracking = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await orderModel.findById(orderId);
        
        if (!order) {
            return res.json({ success: false, message: "Order not found" });
        }
        
        res.json({ success: true, data: order });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching order tracking" });
    }
};

export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus, getOrderTracking }