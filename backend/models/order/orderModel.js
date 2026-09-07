import mongoose from "mongoose"

const orderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    items: { type: Array, required: true },
    amount: { type: Number, required: true },
    address: { type: Object, required: true },
    status: { type: String, default: "Food Processing" },
    date: { type: Date, default: Date.now() },
    payment: { type: Boolean, default: false },
    statusHistory: [{
        status: { type: String },
        timestamp: { type: Date, default: Date.now },
        note: { type: String }
    }],
    estimatedDelivery: { type: Date },
    deliveryPerson: {
        name: { type: String },
        phone: { type: String },
        vehicle: { type: String }
    }
})


const orderModel=mongoose.models.order||mongoose.model("order",orderSchema);
export default orderModel;