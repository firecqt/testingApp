import React from 'react';
import './Header.css';
import menuImage from './images/menu.jpeg'; 
import profileImage from './images/profile.jpeg';

const Header = () => {
  return (
    <div className="sticky-header">
      <div className="header-item left">
        <img src={menuImage} alt="Menu" className="menu-img" />
      </div>
      <div className="header-item center">Citrus</div>
      <div className="header-item right">
        <img src={profileImage} alt="Profile" className="profile-img" />
      </div>
    </div>
  );
};

export default Header;
