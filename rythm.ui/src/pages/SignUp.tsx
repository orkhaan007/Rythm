import React, { useState, useRef } from "react";
import { signUp } from "../api/auth";
import Button from "../components/Button";
import { useNavigate, Link } from "react-router-dom";
import "../assets/styles/SignUp.css";
import { FaUpload } from "react-icons/fa";

const SignUp: React.FC = () => {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

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

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setProfilePhoto(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith("image/")) {
        setProfilePhoto(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      }
    }
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("userName", userName);
    formData.append("email", email);
    formData.append("password", password);
    if (profilePhoto) {
      formData.append("profilePhoto", profilePhoto);
    }

    try {
      await signUp(formData);
      navigate("/signin");
    } catch (error) {
      setErrorMessage("Failed to create account. Please try again.");
    }
  };

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSignUp}>
        <h2>Create Account</h2>
        
        <div className="input-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Choose a username"
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
            required
          />
        </div>

        <div 
          className={`profile-photo-upload ${dragActive ? "drag-active" : ""}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            className="file-input"
            accept="image/*"
            onChange={handleChange}
            style={{ display: "none" }}
          />
          
          {previewUrl ? (
            <div className="preview-container">
              <img src={previewUrl} alt="Profile preview" className="preview-image" />
              <button type="button" onClick={() => {
                setProfilePhoto(null);
                setPreviewUrl(null);
              }}>Remove</button>
            </div>
          ) : (
            <div className="upload-prompt" onClick={handleButtonClick}>
              <FaUpload className="upload-icon" />
              <p>Drag & drop your profile photo here or click to select</p>
            </div>
          )}
        </div>

        {errorMessage && <div className="error-message">{errorMessage}</div>}
        
        <Button type="submit">Sign Up</Button>
        
        <p className="signin-link">
          Already have an account? <Link to="/signin">Sign In</Link>
        </p>
      </form>
    </div>
  );
};

export default SignUp;