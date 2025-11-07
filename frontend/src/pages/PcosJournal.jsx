import React, { useState, useEffect } from "react";
import axios from "axios";
import './Journal.css';

// Emoji options
const emojis = [
  { label: "Happy", icon: "😄", color: "#4CAF50" },
  { label: "Average", icon: "🙂", color: "#CDDC39" },
  { label: "Low", icon: "😕", color: "#FFEB3B" },
  { label: "Sad", icon: "😞", color: "#FF9800" },
  { label: "Very Low", icon: "😢", color: "#F44336" },
];

// Mood values for averaging
const moodValues = {
  "Very Low": 1,
  "Low": 2,
  "Sad": 3,
  "Average": 4,
  "Happy": 5
};

// Mood tips
const moodTips = {
  "Happy": "Great job! Keep doing what makes you feel good.",
  "Average": "Try some light exercise or journaling to lift your mood.",
  "Low": "Consider a walk, calling a friend, or doing something creative.",
  "Sad": "Take a break, rest, or talk to someone you trust. You're not alone.",
  "Very Low": "Please take care. Reach out to a therapist or support group if you need help."
};

function PcosJournal() {
  // Inputs
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [cycle, setCycle] = useState("");
  const [date, setDate] = useState("");
  const [mood, setMood] = useState("");
  const [entry, setEntry] = useState("");

  const [entries, setEntries] = useState([]);
  const [moodTip, setMoodTip] = useState("");

  const userId = localStorage.getItem("userEmail"); // logged-in user's email

  useEffect(() => {
    if (userId) fetchEntries(); // fetch only if logged in
  }, []);

  // Fetch user's journal entries
  const fetchEntries = async () => {
    if (!userId) return; // No user logged in
    try {
      const res = await axios.get(`http://localhost:5000/api/entries?user_id=${userId}`);
      setEntries(res.data.entries);
    } catch (err) {
      console.log(err);
    }
  };

  // Add a new entry
  const handleAddEntry = async () => {
    // Check required fields
    if (!age || !weight || !cycle || !date || !mood || !entry) {
      alert("Please fill all fields!");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/entries", {
        user_id: userId,
        age,
        weight,
        cycle,
        date,
        mood,
        entry
      });

      // Clear inputs
      setAge(""); setWeight(""); setCycle(""); setDate(""); setMood(""); setEntry("");

      fetchEntries(); // Refresh entries
      setMoodTip(moodTips[mood]); // Show tip
    } catch (err) {
      console.log(err);
    }
  };

  const getEmojiByLabel = (label) => {
    const found = emojis.find(e => e.label === label);
    return found ? found.icon : "";
  };

  // Calculate monthly average mood
  const getMonthlyMoodEmoji = () => {
    const now = new Date();
    const thisMonthMoods = entries
      .filter(e => {
        const entryDate = new Date(e.date);
        return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear();
      })
      .map(e => moodValues[e.mood] || 0);

    if (!thisMonthMoods.length) return "No entries yet";

    const avgMoodValue = thisMonthMoods.reduce((a, b) => a + b, 0) / thisMonthMoods.length;

    const closestMood = Object.entries(moodValues)
      .reduce((prev, curr) => Math.abs(curr[1] - avgMoodValue) < Math.abs(prev[1] - avgMoodValue) ? curr : prev);

    return getEmojiByLabel(closestMood[0]);
  };

  return (
    <>
      <img src="/images/App_logo.jpg" alt="logo" className="logo" />
      <h2>PCOS Mood & Health Tracking Journal</h2>

      <div className="journal-container">
        <div className="input-row">
          <input type="number" placeholder="Age" value={age} onChange={e => setAge(e.target.value)} />
          <input type="text" placeholder="Weight" value={weight} onChange={e => setWeight(e.target.value)} />
          <input type="text" placeholder="Period Cycle Length" value={cycle} onChange={e => setCycle(e.target.value)} />
        </div>

        {/* Instruction for Date */}
        <p className="input-instruction">Select today's date:</p>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />

        {/* Instruction for Mood */}
        <p className="input-instruction">Select your today's mood:</p>
        <div className="emoji-container">
          {emojis.map((e, i) => (
            <span
              key={i}
              className={`emoji ${mood === e.label ? "selected" : ""}`}
              style={{ color: e.color }}
              onClick={() => setMood(e.label)}
            >
              {e.icon}
            </span>
          ))}
        </div>

        <textarea
          rows="4"
          placeholder="Write about your day..."
          value={entry}
          onChange={e => setEntry(e.target.value)}
        ></textarea>

        <button className="add-entry-btn" onClick={handleAddEntry}>Add your Entry</button>

        {moodTip && (
          <div className="mood-tip-box">
            <h4>💡 Mood Tip</h4>
            <p>{moodTip}</p>
          </div>
        )}
      </div>

      <div className="mood-summary">
        <h3>Your this Month Period Mood</h3>
        <span className="monthly-emoji" style={{ fontSize: "2rem" }}>
          {getMonthlyMoodEmoji()}
        </span>
      </div>

      <div className="previous-entries">
        <h3>Your Previous Entries (Last 3)</h3>
        {entries.slice(-3).reverse().map((e, i) => (
          <div key={i} className="entry-item">
            <strong>{e.date}</strong> - <span style={{ fontSize: "1.5rem" }}>{getEmojiByLabel(e.mood)}</span>
          </div>
        ))}
      </div>
    </>
  );
}

export default PcosJournal;
