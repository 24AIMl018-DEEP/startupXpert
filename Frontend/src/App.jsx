import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

// Pages Import
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import OnboardingRole from './pages/OnboardingRole';
import OnboardingDetails from './pages/OnboardingDetails';
import StartupInput from './pages/StartupInput';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Roadmap from './pages/Roadmap';
import NotFound from './pages/NotFound';

// New Upgrades Routing Flow
import AnalysisLoader from './pages/AnalysisLoader';
import AnalysisResult from './pages/AnalysisResult';
import LoadingOverlay from './components/LoadingOverlay';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing & Marketing Pages */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Onboarding Stages */}
        <Route 
          path="/onboarding/role" 
          element={
            <ProtectedRoute skipOnboardingCheck={true}>
              <OnboardingRole />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/onboarding/details" 
          element={
            <ProtectedRoute skipOnboardingCheck={true}>
              <OnboardingDetails />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/startup/validate" 
          element={
            <ProtectedRoute skipOnboardingCheck={true}>
              <StartupInput />
            </ProtectedRoute>
          } 
        />

        {/* Cinematic AI Loader Sequence */}
        <Route 
          path="/analysis/loader" 
          element={
            <ProtectedRoute skipOnboardingCheck={true}>
              <AnalysisLoader />
            </ProtectedRoute>
          } 
        />


        {/* Detailed Metric Analysis Scores Dashboard */}
        <Route 
          path="/analysis/result" 
          element={
            <ProtectedRoute requireAnalysis={true}>
              <AnalysisResult />
            </ProtectedRoute>
          } 
        />

        {/* Protected SaaS App Workspace */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/roadmap" 
          element={
            <ProtectedRoute>
              <Roadmap />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } 
        />

        {/* 404 Deep Space Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <LoadingOverlay />
    </BrowserRouter>
  );
}

export default App;
