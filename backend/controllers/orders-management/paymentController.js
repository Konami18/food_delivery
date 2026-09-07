import QRCode from 'qrcode';
import orderModel from "../../models/order/orderModel.js";

const generatePaymentQR = async (req, res) => {
    try {
        const { orderId, amount, bankCode = "VIETQR" } = req.body;

        const accountNumber = process.env.BANK_ACCOUNT_NUMBER || "0123456789";
        const accountName = process.env.BANK_ACCOUNT_NAME || "DALN FOOD DELIVERY";
        const bankCode_upper = bankCode.toUpperCase();

        const amountVND = Math.round(amount);

        const description = `DALN${orderId.slice(-6)}`;

        const qrContent = `2|99|${accountNumber}|${accountName}|${amountVND}|${description}|${bankCode_upper}`;

        const qrCodeImage = await QRCode.toDataURL(qrContent, {
            errorCorrectionLevel: 'M',
            type: 'image/png',
            width: 300,
            margin: 1,
        });

        res.json({
            success: true,
            qrCode: qrCodeImage,
            paymentInfo: {
                bankName: bankCode_upper,
                accountNumber: accountNumber,
                accountName: accountName,
                amount: amountVND,
                content: description
            }
        });

    } catch (error) {
        console.log("Error generating QR code:", error);
        res.json({ success: false, message: "Error generating QR code" });
    }
};

const verifyPayment = async (req, res) => {
    try {
        const { orderId, success } = req.body;

        if (success === "true") {
            await orderModel.findByIdAndUpdate(orderId, { 
                payment: true,
                'statusHistory': {
                    $push: {
                        status: "Payment Confirmed",
                        timestamp: new Date(),
                        note: "Payment received via QR code"
                    }
                }
            });
            res.json({ success: true, message: "Payment verified" });
        } else {
            await orderModel.findByIdAndDelete(orderId);
            res.json({ success: false, message: "Payment not completed" });
        }

    } catch (error) {
        console.log("Error verifying payment:", error);
        res.json({ success: false, message: "Error verifying payment" });
    }
};

export { generatePaymentQR, verifyPayment };
