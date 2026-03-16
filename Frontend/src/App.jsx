// src/App.jsx
import React, { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ViewJobs from './pages/ViewJobs';
import EmployerDashboard from './pages/EmployerDashboard';
import JobSeekerDashboard from './pages/JobSeekerDashboard';
import UploadResume from './pages/UploadResume';
import ProfileSettings from './pages/ProfileSettings';
import ApplicationTracker from './pages/ApplicationTracker';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [user]);

  return (
    <AuthProvider value={{ user, setUser }}>
      <div className="app">
        <Navbar user={user} setUser={setUser} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home user={user} />} />
            <Route path="/jobs" element={<ViewJobs />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/resume"
              element={
                <ProtectedRoute role="jobseeker">
                  <UploadResume />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <ProfileSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/applications"
              element={
                <ProtectedRoute role="jobseeker">
                  <ApplicationTracker />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/employer"
              element={
                <ProtectedRoute role="employer">
                  <EmployerDashboard user={user} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/jobseeker"
              element={
                <ProtectedRoute role="jobseeker">
                  <JobSeekerDashboard user={user} />
                </ProtectedRoute>
              }
            />
            <Route
              path="*"
              element={<Navigate to="/" replace />}
            />
          </Routes>
        </main>
        <footer className="footer">
          <div className="sh-container footer-inner">
            <p>
              <strong>SmartHire</strong> © 2026. All rights reserved.
            </p>
            <p>Secure hiring and applications.</p>
          </div>
        </footer>
      </div>
    </AuthProvider>
  );
}

export default App;
