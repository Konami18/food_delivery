import React, { useContext, useState } from 'react'
import './Cart.css'
import { StoreContext } from '../../context/StoreContext'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


const Cart = () => {


  const { cartItems, food_list, removeFromCart, getTotalCartAmount, url, token } = useContext(StoreContext);
  const nagivate = useNavigate();
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoMessage, setPromoMessage] = useState('');

  const applyPromoCode = async () => {
    if (!token) {
      alert("Please login to apply promo code");
      return;
    }

    if (!promoCode) {
      alert("Please enter a promo code");
      return;
    }

    try {
      const response = await axios.post(
        `${url}/api/promo/validate`,
        {
          code: promoCode,
          orderAmount: getTotalCartAmount()
        },
        { headers: { token } }
      );

      if (response.data.success) {
        setDiscount(response.data.discount);
        setPromoApplied(true);
        setPromoMessage(`✓ ${response.data.message} - Saved $${response.data.discount.toFixed(2)}`);
      } else {
        setDiscount(0);
        setPromoApplied(false);
        setPromoMessage(`✗ ${response.data.message}`);
      }
    } catch (error) {
      console.log("Error applying promo:", error);
      alert("Failed to apply promo code");
    }
  };

  const getFinalTotal = () => {
    if (getTotalCartAmount() === 0) return 0;
    return getTotalCartAmount() + 10 - discount;
  };

  return (
    <div className='cart'>
      <div className="cart-items">
        <div className="cart-items-title">
          <p>Items</p>
          <p>Title</p>
          <p>Price</p>
          <p>Quantity</p>
          <p>Total</p>
          <p>Remove</p>
        </div>
        <br />
        <hr />
        {food_list.map((item, index) => {
          if (cartItems[item._id] > 0) {
            return (
              <div>
                <div className='cart-items-title cart-items-item'>
                  <img src={url + "/images/" + item.image} alt="" />
                  <p>{item.name}</p>
                  <p>{item.price.toLocaleString('vi-VN')}$</p>
                  <p>{cartItems[item._id]}</p>
                  <p>{(item.price * cartItems[item._id]).toLocaleString('vi-VN')}$</p>
                  <p onClick={() => removeFromCart(item._id)} className='cross'>x</p>
                </div>
                <hr />
              </div>

            )
          }
        })}
      </div>
      <div className="cart-bottom">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>{getTotalCartAmount().toLocaleString('vi-VN')}$</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>{getTotalCartAmount() === 0 ? 0 : (10).toLocaleString('vi-VN')}$</p>
            </div>
            <hr />
            {discount > 0 && (
              <>
                <div className="cart-total-details" style={{ color: 'green' }}>
                  <p>Discount</p>
                  <p>-{discount.toLocaleString('vi-VN')}$</p>
                </div>
                <hr />
              </>
            )}
            <div className="cart-total-details">
              <b>Total</b>
              <b>{getFinalTotal().toLocaleString('vi-VN')}$</b>
            </div>
          </div>
          <button
            onClick={() => nagivate('/order', {
              state: {
                discount: discount,
                subtotal: getTotalCartAmount(),
                delivery: 10
              }
            })}
          >
            PROCESS TO CHECKOUT
          </button>
        </div>
        <div className="cart-promocode">
          <div>
            <p>If you have a promo code, Enter it here</p>
            {promoMessage && (
              <p style={{
                color: promoApplied ? 'green' : 'red',
                fontSize: '14px',
                marginBottom: '10px'
              }}>
                {promoMessage}
              </p>
            )}
            <div className='cart-promocode-input'>
              <input
                type="text"
                placeholder='Promo code'
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                disabled={promoApplied}
              />
              <button onClick={applyPromoCode} disabled={promoApplied}>
                {promoApplied ? 'Applied' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
