
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import '../medcare-ui.css';
// import '../dashboard-variables.css';
// import '../dashboard.css';
// import '../desktop-menu-styles.css';

import { 
  User, Home, Activity, Stethoscope, Calendar, FileText, Pill, 
  History, CreditCard, Settings as SettingsIcon, Bell, LogOut, MessageSquare,
  Search, ArrowRight, BarChart3, MessageCircle, Pills
} from 'lucide-react';

// Import components from separate files
import { 

  UserProfile, 
  DiseaseDetection, 
  DoctorList, 
  Appointments, 
  LabReports, 
  Prescriptions, 
  MedicalHistory, 
  PaymentHistory, 
  Settings,
  Messages 
} from './PatientDashboard/index';

import PatientChatbot from '../PatientChatbot';
import TwoFactorVerify from './PatientDashboard/2FAVerify';

// Initialize Socket.io connection
const socket = io('http://localhost:5000');

const PatientDashboard = () => {
  const navigate = useNavigate();
const [activeTab, setActiveTab] = useState('dashboard');
  const [patientData, setPatientData] = useState(null);
  
  const dummyData = {
    _id: 'demo',
    name: 'Demo Patient',
    uniqueId: 'DEMO001',
    email: 'demo@medconnect.com',
    profilePhoto: '',
    twoFactorEnabled: false
  };
  const [sidebarOpen, setSidebarOpen] = useState(!window.matchMedia('(max-width: 1023px)').matches);
  const [isMobile, setIsMobile] = useState(window.matchMedia('(max-width: 1023px)').matches);
  const [show2FAVerify, setShow2FAVerify] = useState(false);
  const [is2FASessionValid, setIs2FASessionValid] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  useEffect(() => {
    const storedData = localStorage.getItem('patientData');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setPatientData(parsedData);
      
      // Check 2FA session
      const sessionData = localStorage.getItem('patient2FASession');
      const sessionValid = sessionData && Date.now() - JSON.parse(sessionData).timestamp < 24 * 60 * 60 * 1000; // 24h
      
      // Check if 2FA enabled (assume from patientData or fetch)
      const tfaEnabled = parsedData.twoFactorEnabled || false;
      setTwoFactorEnabled(tfaEnabled);
      setIs2FASessionValid(sessionValid);
      
      if (tfaEnabled && !sessionValid) {
        setShow2FAVerify(true);
      } else {
        socket.emit('register', parsedData._id);
      }
    } else {
      // TEMP FIX: Use dummy data for demo - remove after proper login flow
      console.log('No patient data found - using demo mode');
      setPatientData(dummyData);
      socket.emit('register', dummyData._id);
    }
  }, [navigate]);

  // Responsive sidebar detection
  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 1023px)');
    setIsMobile(mediaQuery.matches);

    const handleResize = (e) => {
      setIsMobile(e.matches);
    };
    mediaQuery.addEventListener('change', handleResize);
    return () => mediaQuery.removeEventListener('change', handleResize);
  }, []);

  const handle2FASuccess = () => {
    setShow2FAVerify(false);
    setIs2FASessionValid(true);
    socket.emit('register', patientData._id);
  };

  const handle2FAClose = () => {
    // Logout if close without verify
    localStorage.removeItem('patientData');
    navigate('/patient/signin');
  };

  const handleLogout = () => {
    localStorage.removeItem('patientData');
    localStorage.removeItem('patient2FASession');
    navigate('/patient/signin');
  };

  const handleNavClick = (itemId) => {
    setActiveTab(itemId);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'profile', label: 'User Profile', icon: User },
    { id: 'disease', label: 'Disease Detection', icon: Activity },
    { id: 'doctors', label: 'Doctor', icon: Stethoscope },
    { id: 'appointments', label: 'Appointment', icon: Calendar },
{ id: 'lab', label: 'Lab Report', icon: FileText },
    { id: 'prescription', label: 'Prescription', icon: Pill },
{ id: 'messages', label: 'Communication', icon: MessageSquare },
{ id: 'history', label: 'History', icon: History },
    { id: 'payment', label: 'Payment History', icon: CreditCard },
    { id: 'settings', label: 'Setting', icon: SettingsIcon },
  ];

  const renderContent = () => {
    switch (activeTab) {
  case 'dashboard':
    return (
      <div className="dashboard-home">
        {/* Hero Section */}
        <div className="hero-section gradient-hero">
          <div className="hero-content">
            <div className="hero-welcome">
              <h1>Welcome back, {patientData?.name || 'Patient'}!</h1>
              <p>Your health overview and quick actions</p>
            </div>
            <div className="hero-search">
              <Search size={20} />
              <input type="text" placeholder="Search doctors, appointments..." />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="dashboard-grid">
          <div className="dashboard-card stat-card gradient-bg" style={{backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
            <div className="stat-header">
              <div className="stat-icon" style={{ backgroundColor: '#22c55e' }}>
                <Calendar size={24} />
              </div>
              <div className="stat-change">+12%</div>
            </div>
            <div className="stat-content">
              <h3>12</h3>
              <p>Total Appointments</p>
            </div>
          </div>
          <div className="dashboard-card stat-card gradient-bg" style={{backgroundImage: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
            <div className="stat-header">
              <div className="stat-icon" style={{ backgroundColor: '#3b82f6' }}>
                <Pills size={24} />
              </div>
              <div className="stat-change">+5%</div>
            </div>
            <div className="stat-content">
              <h3>8</h3>
              <p>Prescriptions</p>
            </div>
          </div>
          <div className="dashboard-card stat-card gradient-bg" style={{backgroundImage: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}}>
            <div className="stat-header">
              <div className="stat-icon" style={{ backgroundColor: '#f59e0b' }}>
                <FileText size={24} />
              </div>
              <div className="stat-change">+8%</div>
            </div>
            <div className="stat-content">
              <h3>5</h3>
              <p>Lab Reports</p>
            </div>
          </div>
          <div className="dashboard-card stat-card gradient-bg" style={{backgroundImage: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'}}>
            <div className="stat-header">
              <div className="stat-icon" style={{ backgroundColor: '#ef4444' }}>
                <BarChart3 size={24} />
              </div>
              <div className="stat-change">+3%</div>
            </div>
            <div className="stat-content">
              <h3>2</h3>
              <p>Upcoming</p>
            </div>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="dashboard-section">
          <h2>Upcoming Appointments</h2>
          <div className="appointments-grid">
            <div className="appointment-card">
              <div className="appointment-doctor">Dr. Sarah Johnson</div>
              <div className="appointment-time">Tomorrow 10:30 AM</div>
              <span className="status-badge status-confirmed">confirmed</span>
              <button className="btn btn-primary">Join</button>
            </div>
            <div className="appointment-card">
              <div className="appointment-doctor">Dr. Michael Chen</div>
              <div className="appointment-time">Fri 2:00 PM</div>
              <span className="status-badge status-pending">pending</span>
              <button className="btn btn-primary">Join</button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions-grid">
            <button className="quick-action-btn" style={{ borderColor: '#22c55e' }} onClick={() => handleNavClick('profile')}>
              <User size={20} />
              <span>View Profile</span>
            </button>
            <button className="quick-action-btn" style={{ borderColor: '#3b82f6' }} onClick={() => handleNavClick('disease')}>
              <Activity size={20} />
              <span>Disease Check</span>
            </button>
            <button className="quick-action-btn" style={{ borderColor: '#f59e0b' }} onClick={() => handleNavClick('messages')}>
              <MessageCircle size={20} />
              <span>Messages</span>
            </button>
            <button className="quick-action-btn" style={{ borderColor: '#ef4444' }} onClick={() => handleNavClick('payment')}>
              <CreditCard size={20} />
              <span>Payments</span>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dashboard-section">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            <div className="activity-item activity-prescription">
              <div className="activity-icon">💊</div>
              <div className="activity-content">
                <div className="activity-title">New prescription received</div>
                <div className="activity-time">2 hours ago</div>
              </div>
              <ArrowRight size={16} />
            </div>
            <div className="activity-item activity-lab">
              <div className="activity-icon">📋</div>
              <div className="activity-content">
                <div className="activity-title">Lab report uploaded</div>
                <div className="activity-time">1 day ago</div>
              </div>
              <ArrowRight size={16} />
            </div>
          </div>
        </div>
      </div>
    );
      case 'profile':
        return <UserProfile patientData={patientData} setPatientData={setPatientData} />;
      case 'disease':
        return <DiseaseDetection />;
      case 'doctors':
        return <DoctorList />;
      case 'appointments':
        return <Appointments patientData={patientData} />;
      case 'lab':
        return <LabReports patientData={patientData} />;
      case 'prescription':
        return <Prescriptions patientData={patientData} />;
      case 'messages':
        return <Messages patientData={patientData} socket={socket} />;
      case 'history':
        return <MedicalHistory patientData={patientData} />;
      case 'payment':
        return <PaymentHistory patientData={patientData} />;
      case 'settings':
        return <Settings patientData={patientData} />;
      default:
        return null;
      
    }
  };

  if (!patientData) {
    return <div className="loading-container">Loading...</div>;
  }

  if (show2FAVerify) {
    return (
      <>
        {renderContent()} {/* Background content - now resilient */}
        <TwoFactorVerify 
          patientData={patientData}
          isOpen={show2FAVerify}
          onVerifySuccess={handle2FASuccess}
          onClose={handle2FAClose}
        />
      </>
    );
  }

  return (
    <div className="dashboard-container">
      <button 
        className="mobile-menu-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <span className={`hamburger ${sidebarOpen ? 'open' : ''}`}>
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>

      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="logo-icon">+</span>
            <span>MediConnect</span>
          </div>
        </div>
        
        <div className="sidebar-user">
          <div className="user-avatar">
            {patientData.profilePhoto ? (
              <img src={patientData.profilePhoto.startsWith('http') ? patientData.profilePhoto : `http://localhost:5000${patientData.profilePhoto}`} alt={patientData.name} />
            ) : (
              <span>{patientData?.name?.charAt(0) || 'P'}</span>
            )}
          </div>
          <div className="user-info">
            <h4>{patientData.name}</h4>
            <p>{patientData.uniqueId}</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
              >
                <span className="nav-icon"><IconComponent size={20} /></span>
                <span className="nav-label">{item.label}</span>
              </button>
            );
          })}
          <button className="nav-item logout-btn" onClick={handleLogout}>
            <span className="nav-icon"><LogOut size={20} /></span>
            <span className="nav-label">Logout</span>
          </button>
        </nav>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-welcome">
            <h1>Welcome back, {patientData.name}!</h1>
            <p>Here's your health overview</p>
          </div>
          <div className="header-actions">
            <button className="notification-btn">
              <Bell size={20} />
              <span className="notification-badge">3</span>
            </button>
            <button 
              className="desktop-menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <span className={`hamburger ${sidebarOpen ? 'open' : ''}`}>
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
          </div>
        </header>

        <div className="dashboard-content">
          {renderContent()}
        </div>
      </main>


    </div>
  );
};

export default PatientDashboard;
