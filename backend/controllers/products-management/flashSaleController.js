import flashSaleModel from '../../models/product/flashSaleModel.js';
import foodModel from '../../models/product/foodModel.js';

// Get all active flash sales
const getActiveFlashSales = async (req, res) => {
    try {
        const now = new Date();
        
        const flashSales = await flashSaleModel.find({
            isActive: true,
            startTime: { $lte: now },
            endTime: { $gte: now }
        })
        .populate('foodItems', 'name price image category')
        .sort({ priority: -1, startTime: -1 });

        res.json({ success: true, data: flashSales });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching flash sales" });
    }
};

// Get all flash sales (admin)
const getAllFlashSales = async (req, res) => {
    try {
        const flashSales = await flashSaleModel.find()
            .populate('foodItems', 'name price image')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: flashSales });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching flash sales" });
    }
};

// Create new flash sale (admin)
const createFlashSale = async (req, res) => {
    try {
        const { title, description, discountPercent, startTime, endTime, foodItems, bannerImage, priority } = req.body;

        // Validate times
        const start = new Date(startTime);
        const end = new Date(endTime);
        
        if (end <= start) {
            return res.json({ success: false, message: "End time must be after start time" });
        }

        const newFlashSale = new flashSaleModel({
            title,
            description,
            discountPercent,
            startTime: start,
            endTime: end,
            foodItems: foodItems || [],
            bannerImage,
            priority: priority || 0,
            isActive: true
        });

        await newFlashSale.save();
        res.json({ success: true, message: "Flash sale created successfully", data: newFlashSale });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error creating flash sale" });
    }
};

// Update flash sale (admin)
const updateFlashSale = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Validate times if provided
        if (updateData.startTime && updateData.endTime) {
            const start = new Date(updateData.startTime);
            const end = new Date(updateData.endTime);
            
            if (end <= start) {
                return res.json({ success: false, message: "End time must be after start time" });
            }
        }

        const flashSale = await flashSaleModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).populate('foodItems');

        if (!flashSale) {
            return res.json({ success: false, message: "Flash sale not found" });
        }

        res.json({ success: true, message: "Flash sale updated successfully", data: flashSale });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error updating flash sale" });
    }
};

// Delete flash sale (admin)
const deleteFlashSale = async (req, res) => {
    try {
        const { id } = req.params;

        const flashSale = await flashSaleModel.findByIdAndDelete(id);

        if (!flashSale) {
            return res.json({ success: false, message: "Flash sale not found" });
        }

        res.json({ success: true, message: "Flash sale deleted successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error deleting flash sale" });
    }
};

// Toggle flash sale active status (admin)
const toggleFlashSaleStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const flashSale = await flashSaleModel.findById(id);
        if (!flashSale) {
            return res.json({ success: false, message: "Flash sale not found" });
        }

        flashSale.isActive = !flashSale.isActive;
        await flashSale.save();

        res.json({ 
            success: true, 
            message: `Flash sale ${flashSale.isActive ? 'activated' : 'deactivated'}`,
            data: flashSale
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error toggling flash sale status" });
    }
};

// Get flash sale price for a specific food item
const getFlashSalePrice = async (req, res) => {
    try {
        const { foodId } = req.params;
        const now = new Date();

        // Find active flash sale containing this food item
        const flashSale = await flashSaleModel.findOne({
            isActive: true,
            startTime: { $lte: now },
            endTime: { $gte: now },
            foodItems: foodId
        }).sort({ priority: -1 });

        if (!flashSale) {
            return res.json({ success: true, hasFlashSale: false });
        }

        const food = await foodModel.findById(foodId);
        if (!food) {
            return res.json({ success: false, message: "Food item not found" });
        }

        const originalPrice = food.price;
        const discountedPrice = originalPrice * (1 - flashSale.discountPercent / 100);

        res.json({
            success: true,
            hasFlashSale: true,
            originalPrice,
            discountedPrice: discountedPrice.toFixed(2),
            discountPercent: flashSale.discountPercent,
            flashSaleTitle: flashSale.title,
            endTime: flashSale.endTime
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching flash sale price" });
    }
};

export { 
    getActiveFlashSales, 
    getAllFlashSales, 
    createFlashSale, 
    updateFlashSale, 
    deleteFlashSale,
    toggleFlashSaleStatus,
    getFlashSalePrice
};
