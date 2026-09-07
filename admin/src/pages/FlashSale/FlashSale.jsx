import React, { useState, useEffect } from 'react';
import './FlashSale.css';
import axios from 'axios';
import { toast } from 'react-toastify';

const FlashSale = ({ url }) => {
    const [flashSales, setFlashSales] = useState([]);
    const [foodList, setFoodList] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        discountPercent: '',
        startTime: '',
        endTime: '',
        foodItems: [],
        priority: 0
    });

    // Fetch all flash sales
    const fetchFlashSales = async () => {
        try {
            const response = await axios.get(`${url}/api/flashsale/all`);
            if (response.data.success) {
                setFlashSales(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching flash sales:", error);
            toast.error("Failed to fetch flash sales");
        }
    };

    // Fetch all food items
    const fetchFoodList = async () => {
        try {
            const response = await axios.get(`${url}/api/food/list`);
            if (response.data.success) {
                setFoodList(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching food list:", error);
        }
    };

    useEffect(() => {
        fetchFlashSales();
        fetchFoodList();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFoodItemToggle = (foodId) => {
        setFormData(prev => ({
            ...prev,
            foodItems: prev.foodItems.includes(foodId)
                ? prev.foodItems.filter(id => id !== foodId)
                : [...prev.foodItems, foodId]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title || !formData.discountPercent || !formData.startTime || !formData.endTime) {
            toast.error("Please fill in all required fields");
            return;
        }

        try {
            const response = await axios.post(
                `${url}/api/flashsale/create`,
                formData
            );

            if (response.data.success) {
                toast.success("Flash sale created successfully!");
                setFormData({
                    title: '',
                    description: '',
                    discountPercent: '',
                    startTime: '',
                    endTime: '',
                    foodItems: [],
                    priority: 0
                });
                fetchFlashSales();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error("Error creating flash sale:", error);
            toast.error("Failed to create flash sale");
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            const response = await axios.patch(
                `${url}/api/flashsale/toggle/${id}`,
                {}
            );

            if (response.data.success) {
                toast.success(response.data.message);
                fetchFlashSales();
            }
        } catch (error) {
            console.error("Error toggling status:", error);
            toast.error("Failed to toggle status");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this flash sale?")) return;

        try {
            const response = await axios.delete(
                `${url}/api/flashsale/delete/${id}`
            );

            if (response.data.success) {
                toast.success("Flash sale deleted successfully!");
                fetchFlashSales();
            }
        } catch (error) {
            console.error("Error deleting flash sale:", error);
            toast.error("Failed to delete flash sale");
        }
    };

    const getFlashSaleStatus = (sale) => {
        const now = new Date();
        const start = new Date(sale.startTime);
        const end = new Date(sale.endTime);

        if (!sale.isActive) return 'inactive';
        if (now < start) return 'upcoming';
        if (now > end) return 'expired';
        return 'active';
    };

    return (
        <div className='flash-sale-admin'>
            <h2>⚡ Flash Sale Management</h2>

            {/* Create Flash Sale Form */}
            <div className='create-flash-sale-form'>
                <h3>Create New Flash Sale</h3>
                <form onSubmit={handleSubmit}>
                    <div className='form-grid'>
                        <div className='form-group'>
                            <label>Title *</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="e.g., Weekend Special"
                                required
                            />
                        </div>

                        <div className='form-group'>
                            <label>Discount Percent * (1-100)</label>
                            <input
                                type="number"
                                name="discountPercent"
                                value={formData.discountPercent}
                                onChange={handleInputChange}
                                min="1"
                                max="100"
                                placeholder="e.g., 30"
                                required
                            />
                        </div>

                        <div className='form-group'>
                            <label>Start Time *</label>
                            <input
                                type="datetime-local"
                                name="startTime"
                                value={formData.startTime}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className='form-group'>
                            <label>End Time *</label>
                            <input
                                type="datetime-local"
                                name="endTime"
                                value={formData.endTime}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className='form-group'>
                            <label>Priority (0-10)</label>
                            <input
                                type="number"
                                name="priority"
                                value={formData.priority}
                                onChange={handleInputChange}
                                min="0"
                                max="10"
                                placeholder="0"
                            />
                        </div>

                        <div className='form-group full-width'>
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Optional description for the flash sale"
                            />
                        </div>

                        <div className='form-group full-width'>
                            <label>Select Food Items (Optional - leave empty for all items)</label>
                            <div className='food-items-selector'>
                                {foodList.map((food) => (
                                    <div
                                        key={food._id}
                                        className={`food-item-checkbox ${formData.foodItems.includes(food._id) ? 'selected' : ''}`}
                                        onClick={() => handleFoodItemToggle(food._id)}
                                    >
                                        <img src={`${url}/images/${food.image}`} alt={food.name} />
                                        <span>{food.name}</span>
                                        <input
                                            type="checkbox"
                                            checked={formData.foodItems.includes(food._id)}
                                            onChange={() => {}}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button type="submit" className='submit-btn'>
                        Create Flash Sale
                    </button>
                </form>
            </div>

            {/* Flash Sales List */}
            <div className='flash-sales-list'>
                <h3>All Flash Sales ({flashSales.length})</h3>
                {flashSales.map((sale) => {
                    const status = getFlashSaleStatus(sale);
                    return (
                        <div key={sale._id} className='flash-sale-card'>
                            <div className='flash-sale-card-header'>
                                <div className='flash-sale-info'>
                                    <h3>{sale.title}</h3>
                                    <p>{sale.description}</p>
                                    <p><strong>Discount:</strong> {sale.discountPercent}%</p>
                                    <p><strong>Start:</strong> {new Date(sale.startTime).toLocaleString()}</p>
                                    <p><strong>End:</strong> {new Date(sale.endTime).toLocaleString()}</p>
                                    <p><strong>Priority:</strong> {sale.priority}</p>
                                    <p><strong>Items:</strong> {sale.foodItems.length > 0 ? `${sale.foodItems.length} selected items` : 'All items'}</p>
                                </div>
                                <span className={`flash-sale-status ${status}`}>
                                    {status.toUpperCase()}
                                </span>
                            </div>

                            {sale.foodItems.length > 0 && (
                                <div className='flash-sale-items-preview'>
                                    {sale.foodItems.slice(0, 10).map((item) => (
                                        <img
                                            key={item._id}
                                            src={`${url}/images/${item.image}`}
                                            alt={item.name}
                                            className='item-preview'
                                            title={item.name}
                                        />
                                    ))}
                                    {sale.foodItems.length > 10 && (
                                        <span style={{ alignSelf: 'center', color: '#666' }}>
                                            +{sale.foodItems.length - 10} more
                                        </span>
                                    )}
                                </div>
                            )}

                            <div className='flash-sale-actions'>
                                <button
                                    className='action-btn toggle-btn'
                                    onClick={() => handleToggleStatus(sale._id)}
                                >
                                    {sale.isActive ? 'Deactivate' : 'Activate'}
                                </button>
                                <button
                                    className='action-btn delete-btn'
                                    onClick={() => handleDelete(sale._id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default FlashSale;
