import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from '../api/axiosConfig';
import '../assets/styles/PlaylistDetails.css';
import { FaPlay, FaHeart, FaClock, FaMusic, FaTrash } from 'react-icons/fa';
import AudioPlayer from '../components/AudioPlayer';

interface Song {
  id: string;
  title: string;
  filePath: string;
  musicPath: string;
  uploadedAt: string;
  uploadedBy: string;
  uploadedByName?: string; // Kullanıcı adı için ek alan
}

interface Playlist {
  id: string;
  name: string;
  filePath: string;
  songs: Song[];
}

const PlaylistDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredSong, setHoveredSong] = useState<string | null>(null);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(-1);

  useEffect(() => {
    if (id) {
      fetchPlaylistDetails();
    }
  }, [id]);

  const fetchPlaylistDetails = async () => {
    try {
      if (location.state?.playlist) {
        setPlaylist(location.state.playlist);
      }

      const response = await axios.get(`http://localhost:7000/playlist/${id}`);
      if (response.data) {
        if (!location.state?.playlist) {
          const playlistData = response.data.playlist || {
            id: id,
            name: response.data.name || 'My Playlist',
            filePath: response.data.filePath,
            songs: response.data.songs || response.data
          };
          setPlaylist(playlistData);
        }
        const songList = Array.isArray(response.data.songs)
          ? response.data.songs
          : Array.isArray(response.data)
          ? response.data
          : [];

        const songsWithNames = await Promise.all(
          songList.map(async (song: Song) => {
            const userName = await fetchUserName(song.uploadedBy);
            return { ...song, uploadedByName: userName };
          })
        );

        setSongs(songsWithNames);
      }
      setIsLoading(false);
      setError('');
    } catch (error) {
      console.error('Error fetching playlist details:', error);
      setError('Failed to load playlist details');
      setIsLoading(false);
    }
  };

  const fetchUserName = async (userId: string): Promise<string> => {
    try {
      const response = await axios.get(`http://localhost:7000/auth/getUserById/${userId}`);
      return response.data.userName || 'Unknown User';
    } catch (error) {
      console.error(`Error fetching user name for ID ${userId}:`, error);
      return 'Unknown User';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleSongClick = (song: Song) => {
    const index = songs.findIndex((s) => s.id === song.id);
    setCurrentSongIndex(index);
    setCurrentSong(song);
  };

  const handleNextSong = () => {
    if (currentSongIndex < songs.length - 1) {
      const nextIndex = currentSongIndex + 1;
      setCurrentSongIndex(nextIndex);
      setCurrentSong(songs[nextIndex]);
    }
  };

  const handlePrevSong = () => {
    if (currentSongIndex > 0) {
      const prevIndex = currentSongIndex - 1;
      setCurrentSongIndex(prevIndex);
      setCurrentSong(songs[prevIndex]);
    }
  };

  const handleDeletePlaylist = async () => {
    if (!id || !window.confirm('Are you sure you want to delete this playlist?')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:7000/playlist/del/${id}`);
      navigate('/library', { state: { message: 'Playlist deleted successfully' } });
    } catch (error) {
      console.error('Error deleting playlist:', error);
      setError('Failed to delete playlist');
    }
  };

  if (isLoading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading playlist...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <p>{error}</p>
        <button onClick={() => navigate('/library')} className="back-button">
          Return to Library
        </button>
      </div>
    );
  }

  return (
    <div className="playlist-details-container">
      <div className="playlist-header">
        <div className="header-controls">
          <button className="back-button" onClick={() => navigate('/library')}>
            ← Back to Library
          </button>
        </div>
        <div className="playlist-info">
          {playlist?.filePath ? (
            <img src={playlist.filePath} alt={playlist.name} className="playlist-cover" />
          ) : (
            <div className="playlist-icon">
              <FaMusic />
            </div>
          )}
          <div className="playlist-text">
            <div className="playlist-name-row">
              <h1>{playlist?.name}</h1>
              <button className="delete-button" onClick={handleDeletePlaylist}>
                <FaTrash />
              </button>
            </div>
            <p>{songs.length} songs</p>
          </div>
        </div>
      </div>

      <div className="songs-container">
        {songs.length > 0 ? (
          <>
            <div className="songs-header">
              <div className="song-number">#</div>
              <div className="song-title">Title</div>
              <div className="song-artist">Artist</div>
              <div className="song-date">Date Added</div>
            </div>
            <div className="songs-list">
              {songs.map((song, index) => (
                <div
                  key={song.id}
                  className={`song-item ${hoveredSong === song.id ? 'hovered' : ''} ${
                    currentSong?.id === song.id ? 'playing' : ''
                  }`}
                  onMouseEnter={() => setHoveredSong(song.id)}
                  onMouseLeave={() => setHoveredSong(null)}
                  onClick={() => handleSongClick(song)}
                >
                  <div className="song-number">
                    {hoveredSong === song.id ? <FaPlay className="play-icon" /> : index + 1}
                  </div>
                  <div className="song-title">
                    {song.filePath && <img src={song.filePath} alt={song.title} className="song-thumbnail" />}
                    <span>{song.title}</span>
                  </div>
                  <div className="song-artist">{song.uploadedByName || 'Unknown User'}</div>
                  <div className="song-date">{formatDate(song.uploadedAt)}</div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="no-songs">
            <p>No songs in this playlist</p>
          </div>
        )}
      </div>

      {currentSong && (
        <AudioPlayer
          currentSong={currentSong}
          playlist={songs}
          onNextSong={handleNextSong}
          onPrevSong={handlePrevSong}
        />
      )}
    </div>
  );
};

export default PlaylistDetails;