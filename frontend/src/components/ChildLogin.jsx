import React, { useState, useRef, useEffect } from 'react';
import './../styles/childstyles.css';
import characterImg from './../assets/trail2.png';
import { Link, useNavigate } from 'react-router-dom';

const ChildLogin = () => {
  const [username, setUsername] = useState('');
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

  const validateLogin = () => {
    const userId = digits.join('');
    if (!username || userId.length !== 6) {
      setErrorMessage('Please enter your username and 6-digit code.');
      return;
    }

    setLoading(true);
    fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: username, userId, password: userId }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.token) {
          localStorage.setItem('token', data.token);
          navigate('/game');
        } else {
          setErrorMessage(data.message || 'Invalid credentials!');
        }
      })
      .catch(() => setErrorMessage('Failed to connect. Try again!'))
      .finally(() => setLoading(false));
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
            placeholder="Username"
            className="input-box"
            value={username}
            onChange={e => setUsername(e.target.value)}
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
        <Link to="/admin" className="admin-btn">Admin</Link>
      </div>
    </div>
  );
};

export default ChildLogin;