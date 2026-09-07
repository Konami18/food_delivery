import React from 'react'
import './Footer.css'
import { assets } from '../../../assets/assets'

const Footer = () => {
  return (
    <div className='footer' id='footer'>
      <div className="footer-content">
        <div className="footer-content-left">
          <img src={assets.logo} alt="Logo" />
          <p>We bring you delicious, fresh meals prepared with a love for food. Order easily – fast delivery – enjoy the flavors today!</p>
          <div className="footer-social-icons">
            <img src={assets.facebook_icon} alt="Facebook" />
            <img src={assets.twitter_icon} alt="Twitter" />
            <img src={assets.linkedin_icon} alt="LinkedIn" />
          </div>
        </div>
        <div className="footer-content-center">
          {/* nội dung phần giữa */}
          <h2>COMPANY</h2>
          <ul>
            <li>Home</li>
            <li>About Us</li>
            <li>Delivery</li>
            <li>Privacy Policy</li>
          </ul>
        </div>
        <div className="footer-content-right">
          {/* nội dung phần phải */}
          <h2>GET IN TOUCH</h2>
          <ul>
            <li>0945 - 648 - JQk</li>
            <li>contact@konami.components</li>
          </ul>
        </div>
      </div>
      <hr />
      <p className="footer-copyright">
        Copyright 2024 © Konami.com - All Rights Reserved.
      </p>
    </div>
  )
}

export default Footer
