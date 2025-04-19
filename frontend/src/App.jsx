import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SuperAdminLogin from './components/SuperAdminLogin';
import SuperAdmin from './components/SuperAdmin';
import AdminLogin from './components/AdminLogin';
import Admin from './components/Admin';
import ChildLogin from './components/ChildLogin';
import Game from './components/Game';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ChildLogin />} />
        <Route path="/superadmin-login" element={<SuperAdminLogin />} />
        <Route path="/superadmin" element={<SuperAdmin />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/game" element={<Game />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;