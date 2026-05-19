import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { 
  Home, Activity, Calendar, MessageSquare, User, Settings as SettingsIcon, LogOut, Bell, 
  Stethoscope, FileText, Phone, BarChart3, Users, DollarSign, Clock, ClipboardList 
} from 'lucide-react';

import DoctorChatbot from '../../DoctorChatbot';

import DashboardHome from './DashboardHome';
import UserProfile from './UserProfile';
import Appointments from './Appointments';
import PatientList from './PatientList';
import Communication from './Communication';
import PatientLabReports from './PatientLabReports';
import Prescriptions from './Prescriptions';
import DoctorSettings from './Settings';
import PaymentHistory from './PaymentHistory';
import History from './History';



import './doctor-dashboard.css';


const socket = io('http://localhost:5000');

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard'); // Default to dashboard
  const [doctorData, setDoctorData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [show2FAVerify, setShow2FAVerify] = useState(false);
const [is2FASessionValid, setIs2FASessionValid] = useState(false);



  useEffect(() => {
    const validateToken = async () => {
      const storedData = localStorage.getItem('doctorData');
      const token = localStorage.getItem('doctorToken');
      
      if (!storedData || !token) {
        console.log('No doctor data or token found, redirecting to login');
        localStorage.clear();
        navigate('/doctor/signin');
        return;
      }
      
      try {
        const parsedData = JSON.parse(storedData);
        console.log('✅ DoctorDashboard: Valid doctorData & token found');
        
        // Test token validity with public /doctors/:id endpoint (no auth required)
        const response = await fetch(`http://localhost:5000/api/doctors/${parsedData._id}`);
        
        if (!response.ok) {
          throw new Error(`Doctor profile fetch failed: ${response.status}`);
        }
        
        const profileData = await response.json();
        if (!profileData._id) {
          throw new Error('Invalid doctor profile data');
        }
        
        console.log('✅ DoctorDashboard: Token verified OK');
        setDoctorData(parsedData);
        socket.emit('register', parsedData._id);
      } catch (error) {
        console.error('❌ DoctorDashboard: Token validation failed:', error);
        localStorage.removeItem('doctorData');
        localStorage.removeItem('doctorToken');
        alert('Session expired. Please login again.');
        navigate('/doctor/signin');
      }
    };
    
    validateToken();
  }, [navigate]);

  // Responsive
  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 1023px)');
    setIsMobile(mediaQuery.matches);
    const handleResize = (e) => setIsMobile(e.matches);
    mediaQuery.addEventListener('change', handleResize);
    return () => mediaQuery.removeEventListener('change', handleResize);
  }, []);



const handleLogout = () => {
    localStorage.removeItem('doctorData');
    localStorage.removeItem('doctor2FASession');
    socket.disconnect();
    navigate('/doctor/signin');
  };

  const handleNavClick = (itemId) => {
    setActiveTab(itemId);
    if (isMobile) setSidebarOpen(false);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'patient-list', label: 'Patient List', icon: Users },
    { id: 'communication', label: 'Communication', icon: MessageSquare },
    { id: 'payment-history', label: 'Payment History', icon: DollarSign },
    { id: 'history', label: 'History', icon: Clock },
    { id: 'prescription', label: 'Prescription', icon: FileText },
    { id: 'lab-reports', label: 'Patient Lab Report', icon: ClipboardList },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const renderContent = () => {
    console.log('renderContent called, doctorData:', doctorData);
    if (!doctorData) {
      return (
        <div style={{padding: '4rem', textAlign: 'center', color: '#666'}}>
          <h2>🔄 Loading doctor data...</h2>
          <p>Please wait while we load your dashboard.</p>
        </div>
      );
    }
    
    switch (activeTab) {
      case 'dashboard':
        return <DashboardHome doctorData={doctorData} />;
      case 'profile':
        return <UserProfile doctorData={doctorData} setDoctorData={setDoctorData} />;
            case 'appointments':
        return <Appointments doctorData={doctorData} />;
      case 'communication':
        return <Communication doctorData={doctorData} />;
      case 'settings':
        return <DoctorSettings doctorData={doctorData} />;
      case 'patient-list':
        return <PatientList doctorData={doctorData} />;
      case 'payment-history':
        return <PaymentHistory doctorData={doctorData} />;
      case 'history':
        return <History doctorData={doctorData} />;
      case 'prescription':
        return <Prescriptions doctorData={doctorData} />;
      case 'lab-reports':
        return <PatientLabReports doctorData={doctorData} />;
      default:
        return <DashboardHome doctorData={doctorData} />;
    }
  };

  if (show2FAVerify) {
    // Render 2FA overlay - adapt if component exists
    return (
      <div>
        {renderContent()}
        {/* Add 2FA verify component */}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Mobile menu toggle */}
      <button 
        style={{ position: 'fixed', top: '20px', left: '20px', zIndex: 1000, width: '48px', height: '48px', backgroundColor: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle sidebar"
      >
        <span className={`hamburger ${sidebarOpen ? 'open' : ''}`}>
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>

      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>
      )}

      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="logo-icon">⚕️</span>
            <span>MediConnect Doctor</span>
          </div>
        </div>
        
        <div className="sidebar-user">
          <div className="user-avatar">
            {doctorData?.profilePhoto ? (
              <img src={`http://localhost:5000${doctorData.profilePhoto}`} alt={doctorData.name} />
            ) : (
              <span>{doctorData?.name?.charAt(0) || 'D'}</span>
            )}
          </div>
          <div className="user-info">
            <h4>{doctorData?.name}</h4>
            <p>{doctorData?.uniqueId}</p>
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
                <IconComponent size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
          <button className="nav-item logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-welcome">
            <h1>Welcome, Dr. {doctorData?.name}!</h1>
            <p>Your practice dashboard</p>
          </div>
          <div className="header-actions">
            <button className="notification-btn">
              <Bell size={20} />
              <span className="notification-badge">2</span>
            </button>
          </div>
        </header>

        <div className="dashboard-content">
          {renderContent()}
          
          {/* Doctor Chatbot - floating assistant */}
          <DoctorChatbot 
            onNavigate={handleNavClick}
            userProfilePhoto={doctorData?.profilePhoto}
          />
        </div>
      </main>
    </div>
  );
};

export default DoctorDashboard;

