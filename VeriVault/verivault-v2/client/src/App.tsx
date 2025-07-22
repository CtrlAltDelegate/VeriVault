import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Components (we'll create these)
import SimpleLandingPage from './components/SimpleLandingPage';
import SimpleLoginPage from './components/SimpleLoginPage';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<SimpleLandingPage />} />
          <Route path="/login" element={<SimpleLoginPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
