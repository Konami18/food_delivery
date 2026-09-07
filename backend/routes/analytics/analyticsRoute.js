import express from 'express';
import {
    getOverallStats,
    getRevenueByDate,
    getTopSellingProducts,
    getCustomerAnalytics,
    exportToCSV
} from '../../controllers/analytics-reports/analyticsController.js';

const analyticsRouter = express.Router();

// Get overall statistics
analyticsRouter.get('/stats', getOverallStats);

// Get revenue by date
analyticsRouter.get('/revenue', getRevenueByDate);

// Get top selling products
analyticsRouter.get('/top-products', getTopSellingProducts);

// Get customer analytics
analyticsRouter.get('/customers', getCustomerAnalytics);

// Export data to CSV
analyticsRouter.get('/export/:type', exportToCSV);

export default analyticsRouter;
