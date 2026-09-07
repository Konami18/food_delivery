import React, { useState, useEffect, useContext } from 'react';
import './Addresses.css';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';

const Addresses = () => {
    const { url, token } = useContext(StoreContext);
    const [addresses, setAddresses] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        label: '',
        firstName: '',
        lastName: '',
        street: '',
        city: '',
        state: '',
        zipcode: '',
        country: '',
        phone: '',
        isDefault: false
    });

    useEffect(() => {
        if (token) {
            fetchAddresses();
        }
    }, [token]);

    const fetchAddresses = async () => {
        try {
            const response = await axios.post(`${url}/api/address/list`, {}, {
                headers: { token }
            });
            if (response.data.success) {
                setAddresses(response.data.data);
            }
        } catch (error) {
            console.log("Error fetching addresses:", error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            let response;
            if (editingId) {
                response = await axios.post(`${url}/api/address/update`, {
                    addressId: editingId,
                    addressData: formData
                }, { headers: { token } });
            } else {
                response = await axios.post(`${url}/api/address/add`, {
                    address: formData
                }, { headers: { token } });
            }

            if (response.data.success) {
                alert(response.data.message);
                fetchAddresses();
                resetForm();
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            console.log("Error saving address:", error);
            alert("Failed to save address");
        }
    };

    const handleEdit = (address) => {
        setFormData({
            label: address.label,
            firstName: address.firstName,
            lastName: address.lastName,
            street: address.street,
            city: address.city,
            state: address.state,
            zipcode: address.zipcode,
            country: address.country,
            phone: address.phone,
            isDefault: address.isDefault
        });
        setEditingId(address._id);
        setShowForm(true);
    };

    const handleDelete = async (addressId) => {
        if (!window.confirm("Are you sure you want to delete this address?")) {
            return;
        }

        try {
            const response = await axios.post(`${url}/api/address/delete`, {
                addressId
            }, { headers: { token } });

            if (response.data.success) {
                alert(response.data.message);
                fetchAddresses();
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            console.log("Error deleting address:", error);
            alert("Failed to delete address");
        }
    };

    const handleSetDefault = async (addressId) => {
        try {
            const response = await axios.post(`${url}/api/address/setdefault`, {
                addressId
            }, { headers: { token } });

            if (response.data.success) {
                fetchAddresses();
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            console.log("Error setting default:", error);
        }
    };

    const resetForm = () => {
        setFormData({
            label: '',
            firstName: '',
            lastName: '',
            street: '',
            city: '',
            state: '',
            zipcode: '',
            country: '',
            phone: '',
            isDefault: false
        });
        setEditingId(null);
        setShowForm(false);
    };

    return (
        <div className='addresses-page'>
            <h2>📍 My Addresses</h2>

            <button className='add-address-btn' onClick={() => setShowForm(true)}>
                + Add New Address
            </button>

            {addresses.length > 0 ? (
                <div className='addresses-list'>
                    {addresses.map((address) => (
                        <div key={address._id} className={`address-card ${address.isDefault ? 'default' : ''}`}>
                            <div className='address-label'>
                                {address.label}
                                {address.isDefault && <span className='default-badge'>DEFAULT</span>}
                            </div>
                            <div className='address-details'>
                                <p><strong>{address.firstName} {address.lastName}</strong></p>
                                <p>{address.street}</p>
                                <p>{address.city}, {address.state} {address.zipcode}</p>
                                <p>{address.country}</p>
                                <p>📞 {address.phone}</p>
                            </div>
                            <div className='address-actions'>
                                {!address.isDefault && (
                                    <button 
                                        className='set-default-btn'
                                        onClick={() => handleSetDefault(address._id)}
                                    >
                                        Set as Default
                                    </button>
                                )}
                                <button 
                                    className='edit-btn'
                                    onClick={() => handleEdit(address)}
                                >
                                    Edit
                                </button>
                                <button 
                                    className='delete-btn'
                                    onClick={() => handleDelete(address._id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className='no-addresses'>
                    <p>No addresses saved yet.</p>
                    <p>Add your first delivery address to make checkout faster!</p>
                </div>
            )}

            {showForm && (
                <div className='address-form-modal' onClick={resetForm}>
                    <div className='address-form' onClick={(e) => e.stopPropagation()}>
                        <h3>{editingId ? 'Edit Address' : 'Add New Address'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className='form-grid'>
                                <div className='form-field full-width'>
                                    <label>Label *</label>
                                    <input
                                        type='text'
                                        name='label'
                                        value={formData.label}
                                        onChange={handleInputChange}
                                        placeholder='e.g., Home, Office, Mom&apos;s House'
                                        required
                                    />
                                </div>
                                <div className='form-field'>
                                    <label>First Name *</label>
                                    <input
                                        type='text'
                                        name='firstName'
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className='form-field'>
                                    <label>Last Name *</label>
                                    <input
                                        type='text'
                                        name='lastName'
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className='form-field full-width'>
                                    <label>Street Address *</label>
                                    <input
                                        type='text'
                                        name='street'
                                        value={formData.street}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className='form-field'>
                                    <label>City *</label>
                                    <input
                                        type='text'
                                        name='city'
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                {/* <div className='form-field'>
                                    <label>State *</label>
                                    <input
                                        type='text'
                                        name='state'
                                        value={formData.state}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div> */}
                                {/* <div className='form-field'>
                                    <label>Zip Code *</label>
                                    <input
                                        type='text'
                                        name='zipcode'
                                        value={formData.zipcode}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div> */}
                                <div className='form-field'>
                                    <label>Country *</label>
                                    <input
                                        type='text'
                                        name='country'
                                        value={formData.country}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className='form-field full-width'>
                                    <label>Phone *</label>
                                    <input
                                        type='tel'
                                        name='phone'
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className='checkbox-field'>
                                <input
                                    type='checkbox'
                                    id='isDefault'
                                    name='isDefault'
                                    checked={formData.isDefault}
                                    onChange={handleInputChange}
                                />
                                <label htmlFor='isDefault'>Set as default address</label>
                            </div>
                            <div className='form-actions'>
                                <button type='submit' className='save-btn'>
                                    {editingId ? 'Update Address' : 'Save Address'}
                                </button>
                                <button type='button' className='cancel-btn' onClick={resetForm}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Addresses;
