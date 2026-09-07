import React, { useContext, useState, useEffect } from 'react'
import './Navbar.css'
import { assets } from '../../../assets/assets'
import { Link, useNavigate } from 'react-router-dom';
import { StoreContext } from '../../../context/StoreContext';
import axios from 'axios';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

const Navbar = ({setShowLogin}) => {
    const [menu,setMenu] = useState("home");
    const [userPoints, setUserPoints] = useState(0);
    const { t } = useTranslation();

    const {getTotalCartAmount,token,setToken,url} = useContext(StoreContext);

    const navigate = useNavigate();

    const logout = ()=>{
      localStorage.removeItem("token");
      setToken("");
      navigate("/")
    }

    // Fetch user points
    useEffect(() => {
        const fetchUserPoints = async () => {
            if (token) {
                try {
                    const response = await axios.get(`${url}/api/loyalty/points`, {
                        headers: { token }
                    });
                    if (response.data.success) {
                        setUserPoints(response.data.points);
                    }
                } catch (error) {
                    console.error("Error fetching points:", error);
                }
            }
        };
        fetchUserPoints();
    }, [token, url]);

  return (
    <div className='navbar'>
       <Link to='/'> <img src={assets.logo} alt = "" className='logo'/></Link>
        <ul className="navbar-menu">
            <Link to='/' onClick={()=>setMenu("home")} className={menu==="home"?"active":""}>{t('nav.home')}</Link>
            <a href='#explore-menu' onClick={()=>setMenu("menu")} className={menu==="menu"?"active":""}>{t('nav.menu')}</a>
            <a href='#app-download' onClick={()=>setMenu("mobile-app")} className={menu==="mobile-app"?"active":""}>{t('nav.mobile_app')}</a>
            <a href='#footer' onClick={()=>setMenu("contact-us")} className={menu==="contact-us"?"active":""}>{t('nav.contact')}</a>
        </ul>
        <div className="navbar-right">
            <LanguageSwitcher />
            <img src={assets.search_icon} alt="" />
            <div className="navbar-search-icon">
                <Link to='/cart'><img src={assets.basket_icon} alt="" /></Link>
                <div className={getTotalCartAmount()===0?"":"dot"}></div>
            </div>
            {token && (
                <>
                    <Link to='/favorites' style={{fontSize: '24px', marginLeft: '15px', cursor: 'pointer'}}>
                        ❤️
                    </Link>
                    <Link to='/rewards' style={{fontSize: '16px', marginLeft: '15px', cursor: 'pointer', fontWeight: 'bold', color: '#764ba2'}}>
                        🎁 {userPoints}
                    </Link>
                </>
            )}
            {!token?<button onClick={() => setShowLogin(true)}>{t('nav.sign_in')}</button>
            : <div className='navbar-profile'>
              <img src={assets.profile_icon} alt="" />
              <ul className="nav-profile-dropdown">
                <li onClick={()=>navigate('/myorders')}><img src={assets.bag_icon} alt="" /><p>{t('nav.orders')}</p></li>
                <hr />
                <li onClick={()=>navigate('/favorites')}><span style={{fontSize: '18px'}}>❤️</span><p>{t('nav.favorites')}</p></li>
                <hr />
                <li onClick={()=>navigate('/addresses')}><span style={{fontSize: '18px'}}>📍</span><p>{t('nav.addresses')}</p></li>
                <hr />
                <li onClick={()=>navigate('/rewards')}><span style={{fontSize: '18px'}}>🎁</span><p>{t('nav.rewards')} ({userPoints} pts)</p></li>
                <hr />
                <li onClick={logout}><img src={assets.logout_icon} alt="" /><p>{t('nav.logout')}</p></li>
              </ul>

              </div> }
        </div>  
    </div>
  )
}

export default Navbar
