import React, { useState, useEffect, useContext } from 'react';
import './FavoriteButton.css';
import { StoreContext } from '../../../context/StoreContext';
import axios from 'axios';

const FavoriteButton = ({ foodId }) => {
    const { url, token } = useContext(StoreContext);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (token) {
            checkFavoriteStatus();
        }
    }, [foodId, token]);

    const checkFavoriteStatus = async () => {
        try {
            const response = await axios.get(`${url}/api/favorite/check/${foodId}`, {
                headers: { token }
            });
            if (response.data.success) {
                setIsFavorite(response.data.isFavorite);
            }
        } catch (error) {
            console.log("Error checking favorite:", error);
        }
    };

    const toggleFavorite = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!token) {
            alert("Please login to add favorites");
            return;
        }

        setIsLoading(true);

        try {
            const endpoint = isFavorite ? "/api/favorite/remove" : "/api/favorite/add";
            const response = await axios.post(`${url}${endpoint}`, 
                { foodId },
                { headers: { token } }
            );

            if (response.data.success) {
                setIsFavorite(!isFavorite);
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            console.log("Error toggling favorite:", error);
            alert("Failed to update favorites");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button 
            className={`favorite-button ${isFavorite ? 'favorited' : ''}`}
            onClick={toggleFavorite}
            disabled={isLoading}
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
            <span className="favorite-icon">
                {isFavorite ? '❤️' : '🤍'}
            </span>
        </button>
    );
};

export default FavoriteButton;
