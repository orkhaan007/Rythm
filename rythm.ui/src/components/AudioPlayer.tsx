import React, { useState, useRef, useEffect } from 'react';
import { FaPlay, FaPause, FaStepForward, FaStepBackward, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import '../assets/styles/AudioPlayer.css';

interface AudioPlayerProps {
  currentSong: {
    id: string;
    title: string;
    musicPath: string;
    uploadedBy: string;
    filePath?: string; // For song image
  } | null;
  playlist: Array<{
    id: string;
    title: string;
    musicPath: string;
    uploadedBy: string;
    filePath?: string;
  }>;
  onNextSong: () => void;
  onPrevSong: () => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  currentSong,
  playlist,
  onNextSong,
  onPrevSong
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentSong && audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [currentSong]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressBarRef.current && audioRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      audioRef.current.currentTime = pos * duration;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (newVolume === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!currentSong) return null;

  const defaultImage = 'https://via.placeholder.com/60';

  return (
    <div className="audio-player">
      <div className="song-info">
        <div className="song-image">
          <img src={currentSong.filePath || defaultImage} alt={currentSong.title} />
        </div>
        <div className="song-details">
          <div className="song-title">{currentSong.title}</div>
          <div className="song-artist">{currentSong.uploadedBy}</div>
        </div>
      </div>

      <div className="player-controls">
        <div className="control-buttons">
          <button className="control-button" onClick={onPrevSong}>
            <FaStepBackward />
          </button>
          <button className="control-button play-pause" onClick={togglePlay}>
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>
          <button className="control-button" onClick={onNextSong}>
            <FaStepForward />
          </button>
        </div>

        <div className="progress-container">
          <span>{formatTime(currentTime)}</span>
          <div 
            className="progress-bar" 
            ref={progressBarRef}
            onClick={handleProgressClick}
          >
            <div 
              className="progress" 
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="volume-control">
        <button className="volume-button" onClick={toggleMute}>
          {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
        </button>
        <div className="volume-slider">
          <div 
            className="volume-level" 
            style={{ width: `${isMuted ? 0 : volume * 100}%` }}
          />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            style={{ width: '100%', opacity: 0, cursor: 'pointer' }}
          />
        </div>
      </div>

      <audio
        ref={audioRef}
        src={currentSong.musicPath}
        onTimeUpdate={handleTimeUpdate}
        onEnded={onNextSong}
      />
    </div>
  );
};

export default AudioPlayer;
