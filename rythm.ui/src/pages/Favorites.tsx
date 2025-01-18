import React, { useEffect, useState } from 'react';
import '../assets/styles/Favorites.css';
import { favoritesService } from '../services/favoritesService';
import { musicApi } from '../api/music';
import { Music } from '../api/music';
import { FaPlay, FaHeart } from 'react-icons/fa';
import axios from 'axios'; // Axios for API calls

interface UserData {
  id: string;
  username: string;
  email: string;
  profilePhotoPath: string;
}

const Favorites: React.FC = () => {
  const [favorites, setFavorites] = useState<Music[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredSong, setHoveredSong] = useState<string | null>(null);
  const [usernames, setUsernames] = useState<{ [key: string]: string }>({}); // Store usernames
  const userDataString = localStorage.getItem('userData');
  const userData: UserData | null = userDataString ? JSON.parse(userDataString) : null;
  const userId = userData?.id;

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!userId) {
        setError('User not logged in');
        setLoading(false);
        return;
      }

      try {
        const favoriteIds = await favoritesService.getFavorites(userId);
        const allMusic = await musicApi.getAllMusic();
        const favoriteSongs = allMusic.filter((song) => favoriteIds.includes(song.id));
        setFavorites(favoriteSongs);

        // Fetch usernames for unique uploadedBy IDs
        const uniqueUserIds = Array.from(new Set(favoriteSongs.map((song) => song.uploadedBy)));
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
        setError('Failed to load favorites');
        console.error('Error fetching favorites:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [userId]);

  const handleRemoveFromFavorites = async (songId: string) => {
    if (!userId) {
      console.error('User ID not found');
      return;
    }
    try {
      await favoritesService.removeFromFavorites(userId, songId);
      setFavorites(favorites.filter((song) => song.id !== songId));
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="favorites-container">
      <h1>Your Favorites</h1>
      <div className="favorites-list">
        {favorites.length === 0 ? (
          <div className="no-favorites">
            <p>No favorite songs yet.</p>
            <p>Start adding some songs to your favorites!</p>
          </div>
        ) : (
          favorites.map((song) => (
            <div
              key={song.id}
              className="song-item"
              onMouseEnter={() => setHoveredSong(song.id)}
              onMouseLeave={() => setHoveredSong(null)}
            >
              <div className="song-thumbnail">
                {song.filePath ? (
                  <img src={song.filePath} alt={song.title} />
                ) : (
                  <div className="song-placeholder">🎵</div>
                )}
              </div>
              <div className="song-info">
                <h3>{song.title}</h3>
                <p>{usernames[song.uploadedBy] || 'Unknown'}</p>
              </div>
              {hoveredSong === song.id && (
                <div className="song-actions">
                  <button className="play-button">
                    <FaPlay />
                  </button>
                  <button
                    className="remove-favorite-button"
                    onClick={() => handleRemoveFromFavorites(song.id)}
                  >
                    <FaHeart />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Favorites;