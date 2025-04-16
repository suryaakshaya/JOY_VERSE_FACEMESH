import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ChildLogin from './components/ChildLogin';
import Game from './components/Game';
import Admin from './components/Admin';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ChildLogin />} />
        <Route path="/game" element={<Game />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;