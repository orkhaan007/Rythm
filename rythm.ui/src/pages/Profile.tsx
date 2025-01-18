import React, { useState, useEffect } from 'react';
import '../assets/styles/Profile.css';
import { FaCamera, FaUser, FaEnvelope, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

interface UserData {
  id: string;
  username: string;
  email: string;
  profilePhotoPath: string;
}

const Profile: React.FC = () => {
  const [profilePhotoPath, setProfilePhotoPath] = useState<string | null>(null);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

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
          setProfilePhotoPath(data.profilePhotoUrl);
        } else {
          console.error('Failed to fetch profile photo');
        }
      } catch (error) {
        console.error('Error fetching profile photo:', error);
      }
    };

    fetchProfilePhoto();
  }, [userId]);

  const handleProfilePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('Uploading profile photo:', file);
    }
  };

  const handleUsernameChange = async (newUsername: string) => {
    setErrorMessage(null);
    try {
      const response = await fetch(`http://localhost:7000/auth/changeUsername`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ userId, newUsername }),
      });

      if (response.ok) {
        const updatedUserData = { ...userData, username: newUsername };
        localStorage.setItem('userData', JSON.stringify(updatedUserData));
        window.location.reload();
      } else {
        const data = await response.json();
        setErrorMessage(data?.message || 'Failed to update username.');
      }
    } catch (error) {
      console.error('Error updating username:', error);
      setErrorMessage('An error occurred while updating your username.');
    }
    setShowUsernameModal(false);
  };

  const handleEmailChange = async (newEmail: string) => {
    setErrorMessage(null);
    try {
      const response = await fetch(`http://localhost:7000/auth/changeEmail`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ userId, newEmail }),
      });

      if (response.ok) {
        const updatedUserData = { ...userData, email: newEmail };
        localStorage.setItem('userData', JSON.stringify(updatedUserData));
        window.location.reload();
      } else {
        const data = await response.json();
        setErrorMessage(data?.message || 'Failed to update email.');
      }
    } catch (error) {
      console.error('Error updating email:', error);
      setErrorMessage('An error occurred while updating your email.');
    }
    setShowEmailModal(false);
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch(`http://localhost:7000/auth/deleteAccount/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        navigate('/signin');
      } else {
        const data = await response.json();
        setErrorMessage(data?.message || 'Failed to delete account.');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      setErrorMessage('An error occurred while deleting your account.');
    }
    setShowDeleteModal(false);
  };

  return (
    <div className="profile-container">
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      <div className="profile-banner">
        <img src="/src/assets/images/profile-banner.jpg" alt="Profile Banner" />
        <label className="banner-upload">
          <FaCamera />
          <input type="file" accept="image/*" onChange={handleProfilePhotoChange} />
        </label>
      </div>

      <div className="profile-header">
        <div className="profile-avatar">
          <img
            src={profilePhotoPath || '/src/assets/images/default-avatar.png'}
            alt="Profile"
          />
          <label className="avatar-upload">
            <FaCamera />
            <input type="file" accept="image/*" onChange={handleProfilePhotoChange} />
          </label>
        </div>
        <div className="profile-info">
          <h1>{userData?.username}</h1>
          <p>{userData?.email}</p>
        </div>
      </div>

      <div className="profile-settings">
        <h2>Account Settings</h2>
        <div className="additional-settings">
          <button
            className="change-username-button"
            onClick={() => setShowUsernameModal(true)}
          >
            <FaUser /> Change Username
          </button>
          <button
            className="change-email-button"
            onClick={() => setShowEmailModal(true)}
          >
            <FaEnvelope /> Change Email
          </button>
          <button
            className="delete-account-button"
            onClick={() => setShowDeleteModal(true)}
          >
            <FaTrash /> Delete Account
          </button>
        </div>
      </div>

      {showUsernameModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Change Username</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const newUsername = (e.target as any).newUsername.value;
                handleUsernameChange(newUsername);
              }}
            >
              <input type="text" name="newUsername" placeholder="New Username" required />
              <div className="modal-buttons">
                <button type="submit">Change Username</button>
                <button type="button" onClick={() => setShowUsernameModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEmailModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Change Email</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const newEmail = (e.target as any).newEmail.value;
                handleEmailChange(newEmail);
              }}
            >
              <input type="email" name="newEmail" placeholder="New Email" required />
              <div className="modal-buttons">
                <button type="submit">Change Email</button>
                <button type="button" onClick={() => setShowEmailModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Confirm Account Deletion</h2>
            <p>Are you sure you want to delete your account? This action cannot be undone.</p>
            <div className="modal-buttons">
              <button className="delete-button" onClick={handleDeleteAccount}>
                Yes, Delete
              </button>
              <button onClick={() => setShowDeleteModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;