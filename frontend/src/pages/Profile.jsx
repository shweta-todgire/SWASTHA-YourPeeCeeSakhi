import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Profile = ({ onClose }) => {
  const [profile, setProfile] = useState({
    name: "User Name",
    email: "user123@gmail.com"
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [signoutPopup, setSignoutPopup] = useState(''); // NEW state for popup

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (user?.email) {
      axios
        .get(`http://localhost:5000/api/profile?email=${user.email}`)
        .then((res) => setProfile(res.data))
        .catch((err) => console.error(err));
    }
  }, [user]);

  // Sign Out with popup
  const handleSignOut = () => {
    setSignoutPopup("Signing out...");

    // Remove user data immediately or after delay (better immediately)
    localStorage.removeItem("user");

    setTimeout(() => {
      setSignoutPopup(""); // Clear popup
      navigate("/Login");
    }, 3000); // 3 seconds delay
  };

  // Show confirmation popup
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
    setError("");
  };

  // Show password input after confirmation
  const handleConfirmDelete = () => {
    setShowDeleteConfirm(false);
    setShowPasswordInput(true);
  };

  // Handle Delete Account
  const handleDeleteAccount = () => {
    if (!password.trim()) {
      setError("Password is required");
      return;
    }

    axios
      .post("http://localhost:5000/api/delete-account", {
        email: profile.email,
        password: password
      })
      .then(() => {
        localStorage.removeItem("user");
        navigate("/Register");
      })
      .catch((err) => {
        if (err.response && err.response.status === 401) {
          setError("Wrong password. Please try again.");
        } else {
          setError("Something went wrong. Please try later.");
        }
      });
  };

  return (
    <div className="profile-overlay" onClick={onClose}>
      <div className="profile-page" onClick={(e) => e.stopPropagation()}>
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-name-section">
            <h2>{profile.name}</h2>
          </div>
          <div className="profile-images">
            <img
              src="/images/Assistent.jpg"
              alt="Assistant"
              className="assistent-img"
            />
            <img src="/images/App_logo.jpg" alt="Logo" className="logo-img" />
          </div>
        </div>

        {/* Email */}
        <div className="profile-item">
          <div className="item-left">
            <span>Email</span>
            <p>{profile.email}</p>
          </div>
        </div>

        {/* Sign Out */}
        <div className="signout-section">
          <button className="signout-button" onClick={handleSignOut}>
            Sign Out →
          </button>
        </div>

        {/* Delete Account */}
        <div className="delete-section">
          <button className="delete-btn" onClick={handleDeleteClick}>
            Delete Account
          </button>
        </div>

        {/* Confirmation Popup */}
        {showDeleteConfirm && (
          <div className="popup">
            <p>Are you sure you want to delete your account?</p>
            <button onClick={handleConfirmDelete}>Yes</button>
            <button onClick={() => setShowDeleteConfirm(false)}>No</button>
          </div>
        )}

        {/* Password Input Popup */}
        {showPasswordInput && (
          <div className="popup">
            <p>Enter your password to confirm deletion:</p>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="error-message">{error}</p>}
            <button onClick={handleDeleteAccount}>Delete</button>
            <button onClick={() => setShowPasswordInput(false)}>Cancel</button>
          </div>
        )}

        {/* Sign Out Popup */}
        {signoutPopup && (
          <div className="popup">
            {signoutPopup}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
