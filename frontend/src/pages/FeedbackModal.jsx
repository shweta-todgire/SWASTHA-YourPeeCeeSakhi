import React, { useState } from "react";
import axios from "axios";
import './Home.css';

const FeedbackModal = ({ onClose }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");

  // ✅ Get logged-in user's email from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const userEmail = user?.email || "";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rating || !comment.trim()) {
      setMessage("Please provide a rating and a comment");
      return;
    }

    if (!userEmail) {
      setMessage("User email not found. Please log in.");
      return;
    }

    try {
      const response = await axios.post("http://127.0.0.1:5000/api/feedback", {
        email: userEmail, // ✅ Now using actual logged-in user email
        rating,
        comment,
      });

      setMessage(response.data.message);
      alert("Feedback submitted successfully");
      onClose();
    } catch (error) {
      if (error.response) {
        setMessage(error.response.data.message || error.response.data.error);
      } else {
        setMessage("Server not reachable");
      }
      console.error("Error submitting feedback:", error);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Give Feedback</h3>

        {/* Stars */}
        <div className="stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              onClick={() => setRating(star)}
              style={{
                color: star <= rating ? "#156407ff" : "#828282ff",
                fontSize: "24px",
                cursor: "pointer",
              }}
            >
              ★
            </span>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          className="feedback-textarea"
          placeholder="Your feedback"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        ></textarea>

        {/* Buttons */}
        <div className="modal-buttons">
          <button className="modal-btn" onClick={handleSubmit}>Submit</button>
          <button className="modal-btn" onClick={onClose}>Close</button>
        </div>

        {message && <p style={{ color: "red" }}>{message}</p>}
      </div>
    </div>
  );
};

export default FeedbackModal;
