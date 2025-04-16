import React, { useState, useEffect } from 'react';
import './../styles/admin.css';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [emotionTrends, setEmotionTrends] = useState([]);
  const [gameReports, setGameReports] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:3000/children')
      .then(res => res.json())
      .then(data => setChildren(data))
      .catch(error => console.error('Error fetching children:', error));
  }, []);

  const handleChildSelect = (userId) => {
    setSelectedChild(userId);
    fetch(`http://localhost:3000/emotion-trends/${userId}`)
      .then(res => res.json())
      .then(data => setEmotionTrends(data))
      .catch(error => console.error('Error fetching trends:', error));
    fetchGameReport(userId);
  };

  const fetchGameReport = (userId) => {
    fetch(`http://localhost:3000/game-reports/${userId}`)
      .then(res => res.json())
      .then(data => setGameReports(data))
      .catch(error => console.error('Error fetching game reports:', error));
  };

  const handleSearch = () => {
    const child = children.find(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (child) {
      handleChildSelect(child.userId);
    } else {
      alert('Child not found');
    }
  };

  return (
    <div className="admin-container">
      <h1>Admin Panel</h1>
      <div className="admin-content">
        <div className="child-selector">
          <h2>Search Child</h2>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Enter child name"
          />
          <button onClick={handleSearch}>Search</button>
          <select value={selectedChild || ''} onChange={e => handleChildSelect(e.target.value)}>
            <option value="">Select a child</option>
            {children.map(child => (
              <option key={child.userId} value={child.userId}>
                {child.name} ({child.userId})
              </option>
            ))}
          </select>
        </div>

        {selectedChild && (
          <>
            <div className="emotion-trends">
              <h2>Emotion Trends</h2>
              {emotionTrends.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Date/Time</th>
                      <th>Emotion</th>
                      <th>Question</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emotionTrends.map((trend, index) => (
                      <tr key={index}>
                        <td>{new Date(trend.timestamp).toLocaleString()}</td>
                        <td>{trend.emotion}</td>
                        <td>{trend.question}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No emotion data available for this child.</p>
              )}
            </div>

            <div className="game-reports">
              <h2>Game Reports</h2>
              <button onClick={() => fetchGameReport(selectedChild)}>Get Report</button>
              {gameReports.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Completed At</th>
                      <th>Score</th>
                      <th>Emotions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gameReports.map((report, index) => (
                      <tr key={index}>
                        <td>{new Date(report.completedAt).toLocaleString()}</td>
                        <td>{report.score}</td>
                        <td>{report.emotions.join(', ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No game reports available for this child.</p>
              )}
            </div>
          </>
        )}
      </div>
      <button onClick={() => navigate('/')} className="back-btn">Back to Login</button>
    </div>
  );
};

export default Admin;