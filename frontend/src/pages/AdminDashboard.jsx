import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Legend } from 'recharts';
import './Admin.css';

function AdminDashboard() {
  const [chartData, setChartData] = useState([]);
  const [range, setRange] = useState('30days');
  const [stats, setStats] = useState({
    visitors: 0,
    logins: 0,
    registered_users: 0,
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchData(range);
  }, [range]);

  const fetchData = async (range) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/admin-analytics?range=${range}`,
        { withCredentials: true }
      );
      setChartData(res.data.chart_data);
      setStats({
        visitors: res.data.visitors,
        logins: res.data.logins,
        registered_users: res.data.registered_users,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  // Sign Out function
  const handleSignOut = async () => {
    try {
      await axios.post('http://localhost:5000/api/logout', {}, { withCredentials: true });
      navigate('/register'); // redirect to register page
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Sign Out Button */}
      <button className="signout-btn" onClick={handleSignOut}>
        Sign Out →
      </button>

      <img src="/images/App_logo.jpg" alt="Logo" className="logo" />
      <h2>Admin Dashboard - Site Activity Overview</h2>

      <div className="stats">
        <div className="card"><strong>Total Visitors:</strong> {stats.visitors}</div>
        <div className="card"><strong>Total Logins:</strong> {stats.logins}</div>
        <div className="card"><strong>Registered Users:</strong> {stats.registered_users}</div>
      </div>

      <select onChange={(e) => setRange(e.target.value)} value={range}>
        <option value="week">This Week</option>
        <option value="30days">Last 30 Days</option>
        <option value="3months">Last 3 Months</option>
        <option value="year">Last Year</option>
      </select>

      <h3>Visitors Over Time</h3>
      <LineChart width={700} height={300} data={chartData}>
        <XAxis dataKey="date" />
        <YAxis />
        <CartesianGrid stroke="#ccc" />
        <Tooltip />
        <Line type="monotone" dataKey="visitors" stroke="#3e4b36" />
      </LineChart>

      <h3>Logins Over Time</h3>
      <BarChart width={700} height={300} data={chartData}>
        <XAxis dataKey="date" />
        <YAxis />
        <CartesianGrid stroke="#ccc" />
        <Tooltip />
        <Legend />
        <Bar dataKey="logins" fill="#3e4b36" />
      </BarChart>
    </div>
  );
}

export default AdminDashboard;
