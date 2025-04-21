import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/superadmin.css';

const SuperAdmin = () => {
  // State to store admin list
  const [admins, setAdmins] = useState([]);
  // State to hold phone number for toggle action
  const [phoneToToggle, setPhoneToToggle] = useState('');
  // State to hold phone number for delete action
  const [phoneToDelete, setPhoneToDelete] = useState('');
  // State to hold admin registration form data
  const [adminData, setAdminData] = useState({
    name: '',
    phone: '',
    email: '',
    profilePhoto: null,
    password: '',
  });
  // State for messages (errors/success)
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Function to fetch admin list from backend
  const fetchAdmins = useCallback(async (token) => {
    try {
      const response = await axios.get('http://localhost:3000/superadmin/admins', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdmins(response.data);
    } catch (error) {
      console.error('Error fetching admins:', error);
      setMessage('Failed to fetch admins');
    }
  }, []);

  // useEffect to verify token and fetch admins
  useEffect(() => {
    const token = localStorage.getItem('superadmin_token');
    if (!token) {
      navigate('/superadmin-login');
      return;
    }
    fetchAdmins(token);
  }, [navigate, fetchAdmins]);

  // Handle new admin registration
  const handleAdminRegistration = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('superadmin_token');
    if (!token) {
      navigate('/superadmin-login');
      return;
    }

    const formData = new FormData();
    formData.append('name', adminData.name);
    formData.append('phone', adminData.phone);
    formData.append('email', adminData.email);
    if (adminData.profilePhoto) {
      formData.append('profilePhoto', adminData.profilePhoto);
    }
    formData.append('password', adminData.password);

    try {
      const response = await axios.post('http://localhost:3000/superadmin/register-admin', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage(response.data.message);
      // Add new admin to the list
      setAdmins(prev => [...prev, response.data.admin]);
      // Reset form
      setAdminData({ name: '', phone: '', email: '', profilePhoto: null, password: '' });
      // Clear file input
      document.getElementById('profilePhoto').value = null;
    } catch (error) {
      console.error('Error registering admin:', error);
      setMessage(error.response?.data?.message || 'Registration failed');
    }
  };

  // Enable or disable an admin
  const handleToggleAdmin = async (active) => {
    if (!phoneToToggle) {
      setMessage('Please enter a phone number');
      return;
    }

    const token = localStorage.getItem('superadmin_token');
    try {
      const response = await axios.put('http://localhost:3000/superadmin/toggle-admin', 
        { phone: phoneToToggle, active },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(response.data.message);
      // Update admin status in list
      setAdmins(prev => prev.map(admin => 
        admin.phone === phoneToToggle ? response.data.admin : admin
      ));
      setPhoneToToggle('');
    } catch (error) {
      console.error('Error toggling admin:', error);
      setMessage(error.response?.data?.message || 'Error toggling admin');
    }
  };

  // Delete an admin
  const handleDeleteAdmin = async () => {
    if (!phoneToDelete) {
      setMessage('Please enter a phone number');
      return;
    }

    const token = localStorage.getItem('superadmin_token');
    try {
      const response = await axios.delete(`http://localhost:3000/superadmin/delete-admin/${phoneToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage(response.data.message);
      // Remove deleted admin from list
      setAdmins(prev => prev.filter(admin => admin.phone !== phoneToDelete));
      setPhoneToDelete('');
    } catch (error) {
      console.error('Error deleting admin:', error);
      setMessage(error.response?.data?.message || 'Error deleting admin');
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('superadmin_token');
    navigate('/superadmin-login');
  };

  return (
    <div className="superadmin-container">
      <h1>SuperAdmin Dashboard</h1>

      {/* Admin registration form */}
      <div className="admin-registration">
        <h2>Register New Admin</h2>
        <form onSubmit={handleAdminRegistration}>
          <input
            type="text"
            placeholder="Admin Name"
            value={adminData.name}
            onChange={e => setAdminData({ ...adminData, name: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Phone Number"
            value={adminData.phone}
            onChange={e => setAdminData({ ...adminData, phone: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={adminData.email}
            onChange={e => setAdminData({ ...adminData, email: e.target.value })}
            required
          />
          <input
            id="profilePhoto"
            type="file"
            accept="image/*"
            onChange={e => setAdminData({ ...adminData, profilePhoto: e.target.files[0] })}
          />
          <input
            type="password"
            placeholder="Password"
            value={adminData.password}
            onChange={e => setAdminData({ ...adminData, password: e.target.value })}
            required
          />
          <button type="submit">Register Admin</button>
        </form>
        {message && <p className="message">{message}</p>}
      </div>

      {/* Display list of registered admins */}
      <div className="admin-list">
        <h2>Registered Admins</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {admins.map(admin => (
              <tr key={admin.phone}>
                <td>{admin.name}</td>
                <td>{admin.phone}</td>
                <td>{admin.email}</td>
                <td>{admin.active ? 'Active' : 'Disabled'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Admin actions - toggle or delete */}
      <div className="admin-actions">
        <h2>Manage Admins</h2>
        <input
          type="text"
          placeholder="Enter phone number"
          value={phoneToToggle}
          onChange={e => setPhoneToToggle(e.target.value)}
        />
        <button onClick={() => handleToggleAdmin(true)}>Enable Admin</button>
        <button onClick={() => handleToggleAdmin(false)}>Disable Admin</button>
        <input
          type="text"
          placeholder="Enter phone number to delete"
          value={phoneToDelete}
          onChange={e => setPhoneToDelete(e.target.value)}
        />
        <button onClick={handleDeleteAdmin}>Delete Admin</button>
      </div>

      {/* Logout button */}
      <button onClick={handleLogout} className="logout-btn">Logout</button>
    </div>
  );
};

export default SuperAdmin;
