import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
// CSS removed: medcare-ui.css, Dashboard.css\n// import '../../medcare-ui.css';\n// import '../dashboard-variables.css';\n// /* dashboard.css removed - using global base styles */\n// import '../desktop-menu-styles.css';\n// import './Dashboard.css'; /* Attractive sidebar styles */
import './patient dashboard css/dashboard.css';
import './patient dashboard css/diseasedetection.css';
import './patient dashboard css/dashboard-content.css';
import './patient dashboard css/chatbot-right-fix.css';

import { 
  User, Home, Activity, Stethoscope, Calendar, FileText, Pill, 
  History, CreditCard, Settings as SettingsIcon, Bell, LogOut, MessageSquare,
  Search, ArrowRight, BarChart3, MessageCircle, Bot
} from 'lucide-react';

// Import components from separate files
import { 
  UserProfile, 
  DiseaseDetection, 
  DoctorList, 
  Appointments,
   Messages , 
  LabReports, 
  Prescriptions, 
  MedicalHistory, 
  PaymentHistory, 
  Settings
 
} from './index';

import PatientChatbot from '../../PatientChatbot';
import TwoFactorVerify from './2FAVerify';
// Initialize Socket.io connection
const socket = io('http://localhost:5000');

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') || 'dashboard';
  });
  const [patientData, setPatientData] = useState(null);
  
