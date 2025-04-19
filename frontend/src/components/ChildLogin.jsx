import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import characterImg from '../assets/trail2.png';
import '../styles/childstyles.css';

const ChildLogin = () => {
  const [childName, setChildName] = useState('');
  const [digits, setDigits] = useState(Array(6).fill(''));
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  const handleDigitChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);
    if (value && index < 5) inputRefs.current[index + 1].focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
    if (e.key === 'Enter') validateLogin();
  };

  const validateLogin = async () => {
    const userId = digits.join('');
    if (!childName || userId.length !== 6) {
      setErrorMessage('Please enter your name and 6-digit code.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3000/child/login', {
        childName,
        userId,
        password: userId,
      });
      localStorage.setItem('child_token', response.data.token);
      localStorage.setItem('userId', response.data.userId);
      navigate('/game');
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Invalid credentials!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    inputRefs.current[0].focus();
  }, []);

  return (
    <div className="login-body">
      <div className="container">
        <div className="login-box">
          <img src={characterImg} alt="Character" className="character" />
          <h2>LOGIN</h2>
          <input
            type="text"
            placeholder="Your Name"
            className="input-box"
            value={childName}
            onChange={e => setChildName(e.target.value)}
          />
          <div className="digit-boxes">
            {digits.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                className="digit-box"
                value={digit}
                ref={el => (inputRefs.current[index] = el)}
                onChange={e => handleDigitChange(e.target.value, index)}
                onKeyDown={e => handleKeyDown(e, index)}
              />
            ))}
          </div>
          <div className="error-message">{errorMessage}</div>
          <button className="login-btn" onClick={validateLogin} disabled={loading}>
            {loading ? 'Logging in...' : 'Join the Fun!'}
          </button>
          <div className="options">
            <label><input type="checkbox" /> Remember me</label>
            <a href="#">Forgot your password?</a>
          </div>
        </div>
        <Link to="/admin-login" className="admin-btn">Admin Login</Link>
        <Link to="/superadmin-login" className="superadmin-btn">SuperAdmin Login</Link>
      </div>
    </div>
  );
};

export default ChildLogin;