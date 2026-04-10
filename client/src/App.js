import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const EMISSION_FACTORS = { car: 0.24, flight: 0.15, electricity: 0.5, meat: 7.0 };
const COLORS = ['#26a69a', '#29b6f6', '#ff7043', '#9ccc65'];
const COMMUNITY_AVG = 52.00;

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activity, setActivity] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('car');
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [weeklyGoal, setWeeklyGoal] = useState(100);

  const handleAuth = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? 'login' : 'signup';
    try {
      const res = await axios.post(`http://localhost:5000/api/auth/${endpoint}`, { username, password });
      if (isLogin) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
      } else {
        alert("Account created!");
        setIsLogin(true);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Auth failed");
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setLogs([]);
  };

  const fetchLogs = async () => {
    if (!token) return;
    try {
      const res = await axios.get('http://localhost:5000/api/carbon/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogs(res.data);
    } catch (err) {
      if (err.response?.status === 401) logout();
    }
  };

  useEffect(() => { fetchLogs(); }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const calculatedAmount = parseFloat((Number(amount) * EMISSION_FACTORS[category]).toFixed(2));
    try {
      await axios.post('http://localhost:5000/api/carbon/add', 
        { activity: `${category.toUpperCase()}: ${activity}`, amount: calculatedAmount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActivity(''); setAmount(''); fetchLogs();
    } catch (err) {
      alert('Error logging data');
    }
  };

  const totalCO2 = logs.reduce((sum, log) => sum + log.amount, 0);
  const goalProgress = Math.min((totalCO2 / weeklyGoal) * 100, 100);
  
  const categoryTotals = logs.reduce((acc, log) => {
    const cat = log.activity.split(':')[0].toLowerCase();
    acc[cat] = (acc[cat] || 0) + log.amount;
    return acc;
  }, {});

  const getInsight = () => {
    if (logs.length === 0) return "Start logging to see your environmental impact!";
    const highest = Object.keys(categoryTotals).reduce((a, b) => categoryTotals[a] > categoryTotals[b] ? a : b);
    const tips = {
      car: "🚗 Your car trips are the main driver. Try carpooling!",
      flight: "✈️ Air travel has a heavy footprint. Consider offsets.",
      electricity: "⚡ Electricity use is high. Try eco-mode on appliances.",
      meat: "🥩 Plant-based meals once a week can reduce impact by 15%!"
    };
    return tips[highest];
  };

  const chartData = Object.entries(categoryTotals).map(([name, value]) => ({
    name: name.toUpperCase(),
    value: parseFloat(value.toFixed(2))
  })).filter(item => item.value > 0);

  const glassStyle = {
    background: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
    padding: '25px',
    marginBottom: '25px',
    border: '1px solid rgba(255, 255, 255, 0.18)'
  };

  if (!token) {
    return (
      <div style={{ 
        display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', 
        background: 'linear-gradient(135deg, #e0f2f1 0%, #b2dfdb 100%)', fontFamily: '"Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{ ...glassStyle, width: '380px', textAlign: 'center' }}>
          <h2 style={{ color: '#00796b', marginBottom: '10px' }}>{isLogin ? 'Welcome Back' : 'Join the Movement'}</h2>
          <p style={{ color: '#555', fontSize: '14px', marginBottom: '25px' }}>Track. Reduce. Restore.</p>
          <form onSubmit={handleAuth} style={{ display: 'grid', gap: '15px' }}>
            <input placeholder="Username" onChange={(e) => setUsername(e.target.value)} required style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
            <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
            <button type="submit" style={{ padding: '12px', background: '#26a69a', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>
              {isLogin ? 'Login' : 'Sign Up'}
            </button>
          </form>
          <p onClick={() => setIsLogin(!isLogin)} style={{ color: '#00796b', cursor: 'pointer', marginTop: '20px', fontSize: '14px' }}>
            {isLogin ? "New here? Create an account" : "Already have an account? Sign in"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', background: 'linear-gradient(160deg, #f1f8e9 0%, #e0f2f1 100%)', 
      fontFamily: '"Segoe UI", Roboto, sans-serif', padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <button onClick={logout} style={{ float: 'right', background: '#ff5252', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}>Logout</button>
        <h1 style={{ color: '#2d4d4a', fontSize: '32px', marginBottom: '30px' }}>EcoTracker 🌱</h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div style={{ ...glassStyle, borderLeft: '10px solid #ffca28' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#f57f17' }}>💡 Personalized Insight</h4>
            <p style={{ margin: 0, color: '#444' }}>{getInsight()}</p>
          </div>
          <div style={{ ...glassStyle, borderLeft: '10px solid #42a5f5' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#1565c0' }}>👥 Community Bench</h4>
            <p style={{ margin: 0, color: '#444' }}>
              {totalCO2 < COMMUNITY_AVG ? "🌟 You're performing better than average!" : "🌿 A few small changes could get you below average."}
            </p>
          </div>
        </div>

        <div style={glassStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontWeight: 'bold', color: '#2d4d4a' }}>
            <span>Weekly Target Progress</span>
            <span>{totalCO2.toFixed(1)} / {weeklyGoal} kg CO₂</span>
          </div>
          <div style={{ height: '20px', background: '#e0e0e0', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ width: `${goalProgress}%`, height: '100%', background: totalCO2 > weeklyGoal ? '#ef5350' : '#66bb6a', transition: 'width 0.8s ease' }}></div>
          </div>
          <div style={{marginTop: '15px'}}>
             <label style={{fontSize: '14px', marginRight: '10px'}}>Adjust Goal:</label>
             <input type="number" value={weeklyGoal} onChange={(e) => setWeeklyGoal(e.target.value)} style={{ padding: '5px', borderRadius: '5px', border: '1px solid #ccc', width: '70px' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '25px' }}>
          <div style={{ ...glassStyle }}>
            <h3 style={{marginTop: 0, color: '#00796b'}}>Breakdown</h3>
            <div style={{ height: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value">
                    {chartData.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ ...glassStyle }}>
            <h3 style={{marginTop: 0, color: '#00796b'}}>Record Activity</h3>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px' }}>
              <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd', appearance: 'none', background: 'white url("data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23666%22%20stroke-width%3D%223%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E") no-repeat 95% center' }}>
                <option value="car">🚗 Vehicle (km)</option>
                <option value="flight">✈️ Flight (km)</option>
                <option value="electricity">⚡ Energy (kWh)</option>
                <option value="meat">🥩 Meat (kg)</option>
              </select>
              <input placeholder="Activity Name" value={activity} onChange={(e) => setActivity(e.target.value)} required style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
              <input placeholder="Amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
              <button type="submit" style={{ padding: '12px', background: '#2d4d4a', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Add Log</button>
            </form>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          {['all', 'car', 'flight', 'electricity', 'meat'].map(cat => (
            <button key={cat} onClick={() => setFilter(cat)} style={{ padding: '8px 16px', margin: '0 5px', borderRadius: '20px', border: 'none', background: filter === cat ? '#26a69a' : '#fff', color: filter === cat ? '#fff' : '#666', cursor: 'pointer', fontWeight: 'bold' }}>
              {cat.toUpperCase()}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gap: '12px' }}>
          {logs.filter(log => filter === 'all' || log.activity.toLowerCase().includes(filter)).map((log) => (
            <div key={log._id} style={{ ...glassStyle, padding: '15px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '18px', marginRight: '10px' }}>{log.activity.includes('CAR') ? '🚗' : log.activity.includes('FLIGHT') ? '✈️' : log.activity.includes('ELECTRICITY') ? '⚡' : '🥩'}</span>
                <span style={{ fontWeight: '600', color: '#444' }}>{log.activity}</span>
              </div>
              <span style={{ fontWeight: 'bold', color: '#00796b', fontSize: '18px' }}>{log.amount} kg</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;