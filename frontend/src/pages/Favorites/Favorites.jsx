import React, { useState, useEffect, useContext } from 'react';
import './Favorites.css';
import { StoreContext } from '../../context/StoreContext';
import FoodItem from '../../components/features/FoodItem/FoodItem';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Favorites = ({ setShowLogin }) => {
    const { url, token } = useContext(StoreContext);
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (token) {
            fetchFavorites();
        } else {
            setLoading(false);
        }
    }, [token]);

    const fetchFavorites = async () => {
        try {
            const response = await axios.post(`${url}/api/favorite/list`, {}, {
                headers: { token }
            });

            if (response.data.success) {
                setFavorites(response.data.data);
            }
        } catch (error) {
            console.log("Error fetching favorites:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className='favorites'>
                <h2>My Favorites</h2>
                <p style={{ textAlign: 'center', padding: '40px' }}>Loading...</p>
            </div>
        );
    }

    if (!token) {
        return (
            <div className='favorites'>
                <div className='login-prompt-favorites'>
                    <div style={{ fontSize: '60px', marginBottom: '20px' }}>❤️</div>
                    <h3>Login to see your favorites</h3>
                    <p>Save your favorite dishes and order them anytime!</p>
                    <button onClick={() => setShowLogin(true)}>Login Now</button>
                </div>
            </div>
        );
    }

    return (
        <div className='favorites'>
            <h2>❤️ My Favorite Dishes</h2>

            {favorites.length > 0 ? (
                <>
                    <p className='favorites-count'>
                        You have <strong>{favorites.length}</strong> favorite dish{favorites.length !== 1 ? 'es' : ''}
                    </p>
                    <div className='favorites-grid'>
                        {favorites.map((item, index) => (
                            <FoodItem
                                key={index}
                                id={item._id}
                                name={item.name}
                                price={item.price}
                                description={item.description}
                                image={item.image}
                            />
                        ))}
                    </div>
                </>
            ) : (
                <div className='empty-favorites'>
                    <div className='empty-favorites-icon'>💔</div>
                    <h3>No favorites yet</h3>
                    <p>Start adding your favorite dishes to find them easily later!</p>
                    <button className='browse-menu-btn' onClick={() => navigate('/')}>
                        Browse Menu
                    </button>
                </div>
            )}
        </div>
    );
};

export default Favorites;
