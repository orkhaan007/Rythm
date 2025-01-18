import React, { useState, useRef, useEffect } from 'react';
import { FaPlay, FaPause, FaStepForward, FaStepBackward, FaVolumeUp } from 'react-icons/fa';
import '../assets/styles/AudioPlayer.css';

interface AudioPlayerProps {
  currentSong: {
    id: string;
    title: string;
    musicPath: string;
    uploadedBy: string;
  } | null;
  playlist: Array<{
    id: string;
    title: string;
    musicPath: string;
    uploadedBy: string;
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

  const handleProgressBarClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (progressBarRef.current && audioRef.current) {
      const progressBar = progressBarRef.current;
      const rect = progressBar.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const width = rect.width;
      const percentage = x / width;
      const newTime = percentage * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="audio-player">
      {currentSong && (
        <>
          <audio
            ref={audioRef}
            src={currentSong.musicPath}
            onTimeUpdate={handleTimeUpdate}
            onEnded={onNextSong}
          />
          
          <div className="song-info">
            <div className="song-title">{currentSong.title}</div>
            <div className="song-artist">{currentSong.uploadedBy}</div>
          </div>

          <div className="controls">
            <button onClick={onPrevSong} className="control-button">
              <FaStepBackward />
            </button>
            
            <button onClick={togglePlay} className="control-button play-button">
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>
            
            <button onClick={onNextSong} className="control-button">
              <FaStepForward />
            </button>
          </div>

          <div className="progress-container">
            <span className="time">{formatTime(currentTime)}</span>
            <div
              ref={progressBarRef}
              className="progress-bar"
              onClick={handleProgressBarClick}
            >
              <div
                className="progress"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>
            <span className="time">{formatTime(duration)}</span>
          </div>

          <div className="volume-control">
            <FaVolumeUp />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="volume-slider"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default AudioPlayer;
