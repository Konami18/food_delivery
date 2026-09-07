import React from 'react'
import Navbar from './components/layout/Navbar/Navbar'
import Sidebar from './components/layout/Sidebar/Sidebar'
import { Route, Routes } from "react-router-dom"
import Add from './pages/Add/Add'
import List from './pages/List/List'
import Orders from './pages/Orders/Orders'
import Promo from './pages/Promo/Promo'
import Dashboard from './pages/Dashboard/Dashboard'
import FlashSale from './pages/FlashSale/FlashSale'
import Reviews from './pages/Reviews/Reviews'
import Analytics from './pages/Analytics/Analytics'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";



const App = () => {
  
  const url = "http://localhost:4000"

  return (
    <div>
      <Navbar/>
      <hr />
      <div className="app-content">
        <Sidebar/>
        <Routes>
          <Route path="/" element={<Dashboard url={url}/>} />
          <Route path="/add" element={<Add url={url}/>} />
          <Route path="/list" element={<List url={url}/>} />
          <Route path="/orders" element={<Orders url={url}/>} />
          <Route path="/promo" element={<Promo url={url}/>} />
          <Route path="/flashsale" element={<FlashSale url={url}/>} />
          <Route path="/reviews" element={<Reviews url={url}/>} />
          <Route path="/analytics" element={<Analytics url={url}/>} />
        </Routes>
      </div>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </div>
  )
}

export default App
