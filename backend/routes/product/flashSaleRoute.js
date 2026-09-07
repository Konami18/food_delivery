import express from 'express';
import { 
    getActiveFlashSales, 
    getAllFlashSales, 
    createFlashSale, 
    updateFlashSale, 
    deleteFlashSale,
    toggleFlashSaleStatus,
    getFlashSalePrice
} from '../../controllers/products-management/flashSaleController.js';
import authMiddleware from '../../middleware/auth.js';

const flashSaleRouter = express.Router();

// Public routes
flashSaleRouter.get('/active', getActiveFlashSales);
flashSaleRouter.get('/price/:foodId', getFlashSalePrice);

// Admin routes (no auth required for admin panel in current setup)
flashSaleRouter.get('/all', getAllFlashSales);
flashSaleRouter.post('/create', createFlashSale);
flashSaleRouter.put('/update/:id', updateFlashSale);
flashSaleRouter.delete('/delete/:id', deleteFlashSale);
flashSaleRouter.patch('/toggle/:id', toggleFlashSaleStatus);

export default flashSaleRouter;
