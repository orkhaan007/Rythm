import React, { useState, useRef, useEffect } from 'react';
import '../assets/styles/Upload.css';
import { FaUpload } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";
import { musicApi } from '../api/music';

interface AudioFile extends File {
  url?: string;
  metadata?: {
    title: string;
    album: string;
    albumImage?: string;
  };
}

const Upload: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [selectedFile, setSelectedFile] = useState<AudioFile | null>(null);
  const [metadata, setMetadata] = useState({
    title: '',
    album: '',
    albumImage: '',
    artist: ''
  });
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      setMetadata(prev => ({
        ...prev,
        artist: userData.username
      }));
    }
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter(file => {
      const validTypes = ['audio/mpeg', 'audio/wav', 'audio/flac'];
      return validTypes.includes(file.type);
    });

    if (droppedFiles.length > 0) {
      setFiles(prevFiles => [...prevFiles, ...droppedFiles]);
      console.log('Dropped files:', droppedFiles);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter(file => {
        const validTypes = ['audio/mpeg', 'audio/wav', 'audio/flac'];
        return validTypes.includes(file.type);
      });

      if (selectedFiles.length > 0) {
        setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
        console.log('Selected files:', selectedFiles);
      }
    }
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  const handleMetadataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMetadata(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCoverImageFile(file);
      const imageUrl = URL.createObjectURL(file);
      setMetadata(prev => ({
        ...prev,
        albumImage: imageUrl
      }));
    }
  };

  const handleTrackClick = (file: AudioFile) => {
    setSelectedFile(file);
    setMetadata(prev => ({
      ...prev,
      title: file.name.replace(/\.[^/.]+$/, '')
    }));
  };

  const handleUpload = async () => {
    if (!selectedFile || !coverImageFile) {
      setErrorMessage("Please select both a music file and cover image");
      return;
    }

    if (!metadata.title || !metadata.album) {
      setErrorMessage("Please fill in all required fields");
      return;
    }

    setIsUploading(true);
    setErrorMessage("");

    try {
      const userDataString = localStorage.getItem('userData');
      if (!userDataString) {
        throw new Error("User not authenticated");
      }

      const userData = JSON.parse(userDataString);
      if (!userData.id) {
        throw new Error("User ID not found");
      }

      const formData = new FormData();
      formData.append('userId', userData.id);
      formData.append('title', metadata.title);
      formData.append('album', metadata.album);
      formData.append('artist', metadata.artist);
      formData.append('musicFile', selectedFile);
      formData.append('coverImage', coverImageFile);

      const result = await musicApi.uploadMusic(formData);
      console.log('Upload successful:', result);
      navigate('/');
    } catch (error) {
      console.error('Upload error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="upload-container">
      <h1>Upload Music</h1>
      <div className="upload-content-wrapper">
        <div className="upload-section">
          <div 
            className={`upload-area ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".mp3,.wav,.flac"
              onChange={handleChange}
              style={{ display: 'none' }}
            />
            <div className="upload-content">
              <FaUpload className="upload-icon" />
              <p>Drag and drop your music files here</p>
              <span>or</span>
              <button className="browse-button" onClick={handleButtonClick}>
                Browse Files
              </button>
            </div>
          </div>
          
          <div className="upload-info">
            <h3>Supported Formats</h3>
            <p>MP3, WAV, FLAC (up to 50MB)</p>
          </div>
        </div>

        {files.length > 0 && (
          <div className="uploaded-files">
            <h3>Selected Files</h3>
            <ul>
              {files.map((file, index) => (
                <li 
                  key={index}
                  onClick={() => handleTrackClick(file)}
                  className={selectedFile === file ? 'active' : ''}
                >
                  {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                </li>
              ))}
            </ul>
          </div>
        )}

        {selectedFile && (
          <div className="metadata-section">
            <h2>Song Details</h2>
            <div className="metadata-form">
              <div className="album-image-upload">
                <div 
                  className="image-preview" 
                  onClick={() => imageInputRef.current?.click()}
                  style={{ 
                    backgroundImage: metadata.albumImage ? `url(${metadata.albumImage})` : 'none'
                  }}
                >
                  {!metadata.albumImage && <span>Upload Album Cover</span>}
                </div>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={metadata.title}
                  onChange={handleMetadataChange}
                  placeholder="Enter song title"
                />
              </div>

              <div className="form-group">
                <label htmlFor="artist">Artist</label>
                <input
                  type="text"
                  id="artist"
                  name="artist"
                  value={metadata.artist}
                  disabled
                  className="disabled-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="album">Album</label>
                <input
                  type="text"
                  id="album"
                  name="album"
                  value={metadata.album}
                  onChange={handleMetadataChange}
                  placeholder="Enter album name"
                />
              </div>

              <button 
                className="upload-submit-button"
                disabled={!selectedFile || !metadata.title || !metadata.album || isUploading}
                onClick={handleUpload}
              >
                {isUploading ? 'Uploading...' : 'Upload Song'}
              </button>
              {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Upload;