import React, { useContext, useEffect, useState } from 'react'
import './PlaceOrder.css'
import { StoreContext } from '../../context/StoreContext';
import axios from "axios"
import { useNavigate } from 'react-router-dom'
import QRPayment from '../../components/common/QRPayment/QRPayment';
import { useLocation } from "react-router-dom";

const PlaceOrder = () => {

  const { getTotalCartAmount, token, food_list, cartItems, url } = useContext(StoreContext)

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [showQRPayment, setShowQRPayment] = useState(false);
  const [paymentData, setPaymentData] = useState(null);

  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: ""
  })

  useEffect(() => {
    if (token) {
      fetchSavedAddresses();
    }
  }, [token]);

  const fetchSavedAddresses = async () => {
    try {
      const response = await axios.post(`${url}/api/address/list`, {}, {
        headers: { token }
      });
      if (response.data.success) {
        setSavedAddresses(response.data.data);
        // Auto-select default address
        const defaultAddr = response.data.data.find(addr => addr.isDefault);
        if (defaultAddr && !useNewAddress) {
          setSelectedAddressId(defaultAddr._id);
          setData({
            firstName: defaultAddr.firstName,
            lastName: defaultAddr.lastName,
            email: data.email,
            street: defaultAddr.street,
            city: defaultAddr.city,
            state: defaultAddr.state,
            zipcode: defaultAddr.zipcode,
            country: defaultAddr.country,
            phone: defaultAddr.phone
          });
        }
      }
    } catch (error) {
      console.log("Error fetching addresses:", error);
    }
  };

  const handleAddressSelect = (addressId) => {
    setSelectedAddressId(addressId);
    const address = savedAddresses.find(addr => addr._id === addressId);
    if (address) {
      setData({
        firstName: address.firstName,
        lastName: address.lastName,
        email: data.email,
        street: address.street,
        city: address.city,
        state: address.state,
        zipcode: address.zipcode,
        country: address.country,
        phone: address.phone
      });
    }
  };

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData(data => ({ ...data, [name]: value }))
  }

  const placeOrder = async (event) => {
    event.preventDefault();
    let orderItems = [];
    food_list.map((item) => {
      if (cartItems[item._id] > 0) {
        let itemInfo = item;
        itemInfo["quantity"] = cartItems[item._id];
        orderItems.push(itemInfo);
      }
    })
    let orderData = {
      address: data,
      items: orderItems,
      amount: getTotalCartAmount() + 10, // Phí ship 10,000 VND
    }
    let response = await axios.post(url + "/api/order/place", orderData, { headers: { token } });
    if (response.data.success) {
      // Lấy paymentInfo từ backend
      let paymentInfo = response.data.paymentInfo;

      // Áp dụng giảm giá
      paymentInfo.amount = paymentInfo.amount - discount; // discount là số tiền giảm

      // Set paymentData với amount đã giảm
      setPaymentData({
        qrCode: response.data.qrCode,
        paymentInfo: paymentInfo,
        orderId: response.data.orderId
      });
      setShowQRPayment(true);
    }
    else {
      alert("Error");
    }
  }

  const navigate = useNavigate();
  const location = useLocation();
  const discount = location.state?.discount || 0;
  const subtotal = location.state?.subtotal || getTotalCartAmount();
  const delivery = subtotal === 0 ? 0 : 10;

  // Tổng tiền cuối cùng
  const finalTotal = subtotal + delivery - discount;
  useEffect(() => {
    if (!token) {
      navigate('/cart')
    }
    else if (getTotalCartAmount() === 0) {
      navigate('/cart')
    }
  }, [token])
  return (
    <form onSubmit={placeOrder} className='place-order' >
      <div className="place-order-left">
        <p className='title'>Delivery Information</p>

        {savedAddresses.length > 0 && !useNewAddress && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500' }}>
              Select Saved Address:
            </label>
            <select
              value={selectedAddressId}
              onChange={(e) => handleAddressSelect(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #c5c5c5',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              <option value="">Choose an address...</option>
              {savedAddresses.map(addr => (
                <option key={addr._id} value={addr._id}>
                  {addr.label} - {addr.street}, {addr.city}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                setUseNewAddress(true);
                setSelectedAddressId('');
                setData({
                  firstName: "",
                  lastName: "",
                  email: data.email,
                  street: "",
                  city: "",
                  state: "",
                  zipcode: "",
                  country: "",
                  phone: ""
                });
              }}
              style={{
                marginTop: '10px',
                background: '#f0f0f0',
                border: 'none',
                padding: '8px 15px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              + Use New Address
            </button>
          </div>
        )}

        {(useNewAddress || savedAddresses.length === 0) && (
          <>
            {savedAddresses.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setUseNewAddress(false);
                  const defaultAddr = savedAddresses.find(addr => addr.isDefault);
                  if (defaultAddr) {
                    handleAddressSelect(defaultAddr._id);
                  }
                }}
                style={{
                  marginBottom: '15px',
                  background: '#f0f0f0',
                  border: 'none',
                  padding: '8px 15px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                ← Use Saved Address
              </button>
            )}
          </>
        )}

        <div className="multi-fields">
          <input required name='firstName' onChange={onChangeHandler} value={data.firstName} type="text" placeholder='First name' />
          <input required name='lastName' onChange={onChangeHandler} value={data.lastName} type="text" placeholder='Last name' />
        </div>
        <input required name='email' onChange={onChangeHandler} value={data.email} type="text" placeholder='Email address' />
        <input required name='street' onChange={onChangeHandler} value={data.street} type="text" placeholder='Street' />
        <div className="multi-fields">
          <input required name='city' onChange={onChangeHandler} value={data.city} type="text" placeholder='City' />
          {/* <input required name='state' onChange={onChangeHandler} value={data.state} type="text" placeholder='State' /> */}
        </div>
        <div className="multi-fields">
          {/* <input required name='zipcode' onChange={onChangeHandler} value={data.zipcode} type="text" placeholder='Zip code' /> */}
          {/* <input required name='country' onChange={onChangeHandler} value={data.country} type="text" placeholder='Country' /> */}
        </div>
        <input required name='phone' onChange={onChangeHandler} value={data.phone} type="text" placeholder='Phone' />
      </div>
      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>{subtotal.toLocaleString('vi-VN')}₫</p>
            </div>

            <hr />

            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>{delivery.toLocaleString('vi-VN')}₫</p>
            </div>

            <hr />

            <div className="cart-total-details">
              <p>Discount</p>
              <p>-{discount.toLocaleString('vi-VN')}₫</p>
            </div>

            <hr />

            <div className="cart-total-details">
              <b>Total</b>
              <b>{finalTotal.toLocaleString('vi-VN')}₫</b>
            </div>

          </div>
          <button type='submit'>PROCESS TO PAYMENT</button>
        </div>
      </div>
      {showQRPayment && paymentData && (
        <QRPayment
          qrCode={paymentData.qrCode}
          paymentInfo={paymentData.paymentInfo}
          orderId={paymentData.orderId}
          url={url}
          token={token}
        />
      )}
    </form>
  )
}

export default PlaceOrder
