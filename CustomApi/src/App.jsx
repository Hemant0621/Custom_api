import React from 'react';
import AdminPanel from './components/Admin';
import User from './components/User';
import { BrowserRouter, Route, Routes } from 'react-router-dom';



function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<User/>} />
      <Route path="/admin" element={<AdminPanel />}/>
    </Routes>
  </BrowserRouter>
  );
}

export default App;