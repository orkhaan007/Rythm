import React, { useEffect, useState } from 'react';
import axios from '../api/axiosConfig';
import '../assets/styles/SongContextMenu.css';
import { FaPlus, FaList } from 'react-icons/fa';

interface Playlist {
  id: string;
  title: string;
  filePath: string;
}

interface SongContextMenuProps {
  x: number;
  y: number;
  songId: string;
  onClose: () => void;
}

interface UserData {
  id: string;
  username: string;
  email: string;
  profilePhotoPath: string;
}

const SongContextMenu: React.FC<SongContextMenuProps> = ({ x, y, songId, onClose }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToPlaylist, setAddingToPlaylist] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.context-menu')) {
        onClose();
      }
    };

    document.addEventListener('click', handleClickOutside);
    fetchPlaylists();

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [onClose]);

  const fetchPlaylists = async () => {
    try {
      const userDataString = localStorage.getItem('userData');
      const userData: UserData | null = userDataString ? JSON.parse(userDataString) : null;
      const userId = userData?.id;
      
      if (!userId) {
        setError('User not found');
        return;
      }
      
      const response = await axios.get(`http://localhost:7000/playlist/user/${userId}`);
      setPlaylists(response.data);
    } catch (error) {
      console.error('Error fetching playlists:', error);
      setError('Failed to load playlists');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToPlaylist = async (playlistId: string) => {
    try {
      setAddingToPlaylist(playlistId);
      await axios.post(`http://localhost:7000/playlist/${playlistId}/add-song/${songId}`);
      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'success-message';
      successMessage.textContent = 'Song added to playlist!';
      document.body.appendChild(successMessage);
      setTimeout(() => {
        document.body.removeChild(successMessage);
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error adding song to playlist:', error);
      setError('Failed to add song to playlist');
    } finally {
      setAddingToPlaylist(null);
    }
  };

  const menuStyle = {
    position: 'fixed' as const,
    top: `${y}px`,
    left: `${x}px`,
  };

  if (loading) {
    return (
      <div className="context-menu" style={menuStyle}>
        <div className="menu-loading">
          <div className="loading-spinner"></div>
          <span>Loading playlists...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="context-menu" style={menuStyle}>
        <div className="menu-error">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="context-menu" style={menuStyle}>
      <div className="menu-header">
        <FaList className="menu-icon" />
        <span>Add to Playlist</span>
      </div>
      <div className="menu-content">
        {playlists.length === 0 ? (
          <div className="menu-empty">
            <span>No playlists available</span>
            <small>Create a playlist first</small>
          </div>
        ) : (
          <div className="playlist-list">
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                className={`menu-item ${addingToPlaylist === playlist.id ? 'adding' : ''}`}
                onClick={() => handleAddToPlaylist(playlist.id)}
              >
                {playlist.filePath ? (
                  <img 
                    src={playlist.filePath} 
                    alt={playlist.title} 
                    className="playlist-thumbnail"
                  />
                ) : (
                  <div className="playlist-icon">
                    <FaList />
                  </div>
                )}
                <span className="playlist-title">{playlist.title}</span>
                <FaPlus className="add-icon" />
                {addingToPlaylist === playlist.id && (
                  <div className="adding-spinner"></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SongContextMenu;
