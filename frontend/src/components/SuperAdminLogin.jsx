// Import necessary React hooks and components
import React, { useState } from 'react'; // useState is used to handle form input and status
import { useNavigate, Link } from 'react-router-dom'; // useNavigate for redirection, Link for navigation links
import axios from 'axios'; // axios is used for making HTTP requests
import '../styles/superadminlogin.css'; // Importing custom CSS styles for the login UI

// Define the SuperAdminLogin component
const SuperAdminLogin = () => {
  // State variables for form inputs, error message, and loading status
  const [email, setEmail] = useState(''); // Stores email input
  const [password, setPassword] = useState(''); // Stores password input
  const [errorMessage, setErrorMessage] = useState(''); // Stores error message for login failure
  const [loading, setLoading] = useState(false); // Indicates whether login request is being processed

  const navigate = useNavigate(); // Hook to programmatically navigate to other routes

  // Function to handle login form submission
  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent page reload on form submit

    // Basic validation: check if email and password fields are not empty
    if (!email || !password) {
      setErrorMessage('Please enter email and password');
      return;
    }

    setLoading(true); // Set loading to true to disable the button and show "Logging in..."

    try {
      // Send POST request to login endpoint with email and password
      const response = await axios.post('http://localhost:3000/superadmin/login', { email, password });

      // On success, store token in local storage for authentication
      localStorage.setItem('superadmin_token', response.data.token);

      setErrorMessage(''); // Clear any previous error messages

      // Redirect to SuperAdmin dashboard after successful login
      navigate('/superadmin');
    } catch (error) {
      // Show error message from server or fallback message
      setErrorMessage(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <div className="superadmin-login-container"> {/* Container for login UI */}
      <div className="login-box"> {/* Box styling for login form */}
        <h2>SuperAdmin Login</h2> {/* Heading */}

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          {/* Email input field */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          {/* Password input field */}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          {/* Submit button (disabled when loading) */}
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'} {/* Show dynamic button text */}
          </button>
        </form>

        {/* Display any error messages */}
        <div className="error-message">{errorMessage}</div>

        {/* Navigation options to switch between login types */}
        <div className="options">
          <Link to="/">Child Login</Link> {/* Link to child login */}
          <Link to="/admin-login">Admin Login</Link> {/* Link to admin login */}
        </div>
      </div>
    </div>
  );
};

// Export the component so it can be used in other parts of the app
export default SuperAdminLogin;
