// Importing necessary React and other modules
import React, { useState } from 'react'; // useState for managing form and UI state
import { useNavigate, Link } from 'react-router-dom'; // useNavigate for redirect, Link for navigation links
import axios from 'axios'; // For making HTTP POST request
import '../styles/adminlogin.css'; // Importing CSS file for admin login page styling

// Functional component for Admin Login
const AdminLogin = () => {
  // State for email input field
  const [email, setEmail] = useState('');

  // State for password input field
  const [password, setPassword] = useState('');

  // State for error message shown on invalid login
  const [errorMessage, setErrorMessage] = useState('');

  // State to handle loading state during login API call
  const [loading, setLoading] = useState(false);

  // Hook from React Router to navigate between pages
  const navigate = useNavigate();

  // Function to handle login logic
  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent default form submit behavior

    // Check if email or password is empty
    if (!email || !password) {
      setErrorMessage('Please enter email and password'); // Show error if empty
      return;
    }

    setLoading(true); // Show loading state
    try {
      // Send login data to backend API
      const response = await axios.post('http://localhost:3000/admin/login', { email, password });

      // Store token and admin ID in local storage for authentication
      localStorage.setItem('admin_token', response.data.token);
      localStorage.setItem('admin_id', response.data.adminId);

      // Redirect to admin dashboard upon successful login
      navigate('/admin');
    } catch (error) {
      // Show error message from server if login fails
      setErrorMessage(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false); // Reset loading state after request completes
    }
  };

  // JSX for rendering the login form
  return (
    <div className="admin-login-container"> {/* Main container for layout */}
      <div className="login-box"> {/* Box containing form elements */}
        <h2>Admin Login</h2> {/* Heading */}
        <form onSubmit={handleLogin}> {/* Form submission triggers handleLogin */}
          <input
            type="email"
            placeholder="Email" // Placeholder text
            value={email}
            onChange={e => setEmail(e.target.value)} // Update email state on change
            required // Make field required
          />
          <input
            type="password"
            placeholder="Password" // Placeholder text
            value={password}
            onChange={e => setPassword(e.target.value)} // Update password state on change
            required // Make field required
          />
          <button type="submit" disabled={loading}> {/* Submit button */}
            {loading ? 'Logging in...' : 'Login'} {/* Show loading text if request is in progress */}
          </button>
        </form>
        <div className="error-message">{errorMessage}</div> {/* Error message display */}
        <div className="options"> {/* Links to switch between logins */}
          <Link to="/">Child Login</Link>
          <Link to="/superadmin-login">SuperAdmin Login</Link>
        </div>
      </div>
    </div>
  );
};

// Exporting the component for use in routes
export default AdminLogin;
