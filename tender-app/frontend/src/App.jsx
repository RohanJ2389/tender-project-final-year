import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboardNew';
import PublicDashboard from './components/PublicDashboardNew';
import TenderDetail from './components/TenderDetail';
import TenderEdit from './components/TenderEdit';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/tender/:id" element={<TenderDetail />} />
          <Route path="/admin/tender/:id/edit" element={<TenderEdit />} />
          <Route path="/public" element={<PublicDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;