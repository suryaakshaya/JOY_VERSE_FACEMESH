// React imports
import React, { useState, useRef, useEffect } from 'react'; // useState for state handling, useRef for input references, useEffect for focusing on input
import { Link, useNavigate } from 'react-router-dom'; // Link for navigation buttons, useNavigate to redirect after login
import axios from 'axios'; // Axios for making HTTP requests

// Importing image and CSS styles
import characterImg from '../assets/trail2.png'; // Character image used in login box
import '../styles/childstyles.css'; // Custom styles for the child login page

// Main functional component
const ChildLogin = () => {
  // State for child name input
  const [childName, setChildName] = useState('');

  // Array of 6 digits representing userId; initially empty strings
  const [digits, setDigits] = useState(Array(6).fill(''));

  // Error message for validation failures
  const [errorMessage, setErrorMessage] = useState('');

  // Loading state to show "Logging in..." text on button
  const [loading, setLoading] = useState(false);

  // Reference to all 6 input boxes to control focus
  const inputRefs = useRef([]);

  // Hook to navigate to other pages after login
  const navigate = useNavigate();

  // Handler for digit input change in each box
  const handleDigitChange = (value, index) => {
    if (!/^\d?$/.test(value)) return; // Only allow digits or empty value
    const newDigits = [...digits]; // Copy current digits
    newDigits[index] = value; // Update digit at current index
    setDigits(newDigits); // Set updated digits
    if (value && index < 5) inputRefs.current[index + 1].focus(); // Move focus to next box if digit is entered
  };

  // Handle key actions (Backspace and Enter) in digit boxes
  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1].focus(); // Go back to previous box if current one is empty
    }
    if (e.key === 'Enter') validateLogin(); // On Enter key, try logging in
  };

  // Function to validate inputs and make login request
  const validateLogin = async () => {
    const userId = digits.join(''); // Join the 6 digits into one userId string
    if (!childName || userId.length !== 6) {
      setErrorMessage('Please enter your name and 6-digit code.');
      return; // Stop if validation fails
    }

    setLoading(true); // Show loading spinner on button
    try {
      // Send login request to backend with name and userId
      const response = await axios.post('http://localhost:3000/child/login', {
        childName,
        userId,
        password: userId, // userId is used as password
      });

      // On success, store token and userId in localStorage
      localStorage.setItem('child_token', response.data.token);
      localStorage.setItem('userId', response.data.userId);

      // Navigate to game page after successful login
      navigate('/game');
    } catch (error) {
      // Show error message from server or fallback message
      setErrorMessage(error.response?.data?.message || 'Invalid credentials!');
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  // Focus on the first digit box when the component mounts
  useEffect(() => {
    inputRefs.current[0].focus();
  }, []);

  // UI for the login form
  return (
    <div className="login-body"> {/* Full screen background wrapper */}
      <div className="container"> {/* Main container for the login UI */}
        <div className="login-box"> {/* Box with image, inputs and button */}
          <img src={characterImg} alt="Character" className="character" /> {/* Character illustration */}
          <h2>LOGIN</h2> {/* Login heading */}

          {/* Input field for child name */}
          <input
            type="text"
            placeholder="Your Name"
            className="input-box"
            value={childName}
            onChange={e => setChildName(e.target.value)} // Update state on change
          />

          {/* Digit input boxes for 6-digit userId */}
          <div className="digit-boxes">
            {digits.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                className="digit-box"
                value={digit}
                ref={el => (inputRefs.current[index] = el)} // Store each input ref
                onChange={e => handleDigitChange(e.target.value, index)} // Handle digit change
                onKeyDown={e => handleKeyDown(e, index)} // Handle navigation with keyboard
              />
            ))}
          </div>

          {/* Error message display */}
          <div className="error-message">{errorMessage}</div>

          {/* Submit button */}
          <button className="login-btn" onClick={validateLogin} disabled={loading}>
            {loading ? 'Logging in...' : 'Join the Fun!'} {/* Show loading state */}
          </button>

          {/* Extra options (non-functional placeholder) */}
          <div className="options">
            <label><input type="checkbox" /> Remember me</label>
            <a href="#">Forgot your password?</a>
          </div>
        </div>

        {/* Navigation buttons to switch login roles */}
        <Link to="/admin-login" className="admin-btn">Admin Login</Link>
        <Link to="/superadmin-login" className="superadmin-btn">SuperAdmin Login</Link>
      </div>
    </div>
  );
};

// Export the component so it can be used in routes
export default ChildLogin;
