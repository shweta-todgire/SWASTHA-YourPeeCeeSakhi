import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Recomendations.css";

const moodColors = {
  "Happy": "#394931",
  "Average": "#94a020ff",
  "Low": "#28ab97ff",
  "Sad": "#b97714ff",
  "Very Low": "#F44336",
  "No Data": "#929090ff"
};

function Recommendations() {
  const userId = localStorage.getItem("userEmail");
  const [recommendations, setRecommendations] = useState({});
  const [overallMood, setOverallMood] = useState("No Data");
  const [lastCycles, setLastCycles] = useState([]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/recommendations?email=${userId}`);
        setRecommendations(res.data.recommendations);
        setOverallMood(res.data.overall_mood);
        setLastCycles(res.data.last_cycles || []);
      } catch (err) {
        console.log(err);
      }
    };
    fetchRecommendations();
  }, [userId]);

  return (
    <div className="recommendations-container">
      <img 
          src="images/App_logo.jpg" 
          alt="Logo" 
          className="logo" 
        />
      <h2 style={{ color: moodColors[overallMood] }}>
        🌸 Overall Mood: {overallMood}
      </h2>

      {lastCycles.length > 0 && (
        <p>🩸 Last Cycle Length (days): {lastCycles.join(", ")}</p>
      )}
      {lastCycles[0] === "No data" && (
        <p>🩸 No period entries found. Track your cycle in your journal to get personalized recommendations.</p>
      )}

      <div className="recommendation-cards">
        {Object.entries(recommendations).map(([category, tips], idx) => (
          <div key={idx} className="rec-card">
            <h3>{category}</h3>
            <ul>
              {tips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Recommendations;
