import React from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lang) => {
        i18n.changeLanguage(lang);
        localStorage.setItem('language', lang);
    };

    return (
        <div className='language-switcher'>
            <button
                className={i18n.language === 'en' ? 'active' : ''}
                onClick={() => changeLanguage('en')}
            >
                EN
            </button>
            <button
                className={i18n.language === 'vi' ? 'active' : ''}
                onClick={() => changeLanguage('vi')}
            >
                VI
            </button>
        </div>
    );
};

export default LanguageSwitcher;
