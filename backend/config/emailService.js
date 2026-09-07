import nodemailer from 'nodemailer';

// Create email transporter
const createTransporter = () => {
    return nodemailer.createTransporter({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER, // Your email
            pass: process.env.EMAIL_PASSWORD // Your app password
        }
    });
};

// Send order confirmation email
export const sendOrderConfirmation = async (orderData, userEmail, userName) => {
    try {
        const transporter = createTransporter();

        const itemsList = orderData.items.map(item => 
            `<li>${item.name} x ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}</li>`
        ).join('');

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: '✅ Order Confirmation - Your Order Has Been Received!',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px 10px 0 0;">
                        <h1 style="margin: 0;">🎉 Order Confirmed!</h1>
                    </div>
                    
                    <div style="padding: 30px 20px;">
                        <p style="font-size: 16px; color: #333;">Hi <strong>${userName}</strong>,</p>
                        
                        <p style="font-size: 16px; color: #333;">Thank you for your order! We've received it and are preparing your delicious meal.</p>
                        
                        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h2 style="color: #667eea; margin-top: 0;">Order Details</h2>
                            <p><strong>Order ID:</strong> #${orderData._id.slice(-8).toUpperCase()}</p>
                            <p><strong>Order Date:</strong> ${new Date(orderData.date).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}</p>
                        </div>
                        
                        <h3 style="color: #333;">Items Ordered:</h3>
                        <ul style="list-style: none; padding: 0;">
                            ${itemsList}
                        </ul>
                        
                        <div style="background: #f0f8ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #333; margin-top: 0;">Delivery Address:</h3>
                            <p style="margin: 5px 0;">${orderData.address.firstName} ${orderData.address.lastName}</p>
                            <p style="margin: 5px 0;">${orderData.address.street}</p>
                            <p style="margin: 5px 0;">${orderData.address.city}, ${orderData.address.state} ${orderData.address.zipcode}</p>
                            <p style="margin: 5px 0;">${orderData.address.country}</p>
                            <p style="margin: 5px 0;">📞 ${orderData.address.phone}</p>
                        </div>
                        
                        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                            <h3 style="color: #333; margin-top: 0;">Payment Summary:</h3>
                            <p style="margin: 5px 0;">Subtotal: $${(orderData.amount - 2).toFixed(2)}</p>
                            <p style="margin: 5px 0;">Delivery Fee: $2.00</p>
                            <h2 style="color: #667eea; margin: 10px 0;">Total: $${orderData.amount.toFixed(2)}</h2>
                        </div>
                        
                        <p style="font-size: 14px; color: #666; margin-top: 30px;">
                            Your order is currently being prepared. You'll receive another email when it's out for delivery.
                        </p>
                        
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="http://localhost:5173/myorders" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block;">
                                Track Your Order
                            </a>
                        </div>
                    </div>
                    
                    <div style="text-align: center; padding: 20px; background: #f5f5f5; color: #999; font-size: 12px; border-radius: 0 0 10px 10px;">
                        <p>Thank you for choosing our service!</p>
                        <p>If you have any questions, please contact us at support@fooddelivery.com</p>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };

    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: error.message };
    }
};

// Send order status update email
export const sendOrderStatusUpdate = async (orderId, status, userEmail, userName) => {
    try {
        const transporter = createTransporter();

        let statusMessage = '';
        let statusColor = '#667eea';

        switch (status) {
            case 'Food Processing':
                statusMessage = 'Your order is being prepared in the kitchen! 👨‍🍳';
                statusColor = '#ffa500';
                break;
            case 'Out For Delivery':
                statusMessage = 'Your order is on its way! 🚚';
                statusColor = '#2196f3';
                break;
            case 'Delivered':
                statusMessage = 'Your order has been delivered! Enjoy your meal! 🎉';
                statusColor = '#4caf50';
                break;
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: `📦 Order Update - ${status}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <div style="text-align: center; padding: 20px; background: ${statusColor}; color: white; border-radius: 10px 10px 0 0;">
                        <h1 style="margin: 0;">Order Status Update</h1>
                    </div>
                    
                    <div style="padding: 30px 20px; text-align: center;">
                        <p style="font-size: 16px; color: #333;">Hi <strong>${userName}</strong>,</p>
                        
                        <div style="background: #f9f9f9; padding: 30px; border-radius: 8px; margin: 20px 0;">
                            <h2 style="color: ${statusColor}; font-size: 24px;">${statusMessage}</h2>
                            <p style="font-size: 14px; color: #666; margin-top: 10px;">Order ID: #${orderId.slice(-8).toUpperCase()}</p>
                        </div>
                        
                        <a href="http://localhost:5173/myorders" style="background: ${statusColor}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; margin-top: 20px;">
                            View Order Details
                        </a>
                    </div>
                    
                    <div style="text-align: center; padding: 20px; background: #f5f5f5; color: #999; font-size: 12px; border-radius: 0 0 10px 10px;">
                        <p>Thank you for your order!</p>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Status update email sent:', info.messageId);
        return { success: true, messageId: info.messageId };

    } catch (error) {
        console.error('Error sending status update email:', error);
        return { success: false, error: error.message };
    }
};
