import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StartupProvider } from './context/StartupContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages Import
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import OnboardingRole from './pages/OnboardingRole';
import OnboardingDetails from './pages/OnboardingDetails';
import StartupInput from './pages/StartupInput';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';

function App() {
  return (
    <StartupProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing & Marketing Pages */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Onboarding Stages */}
          <Route path="/onboarding/role" element={<OnboardingRole />} />
          <Route path="/onboarding/details" element={<OnboardingDetails />} />
          <Route path="/startup/validate" element={<StartupInput />} />

          {/* Protected SaaS App Workspace */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          {/* 404 Deep Space Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </StartupProvider>
  );
}

export default App;
