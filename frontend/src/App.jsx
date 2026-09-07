import React, { useState } from 'react';
import Navbar from './components/layout/Navbar/Navbar'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home/Home'
import Cart from './pages/Cart/Cart'
import PlaceOrder from './pages/PlaceOrder/PlaceOrder'
import Footer from './components/layout/Footer/Footer'
import LoginPopup from './components/common/LoginPopup/LoginPopup';
import Verify from './pages/Verify/Verify';
import MyOrders from './pages/MyOrders/MyOrders';
import FoodDetail from './pages/FoodDetail/FoodDetail';
import Favorites from './pages/Favorites/Favorites';
import Addresses from './pages/Addresses/Addresses';
import Rewards from './pages/Rewards/Rewards';
import OrderTracking from './pages/OrderTracking/OrderTracking';
import FlashSaleBanner from './components/common/FlashSaleBanner/FlashSaleBanner';

const App = () => {

  const [showLogin, setShowLogin] = useState(false)
  return (
    <>
      {showLogin ? <LoginPopup setShowLogin={setShowLogin} /> : <></>}
      <div className='app'>
        <Navbar setShowLogin={setShowLogin} />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/cart' element={<Cart />} />
          <Route path='/order' element={<PlaceOrder />} />
          <Route path='/verify' element={<Verify />} />
          <Route path='/myorders' element={<MyOrders/>} />
          <Route path='/favorites' element={<Favorites setShowLogin={setShowLogin}/>} />
          <Route path='/addresses' element={<Addresses/>} />
          <Route path='/rewards' element={<Rewards/>} />
          <Route path='/order-tracking/:orderId' element={<OrderTracking/>} />
          <Route path='/food/:id' element={<FoodDetail setShowLogin={setShowLogin}/>} />
          <Route path='/flash-sale' element={<FlashSaleBanner/>} />
        </Routes>

      </div>
      <Footer />
    </>
  )
}

export default App
