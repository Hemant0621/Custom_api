import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainWebsite from './components/Home';
import AdminPanel from './components/Admin';



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainWebsite />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;