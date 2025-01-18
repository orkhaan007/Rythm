import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { musicApi } from '../api/music';
import { Music } from '../api/music';
import '../assets/styles/Home.css';
import { FaPlay, FaHeart } from 'react-icons/fa';
import SongContextMenu from '../components/SongContextMenu';
import { favoritesService } from '../services/favoritesService';
import axios from 'axios'; // Axios for HTTP requests

interface ContextMenu {
  x: number;
  y: number;
  songId: string;
}

interface UserData {
  id: string;
  username: string;
  email: string;
  profilePhotoPath: string;
}

const Home: React.FC = () => {
  const [music, setMusic] = useState<Music[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [usernames, setUsernames] = useState<{ [key: string]: string }>({}); // Store usernames
  const userDataString = localStorage.getItem('userData');
  const userData: UserData | null = userDataString ? JSON.parse(userDataString) : null;
  const userId = userData?.id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [musicData, favoritesData] = await Promise.all([
          musicApi.getAllMusic(),
          userId ? favoritesService.getFavorites(userId) : Promise.resolve([]),
        ]);
        setMusic(musicData);
        setFavorites(favoritesData);

        // Fetch usernames for all unique uploadedBy IDs
        const uniqueUserIds = Array.from(new Set(musicData.map((track) => track.uploadedBy)));
        const userPromises = uniqueUserIds.map((id) =>
          axios.get(`http://localhost:7000/auth/getUserById/${id}`).then((res) => ({
            id,
            username: res.data.userName,
          }))
        );
        const userResults = await Promise.all(userPromises);
        const usernameMap = userResults.reduce((map, user) => {
          map[user.id] = user.username;
          return map;
        }, {} as { [key: string]: string });

        setUsernames(usernameMap);
      } catch (err) {
        setError('Failed to load data');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const handleContextMenu = (event: React.MouseEvent, songId: string) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      songId,
    });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const handleFavoriteClick = async (songId: string) => {
    if (!userId) {
      console.error('User ID is not available');
      return;
    }

    try {
      if (favorites.includes(songId)) {
        await favoritesService.removeFromFavorites(userId, songId);
        setFavorites(favorites.filter((id) => id !== songId));
      } else {
        await favoritesService.addToFavorites(userId, songId);
        setFavorites([...favorites, songId]);
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="home-container">
      <h1>Welcome to Rythm</h1>

      <div className="music-grid">
        {music.length === 0 ? (
          <div className="no-music">
            <p>No music available. Start by uploading some tracks!</p>
            <Link to="/upload" className="upload-button">
              Upload Music
            </Link>
          </div>
        ) : (
          music.map((track) => (
            <div
              key={track.id}
              className="music-card"
              onMouseEnter={() => setHoveredCard(track.id)}
              onMouseLeave={() => setHoveredCard(null)}
              onContextMenu={(e) => handleContextMenu(e, track.id)}
            >
              <div className="music-image">
                {track.filePath ? (
                  <img src={track.filePath} alt={track.title} />
                ) : (
                  <div className="music-placeholder">🎵</div>
                )}
                <button
                  className={`favorite-button ${favorites.includes(track.id) ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFavoriteClick(track.id);
                  }}
                >
                  <FaHeart />
                </button>
                {hoveredCard === track.id && (
                  <div className="hover-overlay">
                    <button className="play-button">
                      <FaPlay />
                    </button>
                  </div>
                )}
              </div>
              <div className="music-info">
                <h3>{track.title}</h3>
                <p>{usernames[track.uploadedBy] || 'Unknown'}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {contextMenu && (
        <SongContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          songId={contextMenu.songId}
          onClose={closeContextMenu}
        />
      )}
    </div>
  );
};

export default Home;