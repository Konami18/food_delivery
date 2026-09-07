import React, { useState, useEffect } from 'react';
import './Promo.css';
import axios from 'axios';
import { toast } from 'react-toastify';

const Promo = ({ url }) => {
    const [promos, setPromos] = useState([]);
    const [formData, setFormData] = useState({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        minOrderAmount: '',
        maxDiscount: '',
        usageLimit: '',
        validFrom: '',
        validUntil: '',
        description: ''
    });

    const fetchPromos = async () => {
        try {
            const response = await axios.get(`${url}/api/promo/list`);
            if (response.data.success) {
                setPromos(response.data.data);
            }
        } catch (error) {
            console.log("Error fetching promos:", error);
        }
    };

    useEffect(() => {
        fetchPromos();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const response = await axios.post(`${url}/api/promo/add`, formData);
            
            if (response.data.success) {
                toast.success("Promo code created successfully!");
                setFormData({
                    code: '',
                    discountType: 'percentage',
                    discountValue: '',
                    minOrderAmount: '',
                    maxDiscount: '',
                    usageLimit: '',
                    validFrom: '',
                    validUntil: '',
                    description: ''
                });
                fetchPromos();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log("Error creating promo:", error);
            toast.error("Failed to create promo code");
        }
    };

    const deletePromo = async (id) => {
        if (window.confirm("Are you sure you want to delete this promo code?")) {
            try {
                const response = await axios.post(`${url}/api/promo/delete`, { id });
                if (response.data.success) {
                    toast.success("Promo code deleted successfully!");
                    fetchPromos();
                }
            } catch (error) {
                console.log("Error deleting promo:", error);
                toast.error("Failed to delete promo code");
            }
        }
    };

    const getPromoStatus = (promo) => {
        const now = new Date();
        if (!promo.isActive) return 'inactive';
        if (now > new Date(promo.validUntil)) return 'expired';
        return 'active';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className='promo add flex-col'>
            <h3>Manage Promo Codes</h3>

            <div className='add-promo-form'>
                <h4>Create New Promo Code</h4>
                <form onSubmit={handleSubmit}>
                    <div className='promo-form-grid'>
                        <div className='promo-form-field'>
                            <label>Code *</label>
                            <input
                                type="text"
                                name="code"
                                value={formData.code}
                                onChange={handleInputChange}
                                placeholder="SAVE20"
                                required
                            />
                        </div>

                        <div className='promo-form-field'>
                            <label>Discount Type *</label>
                            <select
                                name="discountType"
                                value={formData.discountType}
                                onChange={handleInputChange}
                            >
                                <option value="percentage">Percentage (%)</option>
                                <option value="fixed">Fixed Amount ($)</option>
                            </select>
                        </div>

                        <div className='promo-form-field'>
                            <label>Discount Value *</label>
                            <input
                                type="number"
                                name="discountValue"
                                value={formData.discountValue}
                                onChange={handleInputChange}
                                placeholder={formData.discountType === 'percentage' ? '20' : '10'}
                                required
                            />
                        </div>

                        <div className='promo-form-field'>
                            <label>Min Order Amount ($)</label>
                            <input
                                type="number"
                                name="minOrderAmount"
                                value={formData.minOrderAmount}
                                onChange={handleInputChange}
                                placeholder="0"
                            />
                        </div>

                        {formData.discountType === 'percentage' && (
                            <div className='promo-form-field'>
                                <label>Max Discount ($)</label>
                                <input
                                    type="number"
                                    name="maxDiscount"
                                    value={formData.maxDiscount}
                                    onChange={handleInputChange}
                                    placeholder="Optional"
                                />
                            </div>
                        )}

                        <div className='promo-form-field'>
                            <label>Usage Limit</label>
                            <input
                                type="number"
                                name="usageLimit"
                                value={formData.usageLimit}
                                onChange={handleInputChange}
                                placeholder="Unlimited"
                            />
                        </div>

                        <div className='promo-form-field'>
                            <label>Valid From *</label>
                            <input
                                type="datetime-local"
                                name="validFrom"
                                value={formData.validFrom}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className='promo-form-field'>
                            <label>Valid Until *</label>
                            <input
                                type="datetime-local"
                                name="validUntil"
                                value={formData.validUntil}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className='promo-form-field full-width'>
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Get 20% off on all orders above $50"
                            />
                        </div>
                    </div>

                    <button type='submit' className='promo-submit-btn'>
                        Create Promo Code
                    </button>
                </form>
            </div>

            <div className='promo-list'>
                <div className='promo-list-header'>
                    <div>Code</div>
                    <div>Discount</div>
                    <div>Min Order</div>
                    <div>Valid Until</div>
                    <div>Usage</div>
                    <div>Status</div>
                    <div>Action</div>
                </div>

                {promos.map((promo) => {
                    const status = getPromoStatus(promo);
                    return (
                        <div key={promo._id} className='promo-list-item'>
                            <div>
                                <span className='promo-code'>{promo.code}</span>
                            </div>
                            <div>
                                {promo.discountType === 'percentage' 
                                    ? `${promo.discountValue}%` 
                                    : `$${promo.discountValue}`}
                            </div>
                            <div>{promo.minOrderAmount.toLocaleString('vi-VN')}$</div>
                            <div>{formatDate(promo.validUntil)}</div>
                            <div className='promo-used-count'>
                                {promo.usedCount} / {promo.usageLimit || '∞'}
                            </div>
                            <div>
                                <span className={`promo-status ${status}`}>
                                    {status.toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <button 
                                    className='promo-delete-btn'
                                    onClick={() => deletePromo(promo._id)}
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

export default Promo;
