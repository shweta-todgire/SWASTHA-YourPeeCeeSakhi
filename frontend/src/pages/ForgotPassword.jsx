import React, { useState } from 'react';
import axios from 'axios';
import './Register_Login.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Helper to show popup and clear after 3 seconds
  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email.");
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/send-reset-link', { email });
      showMessage(res.data.message);
      setError('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Server error while sending email.');
      setMessage('');
    }
  };

  return (
    <div className="register-login-container">
      <img src="/images/App_logo.jpg" alt="Logo" className="logo" />

      <form onSubmit={handleSubmit} className="register-login-box">
        <h2>Forgot Password</h2>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button type="submit">Send Reset Link</button>

        {message && <p className="popup-box">{message}</p>}
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}

export default ForgotPassword;
