import React, { useContext, useState, useEffect } from 'react'
import './FoodDisplay.css'
import { StoreContext } from '../../../context/StoreContext';
import FoodItem from '../FoodItem/FoodItem';

const FoodDisplay = ({category, filters}) => {

    const {food_list} = useContext(StoreContext);
    const [filteredFoods, setFilteredFoods] = useState([]);

    useEffect(() => {
        let result = [...food_list];

        // Filter by category
        if (category !== "All") {
            result = result.filter(item => item.category === category);
        }

        // Filter by search term
        if (filters.searchTerm) {
            result = result.filter(item => 
                item.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                item.description.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                item.category.toLowerCase().includes(filters.searchTerm.toLowerCase())
            );
        }

        // Filter by price range
        if (filters.priceRange.min !== '') {
            result = result.filter(item => item.price >= Number(filters.priceRange.min));
        }
        if (filters.priceRange.max !== '') {
            result = result.filter(item => item.price <= Number(filters.priceRange.max));
        }

        // Filter by rating
        if (filters.ratingFilter !== 'all') {
            result = result.filter(item => 
                item.averageRating >= Number(filters.ratingFilter)
            );
        }

        // Sort
        switch (filters.sortBy) {
            case 'price-low':
                result.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                result.sort((a, b) => b.price - a.price);
                break;
            case 'name-asc':
                result.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                result.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'rating':
                result.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
                break;
            default:
                break;
        }

        setFilteredFoods(result);
    }, [food_list, category, filters]);
    
  return (
    <div className='food-display' id='food-display'>
        <h2>Top dishes near you</h2>
        {filteredFoods.length > 0 ? (
            <>
                <p style={{textAlign: 'center', color: '#666', marginBottom: '20px'}}>
                    Found {filteredFoods.length} dish{filteredFoods.length !== 1 ? 'es' : ''}
                </p>
                <div className="food-display-list">
                    {filteredFoods.map((item, index) => (
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
            <div style={{textAlign: 'center', padding: '40px', color: '#999'}}>
                <p style={{fontSize: '18px'}}>No dishes found matching your criteria.</p>
                <p>Try adjusting your filters.</p>
            </div>
        )}
    </div>
  )
}

export default FoodDisplay
