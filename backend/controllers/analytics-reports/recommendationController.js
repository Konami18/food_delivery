import orderModel from '../../models/order/orderModel.js';
import foodModel from '../../models/product/foodModel.js';

// Get personalized recommendations based on order history
const getPersonalizedRecommendations = async (req, res) => {
    try {
        const userId = req.body.userId;

        // Get user's order history
        const userOrders = await orderModel.find({ userId, payment: true });
        
        if (userOrders.length === 0) {
            // New user - return trending items
            return getTrendingItems(req, res);
        }

        // Extract all items user has ordered
        const orderedFoodIds = new Set();
        const categoryPreferences = {};
        
        userOrders.forEach(order => {
            order.items.forEach(item => {
                orderedFoodIds.add(item._id || item.id);
                const category = item.category;
                if (category) {
                    categoryPreferences[category] = (categoryPreferences[category] || 0) + 1;
                }
            });
        });

        // Find favorite category
        const favoriteCategory = Object.keys(categoryPreferences).sort(
            (a, b) => categoryPreferences[b] - categoryPreferences[a]
        )[0];

        // Get recommendations from favorite category (exclude already ordered)
        const recommendations = await foodModel.find({
            category: favoriteCategory,
            _id: { $nin: Array.from(orderedFoodIds) }
        }).limit(8);

        // If not enough, add popular items from other categories
        if (recommendations.length < 8) {
            const additionalItems = await foodModel.find({
                _id: { $nin: Array.from(orderedFoodIds) }
            })
            .sort({ totalReviews: -1 })
            .limit(8 - recommendations.length);
            
            recommendations.push(...additionalItems);
        }

        res.json({
            success: true,
            data: recommendations,
            reason: `Based on your love for ${favoriteCategory}`
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error getting recommendations" });
    }
};

// Get trending/popular items
const getTrendingItems = async (req, res) => {
    try {
        // Find items that appear most in recent orders
        const recentOrders = await orderModel.find({ payment: true })
            .sort({ date: -1 })
            .limit(100);

        const itemCounts = {};
        
        recentOrders.forEach(order => {
            order.items.forEach(item => {
                const itemId = item._id || item.id;
                if (itemId) {
                    itemCounts[itemId] = (itemCounts[itemId] || 0) + item.quantity;
                }
            });
        });

        // Sort by count and get top items
        const trendingIds = Object.entries(itemCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(entry => entry[0]);

        const trendingItems = await foodModel.find({
            _id: { $in: trendingIds }
        });

        res.json({
            success: true,
            data: trendingItems,
            reason: "Trending now"
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error getting trending items" });
    }
};

// Get similar items based on category and price range
const getSimilarItems = async (req, res) => {
    try {
        const { foodId } = req.params;

        const food = await foodModel.findById(foodId);
        if (!food) {
            return res.json({ success: false, message: "Food not found" });
        }

        // Find similar items in same category, similar price range
        const priceRange = food.price * 0.3; // +/- 30% price range

        const similarItems = await foodModel.find({
            _id: { $ne: foodId },
            category: food.category,
            price: {
                $gte: food.price - priceRange,
                $lte: food.price + priceRange
            }
        }).limit(6);

        res.json({
            success: true,
            data: similarItems,
            reason: `Similar to ${food.name}`
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error getting similar items" });
    }
};

// Get frequently bought together
const getFrequentlyBoughtTogether = async (req, res) => {
    try {
        const { foodId } = req.params;

        // Find orders containing this item
        const orders = await orderModel.find({
            payment: true,
            'items._id': foodId
        }).limit(50);

        const itemCounts = {};

        orders.forEach(order => {
            order.items.forEach(item => {
                const itemId = (item._id || item.id)?.toString();
                if (itemId && itemId !== foodId) {
                    itemCounts[itemId] = (itemCounts[itemId] || 0) + 1;
                }
            });
        });

        // Get top 4 frequently bought together items
        const frequentIds = Object.entries(itemCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4)
            .map(entry => entry[0]);

        const frequentItems = await foodModel.find({
            _id: { $in: frequentIds }
        });

        res.json({
            success: true,
            data: frequentItems,
            reason: "Frequently bought together"
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error getting frequently bought items" });
    }
};

export { 
    getPersonalizedRecommendations, 
    getTrendingItems, 
    getSimilarItems,
    getFrequentlyBoughtTogether
};
