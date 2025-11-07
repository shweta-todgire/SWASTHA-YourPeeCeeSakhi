import React, { useState } from "react";
import "./PcosRisk.css";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const questions = [
  { key: "cycle_irregularity", text: "Are your periods irregular?", type: "boolean" },
  { key: "acne", text: "Do you have frequent acne or pimples?", type: "boolean" },
  { key: "hair_growth", text: "Do you have excessive body/facial hair growth?", type: "boolean" },
  { key: "hair_loss", text: "Do you experience scalp hair thinning or loss?", type: "boolean" },
  { key: "skin_darkening", text: "Do you notice dark patches on skin?", type: "boolean" },
  { key: "weight_gain", text: "Have you experienced sudden or unexplained weight gain?", type: "boolean" },
  { key: "pain", text: "Do you experience pelvic pain or discomfort?", type: "boolean" },
];

function PcosRisk() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [riskPercent, setRiskPercent] = useState(0);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(false);

  const userEmail = localStorage.getItem("userEmail") || "";

  const handleAnswer = async (value) => {
    const currentQ = questions[step];
    const newAnswers = { ...answers, [currentQ.key]: value };
    setAnswers(newAnswers);

    if (step + 1 < questions.length) {
      setStep(step + 1);
    } else {
      setFinished(true);
      await saveFinalRisk(newAnswers); // get risk from backend only
    }
  };

  const displayRisk = riskPercent < 10 ? 0 : riskPercent;

  const saveFinalRisk = async (answersObj) => {
    if (!userEmail) return alert("User email not found. Please login first.");
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/risk-prediction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, features: answersObj }),
      });
      const data = await res.json();
      if (data["ML Predicted Risk (%)"] !== undefined) {
        setRiskPercent(data["ML Predicted Risk (%)"]);
      }
    } catch (err) {
      console.error("Error saving risk:", err);
    } finally {
      setLoading(false);
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
      <img src="/images/App_logo.jpg" alt="logo" className="home-logo" />
      <h1>PCOS Risk Detection</h1>
      {finished ? (
        <div className="result">
          <div className="circular-chart">
            <CircularProgressbar
              value={displayRisk}
              text={`${displayRisk}%`}
              styles={buildStyles({
                pathColor: riskPercent > 60 ? "#ff4d4f" : riskPercent > 30 ? "#ffc107" : "#28a745",
                textColor: "#333",
                textSize: "18px",
              })}
            />
          </div>
          {renderTips()}
        </div>
      ) : (
        <div className="question-box">
          <p>{questions[step].text}</p>
          <div className="btn-group">
            <button onClick={() => handleAnswer(1)} disabled={loading}>Yes</button>
            <button onClick={() => handleAnswer(0)} disabled={loading}>No</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PcosRisk;
