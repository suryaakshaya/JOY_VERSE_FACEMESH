import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import '../styles/admin.css';

const Admin = () => {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [emotionTrends, setEmotionTrends] = useState([]);
  const [gameReports, setGameReports] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [registerChild, setRegisterChild] = useState({
    childName: '',
    phone: '',
    userId: '',
  });
  const [editChild, setEditChild] = useState(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingReports, setIsFetchingReports] = useState(false);
  const navigate = useNavigate();
  const socket = io('http://localhost:3000', { transports: ['websocket'], reconnectionAttempts: 5 });

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      console.log('No admin_token, redirecting to /admin-login');
      navigate('/admin-login');
      return;
    }

    fetchChildren(token);

    socket.on('connect', () => console.log('Socket.IO connected'));
    socket.on('connect_error', (err) => console.error('Socket.IO connection error:', err.message));
    socket.on('emotionUpdate', ({ parentId, userId, emotion, question, timestamp }) => {
      if (parentId === localStorage.getItem('admin_id') && userId === selectedChild) {
        setEmotionTrends(prev => [...prev, { emotion, question, timestamp }]);
      }
    });
    socket.on('gameReportUpdate', ({ parentId, userId, score, emotions, question, isCorrect, completedAt }) => {
      if (parentId === localStorage.getItem('admin_id') && userId === selectedChild) {
        setGameReports(prev => [...prev, { score, emotions, question, isCorrect, completedAt }]);
      }
    });
    socket.on('newChild', ({ parentId, child }) => {
      if (parentId === localStorage.getItem('admin_id')) {
        setChildren(prev => [child, ...prev]);
      }
    });
    socket.on('childUpdated', ({ parentId, child }) => {
      if (parentId === localStorage.getItem('admin_id')) {
        setChildren(prev => prev.map(c => (c._id === child._id ? child : c)));
      }
    });
    socket.on('childDeleted', ({ parentId, childId }) => {
      if (parentId === localStorage.getItem('admin_id')) {
        setChildren(prev => prev.filter(c => c._id !== childId));
      }
    });
    socket.on('childStatusUpdated', ({ parentId, child }) => {
      if (parentId === localStorage.getItem('admin_id')) {
        setChildren(prev => prev.map(c => (c._id === child._id ? child : c)));
      }
    });

    return () => socket.disconnect();
  }, [navigate, selectedChild]);

  const fetchChildren = async (token) => {
    try {
      const res = await axios.get('http://localhost:3000/admin/children', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Fetched children:', res.data);
      setChildren(res.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching children:', error.response?.data || error.message);
      setMessage('Error fetching children');
      setIsLoading(false);
    }
  };

  const handleChildSelect = async (userId) => {
    setSelectedChild(userId);
    console.log('Selected child userId:', userId);
    setIsFetchingReports(true);
    const token = localStorage.getItem('admin_token');
    try {
      const res = await axios.get(`http://localhost:3000/child/emotion-trends/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Emotion trends response:', res.data);
      setEmotionTrends(res.data || []);
    } catch (error) {
      console.error('Error fetching emotion trends:', error.response?.data || error.message);
      setMessage('Error fetching emotion trends');
      setEmotionTrends([]);
    }
    await fetchGameReport(userId);
    setIsFetchingReports(false);
  };

  const fetchGameReport = async (userId) => {
    const token = localStorage.getItem('admin_token');
    try {
      const res = await axios.get(`http://localhost:3000/child/game-reports/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Game reports response:', res.data);
      setGameReports(res.data || []);
    } catch (error) {
      console.error('Error fetching game reports:', error.response?.data || error.message);
      setMessage('Error fetching game reports');
      setGameReports([]);
    }
  };

  const handleSearch = () => {
    const child = children.find(c => c.childName.toLowerCase().includes(searchQuery.toLowerCase()));
    if (child) {
      console.log('Search found child:', child);
      handleChildSelect(child.userId);
    } else {
      setMessage('Child not found');
    }
  };

  const handleRegisterChild = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin-login');
      return;
    }
    if (!/^\d{6}$/.test(registerChild.userId)) {
      setMessage('User ID must be a 6-digit number');
      return;
    }
    try {
      const res = await axios.post('http://localhost:3000/admin/register-child', {
        ...registerChild,
        password: registerChild.userId,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage(res.data.message);
      setRegisterChild({ childName: '', phone: '', userId: '' });
      fetchChildren(token);
    } catch (error) {
      console.error('Error registering child:', error.response?.data || error.message);
      setMessage(error.response?.data?.message || 'Registration failed');
    }
  };

  const handleEditChild = (child) => {
    setEditChild({ ...child });
  };

  const handleUpdateChild = async () => {
    const token = localStorage.getItem('admin_token');
    try {
      const res = await axios.put(`http://localhost:3000/admin/children/${editChild._id}/edit`, {
        childName: editChild.childName,
        phone: editChild.phone,
        userId: editChild.userId,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage(res.data.message);
      setEditChild(null);
      fetchChildren(token);
    } catch (error) {
      console.error('Error updating child:', error.response?.data || error.message);
      setMessage(error.response?.data?.message || 'Update failed');
    }
  };

  const handleDeleteChild = async (childId) => {
    const token = localStorage.getItem('admin_token');
    try {
      const res = await axios.delete(`http://localhost:3000/admin/children/${childId}/delete`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage(res.data.message);
      fetchChildren(token);
    } catch (error) {
      console.error('Error deleting child:', error.response?.data || error.message);
      setMessage(error.response?.data?.message || 'Deletion failed');
    }
  };

  const handleResetPassword = async (childId) => {
    const token = localStorage.getItem('admin_token');
    try {
      const res = await axios.post(`http://localhost:3000/admin/children/${childId}/reset-password`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage(`Password reset. Temporary password: ${res.data.temporaryPassword}`);
    } catch (error) {
      console.error('Error resetting password:', error.response?.data || error.message);
      setMessage(error.response?.data?.message || 'Reset failed');
    }
  };

  const handleToggleStatus = async (childId, isActive) => {
    const token = localStorage.getItem('admin_token');
    try {
      const res = await axios.patch(`http://localhost:3000/admin/children/${childId}/status`, { isActive: !isActive }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage(res.data.message);
      fetchChildren(token);
    } catch (error) {
      console.error('Error updating status:', error.response?.data || error.message);
      setMessage(error.response?.data?.message || 'Status update failed');
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="admin-container">
      <h1>Admin Panel</h1>
      {message && <p className="message">{message}</p>}

      <div className="admin-content">
        <div className="child-registration">
          <h2>Register New Child</h2>
          <form onSubmit={handleRegisterChild}>
            <input
              type="text"
              placeholder="Child Name"
              value={registerChild.childName}
              onChange={e => setRegisterChild({ ...registerChild, childName: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Phone Number"
              value={registerChild.phone}
              onChange={e => setRegisterChild({ ...registerChild, phone: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="6-Digit User ID"
              value={registerChild.userId}
              onChange={e => setRegisterChild({ ...registerChild, userId: e.target.value })}
              required
            />
            <button type="submit">Register Child</button>
          </form>
        </div>

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
                {child.childName} ({child.userId})
              </option>
            ))}
          </select>
        </div>

        {editChild && (
          <div className="edit-child">
            <h2>Edit Child</h2>
            <input
              type="text"
              value={editChild.childName}
              onChange={e => setEditChild({ ...editChild, childName: e.target.value })}
              placeholder="Child Name"
            />
            <input
              type="text"
              value={editChild.phone}
              onChange={e => setEditChild({ ...editChild, phone: e.target.value })}
              placeholder="Phone"
            />
            <input
              type="text"
              value={editChild.userId}
              onChange={e => setEditChild({ ...editChild, userId: e.target.value })}
              placeholder="User ID"
            />
            <button onClick={handleUpdateChild}>Update</button>
            <button onClick={() => setEditChild(null)}>Cancel</button>
          </div>
        )}

        <div className="child-list">
          <h2>Registered Children</h2>
          {children.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>User ID</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {children.map(child => (
                  <tr key={child._id}>
                    <td>{child.childName}</td>
                    <td>{child.phone}</td>
                    <td>{child.userId}</td>
                    <td>{child.isActive ? 'Active' : 'Inactive'}</td>
                    <td>
                      <button onClick={() => handleEditChild(child)}>Edit</button>
                      <button onClick={() => handleDeleteChild(child._id)}>Delete</button>
                      <button onClick={() => handleResetPassword(child._id)}>Reset Password</button>
                      <button onClick={() => handleToggleStatus(child._id, child.isActive)}>
                        {child.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No children registered yet.</p>
          )}
        </div>

        {selectedChild && (
          <>
            <div className="emotion-trends">
              <h2>Emotion Trends</h2>
              {isFetchingReports ? (
                <p>Loading emotion trends...</p>
              ) : emotionTrends.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Date/Time</th>
                      <th>Emotion</th>
                      <th>Question</th>
                    </tr>
                  </thead>
                  <tbody>
                    {console.log('Rendering emotionTrends:', emotionTrends)}
                    {emotionTrends.map((trend) => (
                      <tr key={trend._id}>
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
              <button onClick={() => fetchGameReport(selectedChild)}>Refresh Reports</button>
              {isFetchingReports ? (
                <p>Loading game reports...</p>
              ) : gameReports.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Completed At</th>
                      <th>Score</th>
                      <th>Question</th>
                      <th>Correct</th>
                      <th>Emotions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {console.log('Rendering gameReports:', gameReports)}
                    {gameReports.map((report) => (
                      <tr key={report._id}>
                        <td>{new Date(report.completedAt).toLocaleString()}</td>
                        <td>{report.score}</td>
                        <td>{report.question}</td>
                        <td>{report.isCorrect ? 'Yes' : 'No'}</td>
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
      <button onClick={() => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_id');
        navigate('/admin-login');
      }} className="back-btn">Logout</button>
    </div>
  );
};

export default Admin;