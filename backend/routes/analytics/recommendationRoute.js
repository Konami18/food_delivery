import express from 'express';
import {
    getPersonalizedRecommendations,
    getTrendingItems,
    getSimilarItems,
    getFrequentlyBoughtTogether
} from '../../controllers/analytics-reports/recommendationController.js';
import authMiddleware from '../../middleware/auth.js';

const recommendationRouter = express.Router();

// Get personalized recommendations (requires auth)
recommendationRouter.post('/personalized', authMiddleware, getPersonalizedRecommendations);

// Get trending items (public)
recommendationRouter.get('/trending', getTrendingItems);

// Get similar items (public)
recommendationRouter.get('/similar/:foodId', getSimilarItems);

// Get frequently bought together (public)
recommendationRouter.get('/frequently-bought/:foodId', getFrequentlyBoughtTogether);

export default recommendationRouter;
