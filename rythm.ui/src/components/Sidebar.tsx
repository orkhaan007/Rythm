import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaHeart, FaUpload, FaUser, FaSignOutAlt, FaMoon, FaSun } from 'react-icons/fa';
import { BiLibrary } from 'react-icons/bi';
import '../assets/styles/Sidebar.css';

interface SidebarProps {
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  onSignOut: () => void;
}

interface UserData {
  id: string;
  username: string;
  email: string;
}

const Sidebar: React.FC<SidebarProps> = ({ isExpanded, setIsExpanded, onSignOut }) => {
  const location = useLocation();
  const [profilePhotoPath, setProfilePhotoPath] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  });

  const userDataString = localStorage.getItem('userData');
  const userData: UserData | null = userDataString ? JSON.parse(userDataString) : null;
  const userId = userData?.id;

  useEffect(() => {
    const fetchProfilePhoto = async () => {
      if (!userId) return;
      try {
        const response = await fetch(`http://localhost:7000/auth/getUserProfilePhoto/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setProfilePhotoPath(data.ProfilePhotoUrl);
        } else {
          console.error('Failed to fetch profile photo');
        }
      } catch (error) {
        console.error('Error fetching profile photo:', error);
      }
    };

    fetchProfilePhoto();
  }, [userId]);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.setAttribute('data-theme', newMode ? 'dark' : 'light');
  };

  const menuItems = [
    { path: '/', icon: <FaHome />, label: 'Home' },
    { path: '/profile', icon: <FaUser />, label: 'Profile' },
    { path: '/upload', icon: <FaUpload />, label: 'Upload Music' },
    { path: '/favorites', icon: <FaHeart />, label: 'Favorites' },
    { path: '/library', icon: <BiLibrary />, label: 'Library' },
  ];

  return (
    <div className={`sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="logo-container">
        <img src="/Logo.png" alt="Rythm" className="logo" />
        {isExpanded && <h1>Rythm</h1>}
      </div>
      
      <div className="profile-section">
        <div className="profile-image">
          {profilePhotoPath ? (
            <img 
              src={profilePhotoPath}
              alt="Profile" 
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = '/default-avatar.png';
              }}
            />
          ) : (
            <FaUser />
          )}
        </div>
        {isExpanded && (
          <div className="profile-info">
            <h3>{userData?.username || 'Guest User'}</h3>
            <p>{userData?.email || 'No email'}</p>
          </div>
        )}
      </div>

      <nav className="nav-menu">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="icon">{item.icon}</span>
            {isExpanded && <span className="label">{item.label}</span>}
          </Link>
        ))}
      </nav>

      <button className="theme-toggle" onClick={toggleDarkMode}>
        <span className="icon">{isDarkMode ? <FaSun /> : <FaMoon />}</span>
        {isExpanded && <span className="label">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>}
      </button>

      <button className="sign-out-button" onClick={onSignOut}>
        <span className="icon"><FaSignOutAlt /></span>
        {isExpanded && <span className="label">Sign Out</span>}
      </button>

      <button 
        className="toggle-button"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? '<<' : '>>'}
      </button>
    </div>
  );
};

export default Sidebar;