const dummyData = {
    _id: 'demo',
    name: 'Demo Patient',
    uniqueId: 'DEMO001',
    email: 'demo@medconnect.com',
    profilePhoto: '',
    twoFactorEnabled: false
  };
  // Dashboard real data states
  const [dashboardData, setDashboardData] = useState({
    stats: null,
    recentDoctors: [],
    recentActivities: [],
    loading: false,
    error: null
  });
  const [sidebarOpen, setSidebarOpen] = useState(!window.matchMedia('(max-width: 1023px)').matches);
  const [chatbotSidebarOpen, setChatbotSidebarOpen] = useState(false);
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

    const handleResize = () => {
      setIsMobile(window.matchMedia('(max-width: 1023px)').matches);

    };
    mediaQuery.addEventListener('change', handleResize);
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call
    return () => {
      mediaQuery.removeEventListener('change', handleResize);
      window.removeEventListener('resize', handleResize);
    };
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
    // Removed special case for diseasedetection - now renders inline DiseaseDetection component
    // Standalone ML app: http://localhost:5000
    setActiveTab(itemId);
  };

  // Fetch dashboard real data
  const fetchDashboardData = async () => {
    if (!patientData?._id) return;

    setDashboardData(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Fetch FULL patient data for labReports count
      const patientRes = await fetch(`http://localhost:5000/api/patients/${patientData._id}`);
      const patientFull = await patientRes.json();
      const labReportsCount = patientFull.data?.labReports?.length || 0;

      // Fetch activity history for other stats & recent
      const historyRes = await fetch(`http://localhost:5000/api/patients/history/${patientData._id}`);
      const historyData = await historyRes.json();
      let history = [];
      if (historyRes.ok && (historyData.success ? historyData.activityHistory : historyData)) {
        history = Array.isArray(historyData.success ? historyData.activityHistory : historyData) 
          ? historyData.success ? historyData.activityHistory : historyData 
          : [];
      }

      // Fetch patient appointments
      const apptsRes = await fetch(`http://localhost:5000/api/appointments/patient/${patientData._id}`);
      const apptsData = await apptsRes.json();
      const upcomingAppts = apptsData.data?.filter(a => ['pending', 'booked'].includes(a.status)) || [];
      const totalAppts = apptsData.data?.length || 0;

      // Compute stats
      const stats = {
        totalAppointments: totalAppts,
        totalPrescriptions: history.filter(h => h.category === 'prescription').length,
        totalLabReports: labReportsCount,
        upcomingCount: upcomingAppts.length,
        totalActivities: history.length,
        changeAppts: totalAppts > 5 ? '+12%' : 'New',
        changeRx: '+5%',
        changeLabs: labReportsCount > 2 ? '+8%' : 'New',
        changeUpcoming: upcomingAppts.length > 0 ? '+3%' : 'None'
      };

      // Recent activities (top 4)
      const recentActivities = history.slice(0, 4).map(item => ({
        ...item,
        timeAgo: new Date(item.timestamp).toLocaleDateString('en-US', { 
          month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true 
        })
      }));

      // Fetch real doctors (top 4 active)
      const doctorsRes = await fetch('http://localhost:5000/api/doctors/available');
      const doctorsData = await doctorsRes.json();
      const recentDoctors = doctorsData.success && Array.isArray(doctorsData.data) 
        ? doctorsData.data.filter(d => d.isOnline).slice(0, 4).map(d => ({
          ...d,
          photoUrl: d.profilePhoto ? `http://localhost:5000${d.profilePhoto.startsWith('/') ? '' : '/'}${d.profilePhoto}` : null
        })) 
        : [];

      // Recent appointments preview (next 2)
      const recentApptsPreview = upcomingAppts.slice(0, 2).map(apt => ({
        doctorName: apt.doctorName,
        time: `${apt.appointmentDate} ${apt.appointmentTime}`,
        status: apt.status,
        id: apt._id
      }));

      setDashboardData({
        stats,
        recentDoctors,
        recentActivities,
        recentApptsPreview,
        loading: false,
        error: null
      });
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setDashboardData(prev => ({ ...prev, 
        loading: false, 
        error: 'Failed to load dashboard data. Please refresh.' 
      }));
    }
  };

  // Load dashboard data when tab active and patient ready
  useEffect(() => {
    if (activeTab === 'dashboard' && patientData?._id) {
      fetchDashboardData();
    }
  }, [activeTab, patientData?._id]);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'userprofile', label: 'UserProfile', icon: User },
    { id: 'diseasedetection', label: 'DiseaseDetection', icon: Activity },
    { id: 'doctorlist', label: 'DoctorList', icon: Stethoscope },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'labreports', label: 'LabReports', icon: FileText },
    { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
    { id: 'medicalhistory', label: 'MedicalHistory', icon: History },
    { id: 'paymenthistory', label: 'PaymentHistory', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        const { stats, recentDoctors, recentActivities, loading, error } = dashboardData;
        return (
          <div className="dashboard-home">
            {/* Hero Section */}
            <div className="hero-section">
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
              {loading ? (
                Array(4).fill().map((_, i) => (
                  <div key={i} className="stat-card" style={{ animationDelay: `${i * 0.1}s` }}>
                    <div className="stat-header">
                      <div className="stat-icon" style={{ background: 'rgba(255,255,255,0.1)' }}></div>
                      <div className="stat-change" style={{ width: '40px', height: '20px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}></div>
                    </div>
                    <div className="stat-content">
                      <h3 style={{ width: '80px', height: '50px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}></h3>
                      <p style={{ width: '100px', height: '20px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}></p>
                    </div>
                  </div>
                ))
              ) : error ? (
                <div className="stat-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
                  <p style={{ color: 'rgba(255,255,255,0.7)' }}>{error}</p>
                  <button onClick={fetchDashboardData} className="btn btn-primary" style={{ marginTop: '1rem' }}>Retry</button>
                </div>
              ) : stats ? (
                <>
                  <div className="stat-card">
                    <div className="stat-header">
                      <div className="stat-icon"><Calendar size={24} /></div>
                      <div className="stat-change">{stats.changeAppts}</div>
                    </div>
                    <div className="stat-content">
                      <h3>{stats.totalAppointments || 0}</h3>
                      <p>Total Appointments</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-header">
                      <div className="stat-icon"><Pill size={24} /></div>
                      <div className="stat-change">{stats.changeRx}</div>
                    </div>
                    <div className="stat-content">
                      <h3>{stats.totalPrescriptions || 0}</h3>
                      <p>Prescriptions</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-header">
                      <div className="stat-icon"><FileText size={24} /></div>
                      <div className="stat-change">{stats.changeLabs}</div>
                    </div>
                    <div className="stat-content">
                      <h3>{stats.totalLabReports || 0}</h3>
                      <p>Lab Reports</p>
                    </div>
                  </div>
            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon"><Calendar size={24} /></div>
                <div className="stat-change">{stats.changeUpcoming}</div>
              </div>
              <div className="stat-content">
                <h3>{stats.upcomingCount || 0}</h3>
                <p>Upcoming Appointments</p>
              </div>
            </div>
                </>
              ) : null}
            </div>

            {/* Recent Doctors (as Upcoming Preview) */}
            <div className="dashboard-section">
              <h2>Recent & Available Doctors</h2>
              {loading ? (
                <div className="appointments-grid">
                  {Array(2).fill().map((_, i) => (
                    <div key={i} className="appointment-card" style={{ height: '120px', justifyContent: 'center' }}>
                      <div style={{ width: '100%', height: '30px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', animation: 'pulse 1.5s infinite' }}></div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)', padding: '2rem' }}>Unable to load doctors</p>
              ) : recentDoctors.length > 0 ? (
                <div className="appointments-grid">
                  {recentDoctors.slice(0, 2).map((doctor) => (
                    <div key={doctor._id} className="appointment-card">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: doctor.profilePhoto ? `url(http://localhost:5000${doctor.profilePhoto.startsWith('/') ? '' : '/'}${doctor.profilePhoto}) center/cover` : 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {!doctor.profilePhoto && <span style={{ fontSize: '14px', fontWeight: '600' }}>{doctor.name.charAt(0)}</span>}
                        </div>
                        <div>
                          <div className="appointment-doctor" style={{ fontSize: '1.1rem' }}>{doctor.name}</div>
                          <div style={{ color: '#10b981', fontSize: '0.9rem', fontWeight: '500' }}>🟢 Active Now</div>
                        </div>
                      </div>
                      <div style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>{doctor.specialist || 'Specialist'}</div>
                      <div className="btn btn-primary" style={{ fontSize: '0.95rem' }} onClick={() => handleNavClick('doctorlist')}>
                        Book Appointment
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)', padding: '2rem' }}>No active doctors available right now</p>
              )}
            </div>

            {/* Quick Actions */}
            <div className="dashboard-section">
              <h2>Quick Actions</h2>
              <div className="quick-actions-grid">
                <button className="quick-action-btn" style={{ borderColor: '#22c55e' }} onClick={() => handleNavClick('userprofile')}>
                  <User size={20} />
                  <span>View Profile</span>
                </button>
                <button className="quick-action-btn" style={{ borderColor: '#3b82f6' }} onClick={() => handleNavClick('diseasedetection')}>
                  <Activity size={20} />
                  <span>Disease Check</span>
                </button>
                <button className="quick-action-btn" style={{ borderColor: '#f59e0b' }} onClick={() => handleNavClick('messages')}>
                  <MessageCircle size={20} />
                  <span>Messages</span>
                </button>
                <button className="quick-action-btn" style={{ borderColor: '#ef4444' }} onClick={() => handleNavClick('paymenthistory')}>
                  <CreditCard size={20} />
                  <span>Payments</span>
                </button>
              </div>
            </div>

            {/* Recent Activity - Real Data */}
            <div className="dashboard-section">
              <h2>Recent Activity</h2>
              {loading ? (
                <div className="activity-list">
                  {Array(3).fill().map((_, i) => (
                    <div key={i} className="activity-item" style={{ height: '70px', animationDelay: `${i * 0.1}s` }}>
                      <div className="activity-icon" style={{ background: 'rgba(255,255,255,0.1)', width: '50px', height: '50px', borderRadius: '12px' }}></div>
                      <div className="activity-content">
                        <div style={{ width: '200px', height: '20px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}></div>
                        <div style={{ width: '100px', height: '16px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginTop: '0.25rem' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)', padding: '2rem' }}>Unable to load recent activity</p>
              ) : recentActivities.length > 0 ? (
                <div className="activity-list">
                  {recentActivities.slice(0, 3).map((activity, idx) => (
                    <div key={activity._id || idx} className="activity-item">
                      <div className={`activity-icon activity-${activity.category}`} style={{ 
                        background: activity.category === 'prescription' ? 'rgba(16, 185, 129, 0.2)' : 
                                   activity.category === 'lab' ? 'rgba(59, 130, 246, 0.2)' : 
                                   activity.category === 'appointment' ? 'rgba(99, 102, 241, 0.2)' :
                                   activity.category === 'payment' ? 'rgba(34, 197, 94, 0.2)' :
                                   'rgba(99, 102, 241, 0.2)'
                      }}>
                        <span className="activity-emoji" aria-label={activity.category}>
                          {activity.category === 'appointment' && '📅'}
                          {activity.category === 'lab' && '📋'}
                          {activity.category === 'prescription' && '💊'}
                          {activity.category === 'payment' && '💳'}
                          {activity.category === 'profile' && '👤'}
                          {activity.category === 'account' && '⭐'}
                          {!['appointment','lab','prescription','payment','profile','account'].includes(activity.category) && '⚡'}
                        </span>
                      </div>
                      <div className="activity-content">
                        <div className="activity-title">{activity.action}</div>
                        <div className="activity-time">{activity.timeAgo}</div>
                      </div>
                      <ArrowRight size={16} />
                    </div>
                  ))}
                  {recentActivities.length > 3 && (
                    <div style={{ textAlign: 'center', padding: '1rem', color: 'rgba(255,255,255,0.7)' }}>
                      <button className="btn btn-primary" style={{ fontSize: '0.9rem' }} onClick={() => handleNavClick('medicalhistory')}>
                        View Full History ({recentActivities.length})
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.7)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                  <h3>No recent activity</h3>
                  <p>Your activity will appear here as you use the platform</p>
                </div>
              )}
            </div>
          </div>
        );
      case 'userprofile':
        return <UserProfile patientData={patientData} setPatientData={setPatientData} />;
      case 'diseasedetection':
        const checkAndOpenML = () => {
          window.open('http://172.42.0.31:5000', '_blank');
        };
        
        return (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h2>🤖 AI Disease Detection</h2>
            <p>Opening advanced ML-powered disease analysis...</p>
            <button 
              className="btn btn-primary" 
              style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}
              onClick={checkAndOpenML}
            >
              Launch Disease Detection
            </button>
          </div>
        );
      case 'doctorlist':
        return <DoctorList />;
      case 'appointments':
        return <Appointments patientData={patientData} />;
      case 'labreports':
        return <LabReports patientData={patientData} />;
      case 'prescriptions':
        return <Prescriptions patientData={patientData} />;
      case 'messages':
        return <Messages patientData={patientData} socket={socket} token={localStorage.getItem('patientToken')} />;
      case 'medicalhistory':
        return <MedicalHistory patientData={patientData} />;
      case 'paymenthistory':
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
style={{ position: 'fixed', top: '20px', left: '20px', zIndex: 1000, width: '48px', height: '48px', backgroundColor: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="Toggle menu"
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

<main className={`dashboard-main ${chatbotSidebarOpen ? 'with-right-sidebar' : ''}`}>
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



      {/* Right Chatbot Sidebar */}
      <div className={`chatbot-right-sidebar ${chatbotSidebarOpen ? 'open' : ''}`}>
        <PatientChatbot 
          onNavigate={handleNavClick} 
          userProfilePhoto={patientData?.profilePhoto}
          sidebarMode={true}
        />
      </div>
      {chatbotSidebarOpen && (
        <div 
          className="chatbot-right-overlay"
          onClick={() => setChatbotSidebarOpen(false)}
        />
      )}

      {/* Right Chatbot Toggle Button */}
      <button 
        className="chatbot-header-float"
        onClick={() => setChatbotSidebarOpen(!chatbotSidebarOpen)}
        style={{
          position: 'fixed', 
          top: '20px', 
          right: '20px', 
          zIndex: 1001
        }}
        aria-label="Toggle Chatbot Sidebar"
      >
        <Bot size={20} />
      </button>
    </div>
  );
};

export default PatientDashboard;
