import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './Register_Login.css';

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [popup, setPopup] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Helper function to show popup and hide after 3 seconds
  const showPopup = (message) => {
    setPopup(message);
    setTimeout(() => setPopup(''), 3000);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setPopup('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/login', form);

      // Successful login
      if (res.status === 200 && res.data.message === 'Login successful') {
        showPopup(`Welcome back, ${res.data.user.name}!`);

        // Store user info in localStorage
        localStorage.setItem('user', JSON.stringify(res.data.user));
        localStorage.setItem('userEmail', res.data.user.email); // store email correctly

        // Navigate to Home after a short delay (same as popup duration)
        setTimeout(() => {
          navigate('/Home');
        }, 1200);
      }
    } catch (err) {
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="register-login-container">
      <img src="/images/App_logo.jpg" alt="Logo" className="logo" />

      <form onSubmit={handleSubmit} className="register-login-box">
        <h2>Log In</h2>

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />

        <div className="password-container">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
          />
          <span className="toggle-eye" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <button type="submit">Log In</button>

        <div className="Register_Forgot_Password">
          <span onClick={() => navigate('/Register')} style={{ cursor: "pointer" }}>Sign Up</span>
          <span onClick={() => navigate('/ForgotPassword')} style={{ cursor: "pointer" }}>Forgot Password?</span>
        </div>

        {error && <p className="error">{error}</p>}
        {popup && <p className="popup-box">{popup}</p>}
      </form>
    </div>
  );
}

export default Login;
