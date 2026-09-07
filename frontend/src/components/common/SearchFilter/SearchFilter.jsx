import React, { useState } from 'react';
import './SearchFilter.css';

const SearchFilter = ({ onFilterChange }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('default');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [ratingFilter, setRatingFilter] = useState('all');

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        applyFilters({ searchTerm: value, sortBy, priceRange, ratingFilter });
    };

    const handleSortChange = (e) => {
        const value = e.target.value;
        setSortBy(value);
        applyFilters({ searchTerm, sortBy: value, priceRange, ratingFilter });
    };

    const handlePriceChange = (type, value) => {
        const newPriceRange = { ...priceRange, [type]: value };
        setPriceRange(newPriceRange);
        applyFilters({ searchTerm, sortBy, priceRange: newPriceRange, ratingFilter });
    };

    const handleRatingChange = (e) => {
        const value = e.target.value;
        setRatingFilter(value);
        applyFilters({ searchTerm, sortBy, priceRange, ratingFilter: value });
    };

    const applyFilters = (filters) => {
        onFilterChange(filters);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSortBy('default');
        setPriceRange({ min: '', max: '' });
        setRatingFilter('all');
        onFilterChange({ 
            searchTerm: '', 
            sortBy: 'default', 
            priceRange: { min: '', max: '' },
            ratingFilter: 'all'
        });
    };

    return (
        <div className='search-filter'>
            <div className='search-bar'>
                <input
                    type='text'
                    placeholder='Search for dishes, cuisines, restaurants...'
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
                <span className='search-icon'>🔍</span>
            </div>

            <div className='filter-options'>
                <div className='filter-group'>
                    <label>Sort By:</label>
                    <select value={sortBy} onChange={handleSortChange}>
                        <option value='default'>Default</option>
                        <option value='price-low'>Price: Low to High</option>
                        <option value='price-high'>Price: High to Low</option>
                        <option value='name-asc'>Name: A to Z</option>
                        <option value='name-desc'>Name: Z to A</option>
                        <option value='rating'>Rating</option>
                    </select>
                </div>

                <div className='filter-group'>
                    <label>Price Range:</label>
                    <div className='price-range-inputs'>
                        <input
                            type='number'
                            placeholder='Min'
                            value={priceRange.min}
                            onChange={(e) => handlePriceChange('min', e.target.value)}
                        />
                        <span>-</span>
                        <input
                            type='number'
                            placeholder='Max'
                            value={priceRange.max}
                            onChange={(e) => handlePriceChange('max', e.target.value)}
                        />
                    </div>
                </div>

                <div className='filter-group'>
                    <label>Rating:</label>
                    <select value={ratingFilter} onChange={handleRatingChange}>
                        <option value='all'>All Ratings</option>
                        <option value='4'>4★ & above</option>
                        <option value='3'>3★ & above</option>
                        <option value='2'>2★ & above</option>
                    </select>
                </div>

                <button className='clear-filters-btn' onClick={clearFilters}>
                    Clear Filters
                </button>
            </div>
        </div>
    );
};

export default SearchFilter;
