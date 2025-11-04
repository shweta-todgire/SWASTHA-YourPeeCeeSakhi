import React, { useState, useEffect } from "react";
import axios from "axios";
import "./CycleTracker.css";

export default function CycleTracker() {
  // Get user from localStorage
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const email = storedUser?.email || "";

  const [periodDate, setPeriodDate] = useState("");
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [phases, setPhases] = useState({});
  const [entries, setEntries] = useState([]);
  const [canGoBack, setCanGoBack] = useState(false);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Add new cycle entry
  const handleAdd = async () => {
    if (!periodDate || !email) return;
    try {
      const res = await axios.post("http://127.0.0.1:5000/api/cycle", {
        email,
        period_date: periodDate,
      });

      setPhases(res.data.phases);

      const d = new Date(periodDate);
      setMonth(d.getMonth());
      setYear(d.getFullYear());
      setCanGoBack(false);

      fetchEntries();
    } catch (err) {
      console.error("Error adding cycle:", err);
    }
  };

  // Fetch previous entries
  const fetchEntries = async () => {
    if (!email) return;
    try {
      const res = await axios.get("http://127.0.0.1:5000/api/cycle", {
        params: { email },
      });
      setEntries(res.data);
    } catch (err) {
      console.error("Error fetching entries:", err);
    }
  };

  useEffect(() => {
    if (!email) {
      alert("You must be logged in to access the tracker.");
      window.location.href = "/login"; // redirect if not logged in
      return;
    }
    fetchEntries();
  }, [email]);

  // Get color based on day and phase data
  const getCircleColor = (day) => {
    if (!phases?.period_days) return "";

    const thisDate = new Date(Date.UTC(year, month, day)).toISOString().substring(0, 10);

    if (phases.period_days.some((d) => d.date === thisDate)) return "period";
    if (phases.ovulation_day?.date === thisDate) return "ovulation";
    if (phases.fertile_window?.some((d) => d.date === thisDate)) return "fertile";
    if (phases.expected_next_period?.some((d) => d.date === thisDate)) return "next-period";

    return "";
  };

  // Calendar navigation
  const goPrevMonth = () => {
    if (canGoBack) {
      setMonth((m) => {
        if (m === 0) {
          setYear((y) => y - 1);
          return 11;
        }
        return m - 1;
      });
      setCanGoBack(false);
    }
  };

  const goNextMonth = () => {
    if (!phases?.expected_next_period?.length) return;

    const npEnd = new Date(phases.expected_next_period.at(-1).date);
    const cycleMonth = new Date(phases.period_days[0].date).getMonth();
    const cycleYear = new Date(phases.period_days[0].date).getFullYear();

    if (
      (npEnd.getMonth() === cycleMonth + 1 && npEnd.getFullYear() === cycleYear) ||
      (cycleMonth === 11 && npEnd.getMonth() === 0 && npEnd.getFullYear() === cycleYear + 1)
    ) {
      setMonth((m) => {
        if (m === 11) {
          setYear((y) => y + 1);
          return 0;
        }
        return m + 1;
      });
      setCanGoBack(true);
    }
  };

  return (
    <div className="tracker-container">
      <img src="/images/App_logo.jpg" alt="Logo" className="logo" />
      <h2 className="heading">Track Your Cycle</h2>
      <i className="itallic">Add Your Period Date</i>

      {/* Period Date Input */}
      <div className="date-input">
        <input
          type="date"
          value={periodDate}
          onChange={(e) => setPeriodDate(e.target.value)}
        />
        <button onClick={handleAdd}>Add</button>
      </div>

      {/* Calendar Navigation */}
      <div className="calendar-nav">
        <button onClick={goPrevMonth} disabled={!canGoBack}>
          {"<"}
        </button>
        <span>
          {new Date(year, month).toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </span>
        <button onClick={goNextMonth}>{">"}</button>
      </div>

      {/* Calendar Grid */}
      <div className="calendar-grid">
        {daysArray.map((day) => (
          <div
            key={day}
            className={`circle ${getCircleColor(day)}`}
            title={`${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Color Legend */}
      <div className="legend">
        <div><span className="box period"></span> Period Days</div>
        <div><span className="box ovulation"></span> Ovulation</div>
        <div><span className="box fertile"></span> Fertile Window</div>
        <div><span className="box next-period"></span> Next Expected Period</div>
      </div>

      {/* Previous Entries Table */}
      <p className="table-heading">Previous 3 Months Entries</p>
      <table>
        <thead>
          <tr>
            <th>Period Date</th>
            <th>Ovulation</th>
            <th>Fertile Window</th>
            <th>Next Period</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e, idx) => (
            <tr key={idx}>
              <td>{e.period_date}</td>
              <td>{e.phases?.ovulation_day?.date || "-"}</td>
              <td>
                {e.phases?.fertile_window
                  ?.map((day) => day.date)
                  .join(" - ") || "-"}
              </td>
              <td>
                {e.phases?.expected_next_period
                  ?.map((day) => day.date)
                  .join(" - ") || "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}