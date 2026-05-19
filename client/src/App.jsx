import React, { Suspense } from 'react';

import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';


import Home from './Home/Home.jsx'
import Header from './components/Header';
import Landing from './pages/Landing';
import PatientSignup from './pages/PatientSignup';
import PatientSignin from './pages/PatientSignin';
import DoctorSignup from './pages/DoctorSignup';
import DoctorSignin from './pages/DoctorSignin';
import PatientDashboard from './pages/PatientDashboard/PatientDashboard';
import LabReportViewer from './pages/PatientDashboard/LabReportViewer.jsx';
import DoctorDashboard from './pages/DoctorDashboard/DoctorDashboard';
import PatientHistory from './pages/DoctorDashboard/PatientHistory.jsx';
import DoctorAuthGuard from './pages/DoctorDashboard/DoctorAuthGuard';
import BookingPage from './pages/BookingPage';

function AppContent() {
  const location = useLocation();
  
  // Hide header on dashboard pages and booking page
  const hideHeader = (location.pathname.includes('/patient/dashboard') || 
                     location.pathname.startsWith('/patient/lab-report')) || 
                     location.pathname.includes('/doctor/dashboard') || 
                     location.pathname.includes('/booking');

  return (
    <div className="app-container">
      {!hideHeader && <Header />}
      <main className="main-content">
        <Routes>
    <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Home />} />

          {/* Landing feature sections */}
          <Route path="/feature" element={<Home />} />

          <Route
            path="/features"
            element={
              <Suspense fallback={null}>
                <React.Fragment>
                  {React.createElement(React.lazy(() => import('./Home/Feature.jsx')))}
                </React.Fragment>
              </Suspense>
            }
          />

          <Route
            path="/how-it-works"
            element={
              <Suspense fallback={null}>
                <React.Fragment>
                  {React.createElement(React.lazy(() => import('./Home/Howitwork.jsx')))}
                </React.Fragment>
              </Suspense>
            }
          />

          <Route
            path="/reviews"
            element={
              <Suspense fallback={null}>
                <React.Fragment>
                  {React.createElement(React.lazy(() => import('./Home/Review.jsx')))}
                </React.Fragment>
              </Suspense>
            }
          />

          <Route
            path="/contact"
            element={
              <Suspense fallback={null}>
                <React.Fragment>
                  {React.createElement(React.lazy(() => import('./Home/Contact.jsx')))}
                </React.Fragment>
              </Suspense>
            }
          />



          <Route path="/patient/signup" element={<PatientSignup />} />
          <Route path="/patient/signin" element={<PatientSignin />} />
          <Route path="/patient/dashboard" element={<PatientDashboard />} />
          <Route path="/patient/lab-report/:reportId" element={<LabReportViewer />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/doctor/signup" element={<DoctorSignup />} />
          <Route path="/doctor/signin" element={<DoctorSignin />} />

          
          {/* Doctor dashboard with auth guard */}
          <Route path="/doctor/dashboard/*" element={<DoctorAuthGuard />}>
            <Route index element={<DoctorDashboard />} />
            <Route path="patient-history/:patientId" element={<PatientHistory />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
