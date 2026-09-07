import React, { useState } from 'react';
import './Home.css';
import Header from '../../components/common/Header/Header';
import ExploreMenu from '../../components/features/ExploreMenu/ExploreMenu';
import FoodDisplay from '../../components/features/FoodDisplay/FoodDisplay';
import AppDownload from '../../components/common/AppDownload/AppDownload';
import SearchFilter from '../../components/common/SearchFilter/SearchFilter';
import FlashSaleBanner from '../../components/common/FlashSaleBanner/FlashSaleBanner';
import Recommendations from '../../components/features/recommendations/Recommendations/Recommendations';

const Home = () => {
  
  const [category, setCategory] = useState("All");
  const [filters, setFilters] = useState({
    searchTerm: '',
    sortBy: 'default',
    priceRange: { min: '', max: '' },
    ratingFilter: 'all'
  });

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <div>
      <Header />
      <FlashSaleBanner />
      <Recommendations type="personalized" />
      <SearchFilter onFilterChange={handleFilterChange} />
      <ExploreMenu category={category} setCategory={setCategory} />
      <FoodDisplay category={category} filters={filters} />
      <AppDownload />
    </div>
  )
}

export default Home
