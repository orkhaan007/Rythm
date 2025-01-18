import React, { useState } from "react";
import { signIn } from "../api/auth";
import Button from "../components/Button";
import { SignInRequest } from "../types/api";
import { useNavigate, Link } from "react-router-dom";
import "../assets/styles/SignIn.css";
import { useAuth } from "../context/AuthContext";

interface DecodedToken {
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": string;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name": string;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress": string;
  ProfilePhotoPath: string;
}

const SignIn: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const requestData: SignInRequest = { userName: username, password };
    try {
      const response = await signIn(requestData);
      const { token } = response.data;
      
      const tokenParts = token.split('.');
      const decodedToken = JSON.parse(atob(tokenParts[1])) as DecodedToken;
      console.log('Decoded token:', decodedToken);
      
      const userData = {
        id: decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"],
        username: decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
        email: decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"],
        profilePhotoPath: decodedToken.ProfilePhotoPath
      };

      localStorage.setItem('userData', JSON.stringify(userData));
      login(token); 
      navigate("/");
    } catch (error) {
      setErrorMessage("Invalid username or password");
    }
  };

  return (
    <div className="signin-container">
      <form className="signin-form" onSubmit={handleSignIn}>
        <h2>Welcome Back</h2>
        
        <div className="input-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
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
            placeholder="Enter your password"
            required
          />
        </div>

        {errorMessage && <div className="error-message">{errorMessage}</div>}

        <Button
          type="submit"
          className="signin-button"
        >
          Sign In
        </Button>

        <div className="signup-link">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </div>
      </form>
    </div>
  );
};

export default SignIn;