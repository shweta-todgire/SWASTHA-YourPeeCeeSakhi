import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './Register_Login.css';

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [popup, setPopup] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const err = {};
    if (!form.name.trim() || /\d/.test(form.name)) err.name = "Name must be a valid string";
    if (!form.email.includes('@')) err.email = "Invalid email format";
    if (form.password.length < 6 || form.password.length > 12) err.password = "Password must be 6–12 characters";
    return err;
  };

  const showPopup = (message) => {
    setPopup(message);
    setTimeout(() => setPopup(''), 3000);  // Clear popup after 3 seconds
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
    setPopup('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (Object.keys(err).length > 0) return setErrors(err);

    try {
      // Check if email already exists
      const check = await axios.post('http://localhost:5000/api/check-email', { email: form.email });
      if (check.status === 200) {
        showPopup("Email already exists, please login.");
        return;
      }
    } catch (err) {
      // email not found, continue with registration
    }

    try {
      const res = await axios.post('http://localhost:5000/api/register', form);
      alert('Registration successful! Please Login.');
      navigate('/Login');
    } catch (error) {
      console.error(error);
      alert("Something went wrong!");
    }
  };

  return (
    <div className="register-login-container">
      <img src="/images/App_logo.jpg" alt="Logo" className='logo' />
      <h1 className='welcom-heading'>Welcome to <span className="highlight">Swastha..</span></h1>
      <p className="welcome-subtext">
        Your <strong>PeeCeeSakhi</strong> is here to help you track, manage & understand your PCOS journey with care!
      </p>
      <form onSubmit={handleSubmit} className="register-login-box">
        <h2>Create an Account</h2>

        <input name="name" placeholder="Enter Your Name" value={form.name} onChange={handleChange} />
        {errors.name && <p className="error">{errors.name}</p>}

        <input name="email" placeholder="Enter Your Email" value={form.email} onChange={handleChange} />
        {errors.email && <p className="error">{errors.email}</p>}

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
        {errors.password && <p className="error">{errors.password}</p>}

        <button type="submit">Sign Up</button>

        <p className="admin-login-redirect">
          Already have an Account?{" "}
          <span onClick={() => navigate('/Login')}>Login</span>
        </p>
        <p className="admin-login-redirect">
          Logged in with Admin account{" "}
          <span onClick={() => navigate('/AdminLogin')}>Login</span>
        </p>

        {popup && <p className="popup-box">{popup}</p>}
      </form>
    </div>
  );
}

export default Register;
