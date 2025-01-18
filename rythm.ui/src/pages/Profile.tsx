import React, { useState } from 'react';
import '../assets/styles/Profile.css';
import { FaCamera, FaKey, FaTrash } from 'react-icons/fa';

const Profile: React.FC = () => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleProfilePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Handle profile photo upload
      console.log('Uploading profile photo:', file);
    }
  };

  const handleBannerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Handle banner upload
      console.log('Uploading banner:', file);
    }
  };

  const handlePasswordChange = (oldPassword: string, newPassword: string) => {
    // Handle password change
    console.log('Changing password');
    setShowPasswordModal(false);
  };

  const handleDeleteAccount = () => {
    // Handle account deletion
    console.log('Deleting account');
    setShowDeleteModal(false);
  };

  return (
    <div className="profile-container">
      <div className="profile-banner">
        <img src="/src/assets/images/profile-banner.jpg" alt="Profile Banner" />
        <label className="banner-upload">
          <FaCamera />
          <input type="file" accept="image/*" onChange={handleBannerChange} />
        </label>
      </div>

      <div className="profile-header">
        <div className="profile-avatar">
          <img src="/src/assets/images/profile-photo.png" alt="Profile" />
          <label className="avatar-upload">
            <FaCamera />
            <input type="file" accept="image/*" onChange={handleProfilePhotoChange} />
          </label>
        </div>
        <div className="profile-info">
          <h1>Orkhan</h1>
          <p>?</p>
        </div>
      </div>

      <div className="profile-stats">
        <div className="stat-item">
          <h3>Playlists</h3>
          <p>12</p>
        </div>
        <div className="stat-item">
          <h3>Favorites</h3>
          <p>48</p>
        </div>
        <div className="stat-item">
          <h3>Songs</h3>
          <p>156</p>
        </div>
      </div>

      <div className="profile-settings">
        <h2>Account Settings</h2>
        <form className="settings-form">
          <div className="form-group">
            <label>Display Name</label>
            <input type="text" defaultValue="John Doe" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" defaultValue="john@example.com" />
          </div>
          <button type="submit" className="save-button">Save Changes</button>
        </form>

        <div className="additional-settings">
          <button 
            className="change-password-button"
            onClick={() => setShowPasswordModal(true)}
          >
            <FaKey /> Change Password
          </button>
          <button 
            className="delete-account-button"
            onClick={() => setShowDeleteModal(true)}
          >
            <FaTrash /> Delete Account
          </button>
        </div>
      </div>

      {showPasswordModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Change Password</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const oldPassword = (e.target as any).oldPassword.value;
              const newPassword = (e.target as any).newPassword.value;
              handlePasswordChange(oldPassword, newPassword);
            }}>
              <input type="password" name="oldPassword" placeholder="Current Password" required />
              <input type="password" name="newPassword" placeholder="New Password" required />
              <div className="modal-buttons">
                <button type="submit">Change Password</button>
                <button type="button" onClick={() => setShowPasswordModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Delete Account</h2>
            <p>Are you sure you want to delete your account? This action cannot be undone.</p>
            <div className="modal-buttons">
              <button onClick={handleDeleteAccount} className="delete-button">Delete</button>
              <button onClick={() => setShowDeleteModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;