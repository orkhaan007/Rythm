import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { musicApi } from '../api/music';
import { Music } from '../api/music';
import '../assets/styles/Home.css';
import { FaPlay, FaHeart, FaClock, FaSearch, FaSort } from 'react-icons/fa';
import SongContextMenu from '../components/SongContextMenu';
import { favoritesService } from '../services/favoritesService';
import axios from 'axios';

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

const defaultCoverArt = 'https://via.placeholder.com/150';

const Home: React.FC = () => {
  const [music, setMusic] = useState<Music[]>([]);
  const [filteredMusic, setFilteredMusic] = useState<Music[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'favorites'>('all');
  const [usernames, setUsernames] = useState<{ [key: string]: string }>({});

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
        setFilteredMusic(musicData);
        setFavorites(favoritesData);

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

  useEffect(() => {
    let result = [...music];

    // Apply filter
    if (activeFilter !== 'all') {
      if (activeFilter === 'favorites') {
        result = result.filter(track => favorites.includes(track.id));
      }
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        track =>
          track.title.toLowerCase().includes(query) ||
          usernames[track.uploadedBy]?.toLowerCase().includes(query)
      );
    }

    setFilteredMusic(result);
  }, [music, searchQuery, activeFilter, favorites, usernames]);

  const handleFavoriteClick = async (songId: string) => {
    if (!userId) return;
    
    try {
      if (favorites.includes(songId)) {
        await favoritesService.removeFromFavorites(userId, songId);
        setFavorites(favorites.filter(id => id !== songId));
      } else {
        await favoritesService.addToFavorites(userId, songId);
        setFavorites([...favorites, songId]);
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, songId: string) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      songId,
    });
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner" />
        <p>Loading your music...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="home-container">
      <div className="search-section">
        <input
          type="text"
          className="search-input"
          placeholder="Search for songs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="content-header">
        <h2>Music Library</h2>
        <div className="filter-section">
          <button
            className={`filter-button ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All Music
          </button>
          <button
            className={`filter-button ${activeFilter === 'favorites' ? 'active' : ''}`}
            onClick={() => setActiveFilter('favorites')}
          >
            Favorites
          </button>
        </div>
      </div>

      <div className="music-grid">
        {filteredMusic.map((song) => (
          <div
            key={song.id}
            className="music-card"
            onMouseEnter={() => setHoveredCard(song.id)}
            onMouseLeave={() => setHoveredCard(null)}
            onContextMenu={(e) => handleContextMenu(e, song.id)}
          >
            <div className="music-image-container">
              <img src={song.filePath || defaultCoverArt} alt={song.title} />
              <div className="play-button-overlay">
                <button className="play-button">
                  <FaPlay />
                </button>
              </div>
              <button
                className={`favorite-button ${favorites.includes(song.id) ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleFavoriteClick(song.id);
                }}
              >
                <FaHeart />
              </button>
            </div>
            <div className="music-card-title">{song.title}</div>
            <div className="music-card-artist">{usernames[song.uploadedBy] || 'Unknown'}</div>
          </div>
        ))}
      </div>
      
      {contextMenu && (
        <SongContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          songId={contextMenu.songId}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
};

export default Home;