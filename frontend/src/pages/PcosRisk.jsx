import React, { useState } from "react";
import "./PcosRisk.css";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const questions = [
  { key: "period_cycle", text: "After how many days do you get your periods?", type: "number" },
  { key: "hair_growth", text: "Do you have excessive body/facial hair growth?", type: "boolean" },
  { key: "skin_darkening", text: "Do you notice skin darkening recently?", type: "boolean" },
  { key: "hair_loss", text: "Do you face hair thinning or baldness?", type: "boolean" },
  { key: "acne", text: "Do you have acne/pimples?", type: "boolean" },
  { key: "mood_swings", text: "Do you experience mood swings?", type: "boolean" },
  { key: "weight_gain", text: "Have you experienced sudden/unexplained weight gain?", type: "boolean" },
];

function PcosRisk() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [riskPercent, setRiskPercent] = useState(0);
  const [finished, setFinished] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);

  const userEmail = localStorage.getItem("userEmail") || "";

  // Rule-based risk calculation (frontend)
  const calculateLocalRisk = (answersObj) => {
    let risk = 0;
    const period_cycle = Number(answersObj.period_cycle) || 28;
    if (period_cycle < 25 || period_cycle > 35) risk += 20;
    if (answersObj.hair_growth === 1) risk += 15;
    if (answersObj.skin_darkening === 1) risk += 10;
    if (answersObj.hair_loss === 1) risk += 15;
    if (answersObj.acne === 1) risk += 15;
    if (answersObj.mood_swings === 1) risk += 10;
    if (answersObj.weight_gain === 1) risk += 15;
    return Math.min(risk, 100);
  };

  // Only save to backend after last question
  const saveFinalRisk = async (finalRisk) => {
    if (!userEmail) {
      alert("User email not found. Please login first.");
      return;
    }
    try {
      setLoading(true);
      await fetch("http://localhost:5000/api/risk-prediction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, features: answers }),
      });
    } catch (err) {
      console.error("Error saving final risk:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (value) => {
    const currentQ = questions[step];
    if (currentQ.type === "number" && (value === "" || isNaN(value))) {
      alert("Please enter a valid number.");
      return;
    }

    const newAnswers = { ...answers, [currentQ.key]: value };
    setAnswers(newAnswers);

    // Calculate risk live for progress bar
    const localRisk = calculateLocalRisk(newAnswers);
    setRiskPercent(localRisk);

    setInputValue("");
    if (step + 1 < questions.length) {
      setStep(step + 1);
    } else {
      setFinished(true);
      await saveFinalRisk(localRisk); // store final risk only
    }
  };

  const renderTips = () => {
    if (riskPercent <= 30) {
      return (
        <div className="tips-box">
          <h2>💚 Low Risk Tips</h2>
          <ul>
            <li>🥗 <b>Balanced Diet:</b> Eat whole grains, fruits, vegetables, and lean proteins. Limit sugar.</li>
            <li>🏃‍♀️ <b>Stay Active:</b> 30 min of exercise 5x/week.</li>
            <li>😌 <b>Manage Stress:</b> Yoga, meditation, or mindful breathing.</li>
            <li>🛌 <b>Sleep Well:</b> 7–9 hours per night for hormone balance.</li>
          </ul>
        </div>
      );
    } else if (riskPercent <= 60) {
      return (
        <div className="tips-box">
          <h2>🟡 Moderate Risk Tips</h2>
          <ul>
            <li>🥦 <b>PCOS-Friendly Diet:</b> Reduce sugar, eat fiber-rich foods.</li>
            <li>🧘‍♀️ <b>Exercise & Stress Management:</b> Stay consistent with routine.</li>
            <li>🩺 <b>Health Checkups:</b> Monitor hormonal and metabolic levels.</li>
            <li>🔁 <b>Establish Routine:</b> Sleep, diet, and exercise consistency.</li>
          </ul>
        </div>
      );
    } else {
      return (
        <div className="tips-box">
          <h2>🔴 High Risk Tips</h2>
          <ul>
            <li>🩺 <b>Consult Specialist:</b> See a gynecologist or endocrinologist.</li>
            <li>💊 <b>Understand Treatment:</b> Know your options.</li>
            <li>🍲 <b>Strict Diet Changes:</b> Focus on low glycemic index foods.</li>
            <li>🧘‍♀️ <b>Consistent Activity:</b> Daily physical activity recommended.</li>
            <li>🤝 <b>Emotional Support:</b> Therapy or support groups.</li>
            <li>🧠 <b>Stay Informed:</b> Track symptoms and progress.</li>
          </ul>
        </div>
      );
    }
  };

  return (
    <div className="pcos-container">
      <img src="/images/App_logo.jpg" alt="Logo" className="logo" />
      <h1 className="heading">PCOS Risk Detection</h1>

      {finished ? (
        <div className="result">
          <div className="circular-chart" style={{ maxWidth: 200 }}>
            <CircularProgressbar
              value={riskPercent}
              text={`${riskPercent}%`}
              styles={buildStyles({
                textSize: "18px",
                pathColor: riskPercent > 60 ? "#ff4d4f" : riskPercent > 25 ? "#ffc107" : "#28a745",
                textColor: "#333",
                trailColor: "#eee",
              })}
            />
          </div>
          {renderTips()}
        </div>
      ) : (
        <div className="question-box">
          <p>{questions[step].text}</p>
          {questions[step].type === "boolean" ? (
            <div className="btn-group">
              <button onClick={() => handleAnswer(1)} disabled={loading}>Yes</button>
              <button onClick={() => handleAnswer(0)} disabled={loading}>No</button>
            </div>
          ) : (
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAnswer(Number(inputValue))}
              placeholder="Enter value"
              className="input-section"
              disabled={loading}
            />
          )}
          {/* Live progress bar */}
          <div className="progress">
            <div
              className="progress-fill"
              style={{
                width: `${riskPercent}%`,
                background: "#394931",
              }}
            />
          </div>
          <p className="progress-text">{riskPercent}% PCOS Risk</p>
        </div>
      )}
    </div>
  );
}

export default PcosRisk;
