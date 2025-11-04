import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/verify-otp', { email, otp });
      alert("Email verified! You can now login.");
      navigate('/login');
    } catch (err) {
      setError("Invalid OTP. Please try again.");
    }
  };

  return (
    <div className="otp-container">
      <h2>Verify Your Email</h2>
      <p>OTP sent to <b>{email}</b></p>
      <form onSubmit={handleSubmit}>
        <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter OTP" />
        <button type="submit">Verify</button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default VerifyOTP;
