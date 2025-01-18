import React, { useState, useEffect, useRef, DragEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosConfig';
import '../assets/styles/Library.css';

interface Song {
  id: string;
  title: string;
  filePath: string;
  musicPath: string;
  uploadedAt: string;
  uploadedBy: string;
}

interface Playlist {
  id: string;
  name: string;
  filePath: string;
  songs: Song[];
}

interface UserData {
  id: string;
  username: string;
  email: string;
  profilePhotoPath: string;
}

const Library: React.FC = () => {
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [error, setError] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const userDataString = localStorage.getItem('userData');
  const userData: UserData | null = userDataString ? JSON.parse(userDataString) : null;
  const userId = userData?.id;

  useEffect(() => {
    if (userId) {
      fetchPlaylists();
    }
  }, [userId]);

  const fetchPlaylists = async () => {
    try {
      const response = await axios.get(`http://localhost:7000/playlist/user/${userId}`);
      setPlaylists(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching playlists:', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      if (fileInputRef.current) {
        // Create a new FileList containing the dropped file
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInputRef.current.files = dataTransfer.files;
      }
    } else {
      setError('Please drop an image file');
    }
  };

  const handleCreatePlaylist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!userData?.id || !newPlaylistName.trim()) {
      setError('User not authenticated or playlist name is empty');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('Name', newPlaylistName.trim());
      formData.append('UserId', userData.id);
      
      if (selectedFile) {
        formData.append('FilePath', selectedFile);
      } else {
        formData.append('FilePath', '');
      }

      console.log('Creating playlist with name:', newPlaylistName);
      if (selectedFile) {
        console.log('Selected file:', selectedFile.name);
      }

      const response = await axios.post('http://localhost:7000/playlist/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      if (response.data) {
        setNewPlaylistName('');
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        fetchPlaylists();
        setError('');
      }
    } catch (error: any) {
      console.error('Error creating playlist:', error);
      setError(error.response?.data?.message || 'Failed to create playlist');
    }
  };

  const handlePlaylistClick = (playlist: Playlist) => {
    navigate(`/playlistdetails/${playlist.id}`, { state: { playlist } });
  };

  return (
    <div className="library-container">
      <div className="library-header">
        <h1>My Music Library</h1>
        <form className="create-playlist-form" onSubmit={(e) => e.preventDefault()}>
          <input
            type="text"
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            placeholder="New Playlist Name"
            required
          />
          <div 
            className={`file-drop-area ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="file-input"
              style={{ display: 'none' }}
              aria-label="Choose cover image"
            />
            {selectedFile ? (
              <div className="file-preview">
                <span className="file-name">{selectedFile.name}</span>
                <button 
                  className="clear-file" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  aria-label="Clear selected file"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="file-placeholder">
                <span>📷 Choose Cover</span>
                <small>Click or drag image</small>
              </div>
            )}
          </div>
          <button 
            onClick={handleCreatePlaylist} 
            type="button"
            disabled={!newPlaylistName.trim()}
          >
            Create Playlist
          </button>
        </form>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="library-content">
        <div className="playlists-section">
          <div className="playlists-grid">
            {playlists.length > 0 ? (
              playlists.map((playlist) => (
                <div
                  key={playlist.id}
                  className="playlist-card"
                  onClick={() => handlePlaylistClick(playlist)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handlePlaylistClick(playlist);
                    }
                  }}
                >
                  {playlist.filePath ? (
                    <img 
                      src={playlist.filePath} 
                      alt={playlist.name}
                      className="playlist-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="playlist-icon">
                      <span role="img" aria-label="music">🎵</span>
                    </div>
                  )}
                  <h3>{playlist.name}</h3>
                  <p>{playlist.songs?.length || 0} songs</p>
                </div>
              ))
            ) : (
              <div className="empty-library">
                <h3>No Playlists Yet</h3>
                <p>Create your first playlist to start organizing your music!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Library;