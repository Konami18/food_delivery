import React from 'react'
import './Sidebar.css'
import { assets } from '../../../assets/assets'
import { NavLink } from 'react-router-dom'

const Sidebar = () => {
  return (
    <div className='sidebar'>
      <div className="sidebar-options">
        <NavLink to='/' className="sidebar-option">
          <img src={assets.order_icon} alt="" />
          <p>Dashboard</p>
        </NavLink>
        <NavLink to='/add' className="sidebar-option">
          <img src={assets.add_icon} alt="" />
          <p>Add Item</p>
        </NavLink>
        <NavLink to='/list' className="sidebar-option">
          <img src={assets.order_icon} alt="" />
          <p>List Item</p>
        </NavLink>
        <NavLink to='/orders' className="sidebar-option">
          <img src={assets.order_icon} alt="" />
          <p>Orders</p>
        </NavLink>
        <NavLink to='/promo' className="sidebar-option">
          <img src={assets.add_icon} alt="" />
          <p>Promo Codes</p>
        </NavLink>
        <NavLink to='/flashsale' className="sidebar-option">
          <img src={assets.order_icon} alt="" />
          <p>Flash Sales</p>
        </NavLink>
        <NavLink to='/reviews' className="sidebar-option">
          <img src={assets.order_icon} alt="" />
          <p>Reviews</p>
        </NavLink>
        <NavLink to='/analytics' className="sidebar-option">
          <img src={assets.order_icon} alt="" />
          <p>Analytics</p>
        </NavLink>
      </div>
      
    </div>
  )
}

export default Sidebar
