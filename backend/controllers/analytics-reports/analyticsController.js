import orderModel from '../../models/order/orderModel.js';
import userModel from '../../models/user/userModel.js';
import foodModel from '../../models/product/foodModel.js';

// Get overall statistics
const getOverallStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        let dateFilter = { payment: true };
        if (startDate && endDate) {
            dateFilter.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // Total revenue
        const revenueData = await orderModel.aggregate([
            { $match: dateFilter },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalRevenue = revenueData[0]?.total || 0;

        // Total orders
        const totalOrders = await orderModel.countDocuments(dateFilter);

        // Total customers
        const totalCustomers = await userModel.countDocuments();

        // Average order value
        const avgOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0;

        // Orders by status
        const ordersByStatus = await orderModel.aggregate([
            { $match: { payment: true } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        res.json({
            success: true,
            data: {
                totalRevenue,
                totalOrders,
                totalCustomers,
                avgOrderValue,
                ordersByStatus
            }
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error getting statistics" });
    }
};

// Get revenue by date
const getRevenueByDate = async (req, res) => {
    try {
        const { period = 'week' } = req.query; // day, week, month, year

        let groupBy;
        let dateRange = new Date();
        
        switch (period) {
            case 'day':
                dateRange.setDate(dateRange.getDate() - 7);
                groupBy = {
                    year: { $year: '$date' },
                    month: { $month: '$date' },
                    day: { $dayOfMonth: '$date' }
                };
                break;
            case 'week':
                dateRange.setDate(dateRange.getDate() - 30);
                groupBy = {
                    year: { $year: '$date' },
                    week: { $week: '$date' }
                };
                break;
            case 'month':
                dateRange.setMonth(dateRange.getMonth() - 12);
                groupBy = {
                    year: { $year: '$date' },
                    month: { $month: '$date' }
                };
                break;
            case 'year':
                dateRange.setFullYear(dateRange.getFullYear() - 5);
                groupBy = {
                    year: { $year: '$date' }
                };
                break;
        }

        const revenueByDate = await orderModel.aggregate([
            {
                $match: {
                    payment: true,
                    date: { $gte: dateRange }
                }
            },
            {
                $group: {
                    _id: groupBy,
                    revenue: { $sum: '$amount' },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]);

        res.json({ success: true, data: revenueByDate });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error getting revenue data" });
    }
};

// Get top selling products
const getTopSellingProducts = async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const orders = await orderModel.find({ payment: true });
        
        const productSales = {};
        
        orders.forEach(order => {
            order.items.forEach(item => {
                const itemId = item._id || item.id;
                if (itemId) {
                    if (!productSales[itemId]) {
                        productSales[itemId] = {
                            name: item.name,
                            quantity: 0,
                            revenue: 0
                        };
                    }
                    productSales[itemId].quantity += item.quantity;
                    productSales[itemId].revenue += item.price * item.quantity;
                }
            });
        });

        const topProducts = Object.entries(productSales)
            .map(([id, data]) => ({ id, ...data }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, parseInt(limit));

        res.json({ success: true, data: topProducts });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error getting top products" });
    }
};

// Get customer analytics
const getCustomerAnalytics = async (req, res) => {
    try {
        // New vs returning customers (customers with more than 1 order)
        const allCustomers = await userModel.find({});
        
        const customerOrders = {};
        const orders = await orderModel.find({ payment: true });
        
        orders.forEach(order => {
            customerOrders[order.userId] = (customerOrders[order.userId] || 0) + 1;
        });

        const newCustomers = Object.values(customerOrders).filter(count => count === 1).length;
        const returningCustomers = Object.values(customerOrders).filter(count => count > 1).length;

        // Top customers by spending
        const topCustomers = await orderModel.aggregate([
            { $match: { payment: true } },
            {
                $group: {
                    _id: '$userId',
                    totalSpent: { $sum: '$amount' },
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { totalSpent: -1 } },
            { $limit: 10 }
        ]);

        // Populate user details
        for (let customer of topCustomers) {
            const user = await userModel.findById(customer._id);
            customer.name = user?.name || 'Unknown';
            customer.email = user?.email || 'N/A';
        }

        res.json({
            success: true,
            data: {
                totalCustomers: allCustomers.length,
                newCustomers,
                returningCustomers,
                topCustomers
            }
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error getting customer analytics" });
    }
};

// Export data to CSV
const exportToCSV = async (req, res) => {
    try {
        const { type } = req.params; // orders, customers, products
        
        let data = [];
        let headers = [];

        switch (type) {
            case 'orders':
                const orders = await orderModel.find({ payment: true }).sort({ date: -1 });
                headers = ['Order ID', 'Date', 'Customer', 'Items', 'Amount', 'Status'];
                data = orders.map(order => [
                    order._id,
                    new Date(order.date).toLocaleDateString(),
                    order.userId,
                    order.items.length,
                    order.amount,
                    order.status
                ]);
                break;

            case 'customers':
                const customers = await userModel.find({});
                headers = ['User ID', 'Name', 'Email', 'Loyalty Points'];
                data = customers.map(user => [
                    user._id,
                    user.name,
                    user.email,
                    user.loyaltyPoints || 0
                ]);
                break;

            case 'products':
                const products = await foodModel.find({});
                headers = ['Product ID', 'Name', 'Category', 'Price', 'Reviews', 'Rating'];
                data = products.map(product => [
                    product._id,
                    product.name,
                    product.category,
                    product.price,
                    product.totalReviews || 0,
                    product.averageRating || 0
                ]);
                break;
        }

        // Convert to CSV format
        let csv = headers.join(',') + '\n';
        data.forEach(row => {
            csv += row.map(cell => `"${cell}"`).join(',') + '\n';
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=${type}_${Date.now()}.csv`);
        res.send(csv);

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error exporting data" });
    }
};

export {
    getOverallStats,
    getRevenueByDate,
    getTopSellingProducts,
    getCustomerAnalytics,
    exportToCSV
};
