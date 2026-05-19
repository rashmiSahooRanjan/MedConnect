import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';// CSS removed: medcare-ui.css\nimport '../medcare-ui.css';\n\n\nimport { io } from 'socket.io-client';
import { MessageCircle, Send, Phone, Video, User, Calendar, FileText, CreditCard, Settings, Bell, LogOut, Activity, Stethoscope, Pill, History, CheckCircle, Clock } from 'lucide-react';
import DashboardHome from './DoctorDashboard/DashboardHome';
import UserProfile from './DoctorDashboard/UserProfile';
import Appointments from './DoctorDashboard/Appointments';
import PrescriptionPad from '../components/PrescriptionPad';

import Communication from './DoctorDashboard/Communication';
import DoctorTwoFactorAuth from './DoctorDashboard/TwoFactorAuth';
// Socket will be initialized in useEffect

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [doctorData, setDoctorData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const socketRef = useRef(null);

// Socket initialization handled in doctorData useEffect

useEffect(() => {
    const storedData = localStorage.getItem('doctorData');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      // Handle both old format (wrapped in 'data') and new format (direct object)
      if (parsedData.data && parsedData.data._id) {
        // Old format: { success: true, data: { _id: ... } }
        setDoctorData(parsedData.data);
      } else if (parsedData._id) {
        // New format: direct doctor object
        setDoctorData(parsedData);
      } else {
        // Invalid format, redirect to login
        localStorage.removeItem('doctorData');
        navigate('/doctor/signin');
        return;
      }
    } else {
      navigate('/doctor/signin');
      return;
    }
  }, [navigate]);

// Socket connection and registration
  useEffect(() => {
    if (!doctorData?._id) return;

    const socket = io('http://localhost:5000');
    socketRef.current = socket;

    // Register doctor
    socket.emit('register', doctorData._id);
    console.log('Doctor socket registered:', doctorData._id);

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [doctorData?._id]);

useEffect(() => {
    if (!doctorData?._id || !socketRef.current) return;

    const sendHeartbeat = async () => {
      try {
        await fetch('http://localhost:5000/api/doctors/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ doctorId: doctorData._id }),
        });
      } catch (error) {
        console.error('Heartbeat error:', error);
      }
    };

    sendHeartbeat();
    const heartbeatInterval = setInterval(sendHeartbeat, 30000);
    return () => clearInterval(heartbeatInterval);
  }, [doctorData?._id]);

const handleLogout = useCallback(async () => {
    if (doctorData?._id && socketRef.current) {
      try {
        await fetch('http://localhost:5000/api/doctors/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ doctorId: doctorData._id }),
        });
        socketRef.current.disconnect();
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    localStorage.removeItem('doctorData');
    socketRef.current = null;
    navigate('/doctor/signin');
  }, [doctorData?._id, navigate]);

const handleNavClick = useCallback((itemId) => {
    setActiveTab(itemId);
    setSidebarOpen(false);
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'profile', label: 'User Profile', icon: '👤' },
    { id: 'patients', label: 'Patients', icon: '🧑‍🤝‍🧑' },
    { id: 'appointments', label: 'Appointment', icon: '📅' },
    { id: 'communication', label: 'Communication', icon: '💬' },
    { id: 'prescription', label: 'Prescription', icon: '💊' },
    { id: 'labreports', label: 'Patient Lab Reports', icon: '📋' },
    { id: 'payments', label: 'Payment History', icon: '💳' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  const getProfilePhotoUrl = (photo) => {
    if (!photo) return null;
    if (photo.startsWith('http')) return photo;
    // Add cache-busting query parameter to ensure new photo is displayed
    const timestamp = new Date().getTime();
    return `http://localhost:5000${photo}?t=${timestamp}`;
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardHome doctorData={doctorData} />;
      case 'profile': return <UserProfile doctorData={doctorData} setDoctorData={setDoctorData} />;
      case 'patients': return (
        <div className="dashboard-home">
          <h2>🧑‍🤝‍🧑 Patients (Coming Soon)</h2>
          <p>Patient management features will be available here.</p>
        </div>
      );
      case 'appointments': return <Appointments doctorData={doctorData} />;
      case 'communication': return <Communication doctorData={doctorData} socket={socketRef.current} />;
      case 'prescription': return (
        <div className="dashboard-home">
          <h2>💊 Prescriptions (Coming Soon)</h2>
          <p>Prescription pad integration coming soon.</p>
        </div>
      );
      case 'labreports': return (
        <div className="dashboard-home">
          <h2>📋 Lab Reports (Coming Soon)</h2>
          <p>Patient lab report viewer coming soon.</p>
        </div>
      );
      case 'payments': return (
        <div className="dashboard-home">
          <h2>💳 Payments (Coming Soon)</h2>
          <p>Payment history and analytics coming soon.</p>
        </div>
      );
      case 'settings': return <DoctorSettings doctorData={doctorData} />;
      default: return <DashboardHome doctorData={doctorData} />;
    }
  };

  if (!doctorData) {
    return <div className="loading-container" aria-label="Loading dashboard">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <button 
        className="mobile-menu-btn" 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle sidebar"
      >
        <span className={`hamburger ${sidebarOpen ? 'open' : ''}`} aria-hidden="true"></span>
      </button>
      
      {sidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="logo-icon" aria-hidden="true">🏥</span>
            <span>MediConnect</span>
          </div>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">
            {doctorData.profilePhoto ? (
              <img 
                src={getProfilePhotoUrl(doctorData.profilePhoto)} 
                alt={`Profile photo of Dr. ${doctorData.name}`}
              />
            ) : (
              <span aria-label={`Dr. ${doctorData?.name?.charAt(0) || 'D'}`}>
                {doctorData?.name?.charAt(0) || 'D'}
              </span>
            )}
          </div>
          <div className="user-info">
            <h4>{doctorData.name}</h4>
            <p aria-label="Doctor ID">{doctorData.uniqueId}</p>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => handleNavClick(item.id)}
              aria-current={activeTab === item.id ? 'page' : undefined}
            >
              <span className="nav-icon" aria-hidden="true">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
          <button 
            className="nav-item logout-btn" 
            onClick={handleLogout}
            aria-label="Log out"
          >
            <span className="nav-icon" aria-hidden="true">🚪</span>
            <span className="nav-label">Logout</span>
          </button>
        </nav>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-welcome">
            <h1>Welcome back, Dr. {doctorData.name}!</h1>
            <p aria-label="Dashboard overview">Here's your practice overview</p>
          </div>
          <button className="notification-btn" aria-label="Notifications (3 new)">
            <span aria-hidden="true">🔔</span>
            <span className="notification-badge" aria-label="3 unread notifications">3</span>
          </button>
        </header>

        <div className="dashboard-content">
          {renderContent()}
        </div>
      </main>

      <DoctorChatbot 
        onNavigate={handleNavClick} 
        userProfilePhoto={doctorData?.profilePhoto}
      />
    </div>
  );
};





/* Patients tab handled in renderContent - no inline component needed */






// Prescriptions Component - Full Implementation
const Prescriptions = ({ doctorData }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('write');
  const [prescription, setPrescription] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportPrescriptions, setReportPrescriptions] = useState([]);
  const [loadingReport, setLoadingReport] = useState(false);
  const [selectedReportPrescription, setSelectedReportPrescription] = useState(null);
  const [deletingPrescriptionId, setDeletingPrescriptionId] = useState(null);
  const [stats, setStats] = useState({ total: 0, sentToday: 0, drafts: 0, viewed: 0 });
  const [prescriptionForm, setPrescriptionForm] = useState({});
  const [showPrescriptionDetailModal, setShowPrescriptionDetailModal] = useState(false);


  const handleDeletePrescription = async (prescriptionId) => {
    if (!window.confirm('Are you sure you want to delete this prescription? This action cannot be undone.')) {
      return;
    }
    try {
      setDeletingPrescriptionId(prescriptionId);
      const response = await fetch(`http://localhost:5000/api/prescriptions/${prescriptionId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        setReportPrescriptions(prev => prev.filter(p => p._id !== prescriptionId));
        alert('Prescription deleted successfully');
      } else {
        alert(data.message || 'Failed to delete prescription');
      }
    } catch (error) {
      console.error('Error deleting prescription:', error);
      alert('Failed to delete prescription');
    } finally {
      setDeletingPrescriptionId(null);
    }
  };

  const downloadReportPrescription = (prescription) => {
    const content = `PRESCRIPTION REPORT\n============================================================\nDoctor: Dr. ${doctorData.name}\nPatient: ${prescription.patientName}\nDate: ${new Date(prescription.date).toLocaleDateString()}\nStatus: ${prescription.status}${prescription.sentToPatient ? ' (Sent to Patient)' : ''}\n============================================================\n\nDIAGNOSIS:\n${prescription.diagnosis || 'N/A'}\n\nMEDICINES:\n${prescription.medicines?.map((m, i) => `${i+1}. ${m.name}\n   Dosage: ${m.dosage}\n   Frequency: ${m.frequency || 'N/A'}\n   Duration: ${m.duration}\n   Instructions: ${m.instructions || 'N/A'}\n`).join('\n\n') || 'None'}\n\nTESTS:\n${prescription.tests?.map((t, i) => `${i+1}. ${t.name}\n   Instructions: ${t.instructions || 'N/A'}\n`).join('\n\n') || 'None'}\n\nADVICE:\n${prescription.advice || 'N/A'}\n\nFOLLOW-UP:\n${prescription.followUpDate || 'N/A'}\n============================================================`;
    const blob = new Blob([content], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Prescription_${prescription.patientName.replace(/[^a-zA-Z0-9]/g, '_')}_${prescription.date}.txt`;
    a.click();
  };

  useEffect(() => {
    if (doctorData && doctorData._id) {
      fetchAppointments();
    }
  }, [doctorData]);

  const fetchAppointments = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/appointments/doctor/${doctorData._id}`);
      const data = await response.json();
      if (data.success) {
        const filteredAppointments = (data.data || []).filter(
          apt => (apt.status === 'booked' || apt.status === 'completed') && apt.paymentStatus === 'paid'
        );
        setAppointments(filteredAppointments);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctorPrescriptions = async () => {
    try {
      setLoadingReport(true);
      const response = await fetch(`http://localhost:5000/api/prescriptions/doctor/${doctorData._id}`);
      const data = await response.json();
      if (data.success) {
        // Format sentAt dates
        const formattedPrescriptions = (data.data || []).map(pres => ({
          ...pres,
          formattedSentAt: pres.sentAt ? new Date(pres.sentAt).toLocaleString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }) : 'N/A'
        }));
        setReportPrescriptions(formattedPrescriptions);
      } else {
        console.log('No prescriptions found or error:', data.message);
        setReportPrescriptions([]);
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      setReportPrescriptions([]);
    } finally {
      setLoadingReport(false);
    }
  };

  // Calculate prescription stats
  useEffect(() => {
    if (reportPrescriptions.length > 0) {
      const today = new Date().toDateString();
      setStats({
        total: reportPrescriptions.length,
        sentToday: reportPrescriptions.filter(p => 
          p.status === 'sent' && 
          new Date(p.formattedSentAt || p.date).toDateString() === today
        ).length,
        drafts: reportPrescriptions.filter(p => p.status === 'draft').length,
        viewed: reportPrescriptions.filter(p => p.status === 'viewed').length
      });
    } else {
      setStats({ total: 0, sentToday: 0, drafts: 0, viewed: 0 });
    }
  }, [reportPrescriptions]);


  const getPrescriptionStatusBadge = (status, sentToPatient) => {
    let badgeClass = 'status-badge ';
    let label = status;
    if (status === 'draft') {
      badgeClass += 'draft';
      label = 'Draft';
    } else if (status === 'sent') {
      badgeClass += 'sent';
      label = sentToPatient ? 'Sent ✓' : 'Sent';
    } else if (status === 'viewed') {
      badgeClass += 'viewed';
      label = 'Viewed ✓';
    }
    return <span className={badgeClass}>{label}</span>;
  };

  const fetchPrescription = async (appointmentId) => {
    try {

      const response = await fetch(`http://localhost:5000/api/prescriptions/appointment/${appointmentId}`);
      const data = await response.json();
      if (data.success) return data.data;
      return null;
    } catch (error) {
      console.error('Error fetching prescription:', error);
      return null;
    }
  };

  const handleFullDetails = async (appointment) => {
    setSelectedAppointment(appointment);
    const existingPrescription = await fetchPrescription(appointment._id);
    setPrescription(existingPrescription);
    setShowModal(true);
  };

  const handleWrite = async () => {
    setModalMode('write');
    
    // Fetch patient details for age/gender
    let patientDetails = null;
    try {
      const response = await fetch(`http://localhost:5000/api/patients/${selectedAppointment?.patientId}`);
      const data = await response.json();
      if (data.success) {
        patientDetails = data.data;
      }
    } catch (error) {
      console.error('Error fetching patient details:', error);
    }
    
    // Open Prescription pad.html in a new tab with patient data as URL parameters
    const patientName = selectedAppointment?.patientName || '';
    const patientId = selectedAppointment?.patientId || '';
    
    // Close the modal - user should use Prescription pad.html for writing prescriptions
    setShowModal(false);
    
    // Format age/gender for URL
    let ageGender = '';
    if (patientDetails) {
      if (patientDetails.dateOfBirth) {
        // Calculate age from DOB
        const today = new Date();
        const birthDate = new Date(patientDetails.dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        ageGender = age;
        if (patientDetails.gender) {
          ageGender += ' / ' + patientDetails.gender;
        }
      } else if (patientDetails.gender) {
        ageGender = patientDetails.gender;
      }
    }
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    
    // Build URL with query parameters
    const baseUrl = window.location.origin + '/client/public/Prescription pad.html';

    const params = new URLSearchParams();
    if (patientName) params.append('patientName', patientName);
    if (patientId) params.append('patientId', patientId);
    if (ageGender) params.append('ageGender', ageGender);
    params.append('date', dateStr);
    if (selectedAppointment?._id) params.append('appointmentId', selectedAppointment._id);
    if (doctorData?.name) params.append('doctorName', doctorData.name);
    
    // Open in new tab
    const fullUrl = `${baseUrl}?${params.toString()}`;
    window.open(fullUrl, '_blank');
    
    if (prescription) {
      setPrescriptionForm({
        diagnosis: prescription.diagnosis || '',
        medicines: prescription.medicines?.length ? prescription.medicines : [{ name: '', dosage: '', duration: '', instructions: '' }],
        tests: prescription.tests?.length ? prescription.tests : [{ name: '', instructions: '' }],
        advice: prescription.advice || '',
        followUpDate: prescription.followUpDate || ''
      });
    } else {
      setPrescriptionForm({ diagnosis: '', medicines: [{ name: '', dosage: '', duration: '', instructions: '' }], tests: [{ name: '', instructions: '' }], advice: '', followUpDate: '' });
    }
  };

  const handleView = async () => {
    setModalMode('view');
    const existingPrescription = await fetchPrescription(selectedAppointment._id);
    setPrescription(existingPrescription);
  };

  const handleSend = async () => {
    if (!prescription) return alert('No prescription to send');
    if (!window.confirm('Send this prescription to the patient?')) return;
    try {
      setSaving(true);
      const response = await fetch(`http://localhost:5000/api/prescriptions/${prescription._id}/send`, { method: 'PUT' });
      const data = await response.json();
      if (data.success) {
        alert('Prescription sent to patient!');
        setPrescription({ ...prescription, sentToPatient: true });
      } else alert(data.message || 'Failed');
    } catch (error) { console.error(error); alert('Failed'); }
    finally { setSaving(false); }
  };

  const handleSavePrescription = async () => {
    if (!prescriptionForm.diagnosis && !prescriptionForm.medicines[0].name && !prescriptionForm.tests[0].name) {
      return alert('Add at least one medicine, test, or diagnosis');
    }
    try {
      setSaving(true);
      const prescriptionData = {
        patientId: selectedAppointment.patientId,
        doctorId: doctorData._id,
        appointmentId: selectedAppointment._id,
        diagnosis: prescriptionForm.diagnosis,
        medicines: prescriptionForm.medicines.filter(m => m.name.trim()),
        tests: prescriptionForm.tests.filter(t => t.name.trim()),
        advice: prescriptionForm.advice,
        followUpDate: prescriptionForm.followUpDate,
        date: new Date().toISOString()
      };
      const response = await fetch('http://localhost:5000/api/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prescriptionData)
      });
      const data = await response.json();
      if (data.success) {
        alert('Prescription saved!');
        setPrescription(data.data);
        setModalMode('view');
      } else alert(data.message || 'Failed');
    } catch (error) { console.error(error); alert('Failed'); }
    finally { setSaving(false); }
  };

  const addMedicine = () => setPrescriptionForm({ ...prescriptionForm, medicines: [...prescriptionForm.medicines, { name: '', dosage: '', duration: '', instructions: '' }] });
  const removeMedicine = (i) => setPrescriptionForm({ ...prescriptionForm, medicines: prescriptionForm.medicines.filter((_, idx) => idx !== i) });
  const updateMedicine = (i, f, v) => { const m = [...prescriptionForm.medicines]; m[i][f] = v; setPrescriptionForm({ ...prescriptionForm, medicines: m }); };
  const addTest = () => setPrescriptionForm({ ...prescriptionForm, tests: [...prescriptionForm.tests, { name: '', instructions: '' }] });
  const removeTest = (i) => setPrescriptionForm({ ...prescriptionForm, tests: prescriptionForm.tests.filter((_, idx) => idx !== i) });
  const updateTest = (i, f, v) => { const t = [...prescriptionForm.tests]; t[i][f] = v; setPrescriptionForm({ ...prescriptionForm, tests: t }); };

  const downloadPrescription = () => {
    if (!prescription) return;
    const content = `PRESCRIPTION\n================================================================\nDoctor: Dr. ${doctorData.name}\nPatient: ${selectedAppointment.patientName}\nDate: ${new Date(prescription.date).toLocaleDateString()}\n================================================================\n\nDIAGNOSIS:\n${prescription.diagnosis || 'N/A'}\n\nMEDICINES:\n${prescription.medicines?.map((m, i) => `${i+1}. ${m.name}\nDosage: ${m.dosage}\nDuration: ${m.duration}\nInstructions: ${m.instructions || 'N/A'}`).join('\n\n') || 'N/A'}\n\nTESTS:\n${prescription.tests?.map((t, i) => `${i+1}. ${t.name}\nInstructions: ${t.instructions || 'N/A'}`).join('\n\n') || 'N/A'}\n\nADVICE:\n${prescription.advice || 'N/A'}\n\nFOLLOW-UP:\n${prescription.followUpDate || 'N/A'}\n================================================================`;
    const blob = new Blob([content], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Prescription_${selectedAppointment.patientName}.txt`;
    a.click();
  };

  const getPhoto = (p) => p ? (p.startsWith('http') ? p : `http://localhost:5000${p}?t=${Date.now()}`) : null;

  if (loading) return <div className="prescriptions-page"><div className="loading-container">Loading...</div></div>;

  return (
    <div className="prescriptions-page">
  <div className="prescriptions-header">
    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
          <h2>💊 Prescriptions</h2>
          <button 
            className="btn-report"
            style={{fontSize: '0.9em', padding: '8px 16px'}}
            onClick={() => { fetchDoctorPrescriptions(); setShowReportModal(true); }}
            disabled={loadingReport}
          >
            {loadingReport ? 'Loading...' : `📋 View Report (${reportPrescriptions.length})`}
          </button>
        </div>
        <p>Patients with confirmed/completed appointments</p>
      </div>

      {appointments.length === 0 ? (
        <div className="no-prescriptions"><div className="no-prescriptions-icon">💊</div><h3>No Patients</h3><p>No patients found</p></div>
      ) : (
        <div className="prescriptions-list">
          {appointments.map(apt => (
            <div key={apt._id} className="prescription-patient-card">
              <div className="prescription-patient-info">
                <div className="prescription-patient-photo">{getPhoto(apt.patientProfilePhoto) ? <img src={getPhoto(apt.patientProfilePhoto)} alt={apt.patientName} /> : <div className="patient-avatar-placeholder">{apt.patientName?.charAt(0)}</div>}</div>
                <div className="prescription-patient-details"><h3>{apt.patientName}</h3><p>📅 {apt.appointmentDate} at {apt.appointmentTime}</p><span className={`appointment-status ${apt.status}`}>{apt.status === 'completed' ? '✓ Completed' : '📅 Confirmed'}</span></div>
              </div>
              <button className="btn-full-details" onClick={() => handleFullDetails(apt)}>Full Details</button>
            </div>
          ))}
        </div>
      )}
      {showModal && (
        <div className="prescription-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="prescription-modal" onClick={e => e.stopPropagation()}>
            <div className="prescription-modal-header"><h2>Prescription Details</h2><button className="modal-close-btn" onClick={() => setShowModal(false)}>✕</button></div>
            <div className="prescription-modal-patient">
              <div className="modal-patient-photo">{getPhoto(selectedAppointment?.patientProfilePhoto) ? <img src={getPhoto(selectedAppointment.patientProfilePhoto)} alt={selectedAppointment.patientName} /> : <div className="patient-avatar-placeholder">{selectedAppointment?.patientName?.charAt(0)}</div>}</div>
              <div className="modal-patient-info"><h3>{selectedAppointment?.patientName}</h3><p>{selectedAppointment?.appointmentDate}</p>{prescription?.sentToPatient && <span className="sent-badge">✓ Sent</span>}</div>
            </div>
            <div className="prescription-action-buttons">
              <button className={`action-btn ${modalMode === 'write' ? 'active' : ''}`} onClick={handleWrite}>✏️ Write</button>
              <button className={`action-btn ${modalMode === 'view' ? 'active' : ''}`} onClick={handleView}>👁️ View</button>
              <button className={`action-btn`} onClick={() => { setModalMode('download'); downloadPrescription(); }}>⬇️ Download</button>
              <button className={`action-btn`} onClick={handleSend} disabled={saving}>{saving ? '...' : '📤 Send'}</button>
            </div>
            <div className="prescription-modal-content" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
              {modalMode === 'write' && (
                <PrescriptionPad 
                  doctorData={doctorData}
                  patientData={{ 
                    name: selectedAppointment?.patientName,
                    uniqueId: selectedAppointment?.patientId,
                    _id: selectedAppointment?.patientId
                  }}
                  appointmentData={selectedAppointment}
                  prescription={prescription}
                  onSave={handleSavePrescription}
                  onCancel={() => setShowModal(false)}
                  saving={saving}
                />
              )}
              {modalMode === 'view' && (
                <div className="prescription-view">
                  {prescription ? (
                    <>
                      <div className="view-section"><h4>Diagnosis</h4><p>{prescription.diagnosis || 'N/A'}</p></div>
                      <div className="view-section"><h4>Medicines</h4>{prescription.medicines?.map((m,i) => <li key={i}><strong>{m.name}</strong> - {m.dosage} for {m.duration}</li>) || 'N/A'}</div>
                      <div className="view-section"><h4>Tests</h4>{prescription.tests?.map((t,i) => <li key={i}>{t.name}</li>) || 'N/A'}</div>
                      <div className="view-section"><h4>Advice</h4><p>{prescription.advice || 'N/A'}</p></div>
                    </>
                  ) : <p>No prescription. <button onClick={handleWrite}>Write</button></p>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Prescription Report Modal */}
      {showReportModal && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)} style={{zIndex: 1001}}>
          <div className="report-modal" onClick={(e) => e.stopPropagation()} style={{maxWidth: '90vw', maxHeight: '90vh'}}>
            <div className="modal-header">
              <h2>📋 Prescription Report</h2>
              <button className="modal-close-btn" onClick={() => setShowReportModal(false)}>✕</button>
            </div>
            {loadingReport ? (
              <div className="loading-container" style={{padding: '40px', textAlign: 'center'}}>
                Loading prescriptions...
              </div>
            ) : reportPrescriptions.length === 0 ? (
              <div className="no-prescriptions" style={{padding: '40px', textAlign: 'center'}}>
                <div style={{fontSize: '48px', marginBottom: '16px'}}>📋</div>
                <h3>No Prescriptions Found</h3>
                <p>Create your first prescription using the Write button.</p>
              </div>
            ) : (
              <div className="prescriptions-report-container">
                {/* Stats Grid */}
                <div className="report-stats-grid">
                  <div className="stat-card total">
                    <span>Total Prescriptions</span>
                    <strong>{stats.total}</strong>
                  </div>
                  <div className="stat-card sent">
                    <span>Sent Today</span>
                    <strong>{stats.sentToday}</strong>
                  </div>
                  <div className="stat-card draft">
                    <span>Drafts</span>
                    <strong>{stats.drafts}</strong>
                  </div>
                  <div className="stat-card viewed">
                    <span>Viewed</span>
                    <strong>{stats.viewed}</strong>
                  </div>
                </div>

                {/* Modern Card Grid */}
                <div className="prescriptions-report-grid">
                  {reportPrescriptions.map((prescription) => (
                    <div className="prescription-report-card glassmorphism" key={prescription._id}>
                      <div className="report-card-header">
                        <div className="patient-avatar">
                          {prescription.patientName?.charAt(0)?.toUpperCase() || 'P'}
                        </div>
                        <div className="patient-info">
                          <div className="patient-name">{prescription.patientName}</div>
                          <div className="report-date">
                            {prescription.formattedSentAt || new Date(prescription.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="report-status">
                        {getPrescriptionStatusBadge(prescription.status, prescription.sentToPatient)}
                      </div>
                      <div className="report-actions">
                        <button 
                          className="btn-action btn-view-report"
                          onClick={() => {
                            setSelectedReportPrescription(prescription);
                            setShowPrescriptionDetailModal(true);
                          }}
                          title="View Details"
                        >
                          👁️
                        </button>
                        <button 
                          className="btn-action btn-download-report"
                          onClick={() => downloadReportPrescription(prescription)}
                          title="Download TXT"
                        >
                          ⬇️
                        </button>
                        <button 
                          className="btn-action btn-delete-report"
                          onClick={() => handleDeletePrescription(prescription._id)}
                          disabled={deletingPrescriptionId === prescription._id}
                          title="Delete"
                        >
                          {deletingPrescriptionId === prescription._id ? '...' : '🗑️'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Prescription Detail Modal */}
      {showPrescriptionDetailModal && selectedReportPrescription && (
        <div className="modal-overlay" onClick={() => setShowPrescriptionDetailModal(false)} style={{zIndex: 1002}}>
          <div className="prescription-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Prescription Details</h2>
              <button className="modal-close-btn" onClick={() => setShowPrescriptionDetailModal(false)}>✕</button>
            </div>
            <div className="prescription-detail-content">
              <div className="detail-section">
                <h4>Patient: {selectedReportPrescription.patientName}</h4>
                <p>Date: {new Date(selectedReportPrescription.date).toLocaleDateString()}</p>
                <p>Status: {getPrescriptionStatusBadge(selectedReportPrescription.status, selectedReportPrescription.sentToPatient)}</p>
              </div>
              {selectedReportPrescription.diagnosis && (
                <div className="detail-section">
                  <h4>Diagnosis</h4>
                  <p>{selectedReportPrescription.diagnosis}</p>
                </div>
              )}
              {selectedReportPrescription.medicines && selectedReportPrescription.medicines.length > 0 && (
                <div className="detail-section">
                  <h4>Medicines</h4>
                  <table>
                    <thead>
                      <tr><th>Name</th><th>Dosage</th><th>Duration</th><th>Instructions</th></tr>
                    </thead>
                    <tbody>
                      {selectedReportPrescription.medicines.map((med, idx) => (
                        <tr key={idx}>
                          <td>{med.name}</td>
                          <td>{med.dosage}</td>
                          <td>{med.duration}</td>
                          <td>{med.instructions}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {selectedReportPrescription.tests && selectedReportPrescription.tests.length > 0 && (
                <div className="detail-section">
                  <h4>Tests</h4>
                  <ul>
                    {selectedReportPrescription.tests.map((test, idx) => (
                      <li key={idx}>{test.name} {test.instructions && ` - ${test.instructions}`}</li>
                    ))}
                  </ul>
                </div>
              )}
              {selectedReportPrescription.advice && (
                <div className="detail-section">
                  <h4>Advice</h4>
                  <p>{selectedReportPrescription.advice}</p>
                </div>
              )}
              {selectedReportPrescription.followUpDate && (
                <div className="detail-section">
                  <h4>Follow-up</h4>
                  <p>{selectedReportPrescription.followUpDate}</p>
                </div>
              )}
              <div className="detail-actions">
                <button className="btn-primary" onClick={() => downloadReportPrescription(selectedReportPrescription)}>
                  ⬇️ Download TXT
                </button>
                <button className="btn-secondary" onClick={() => setShowPrescriptionDetailModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Lab Reports Component
const LabReports = ({ doctorData }) => {
  const [patientsWithReports, setPatientsWithReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedPatient, setExpandedPatient] = useState(null);
  const [expandedReport, setExpandedReport] = useState(null);

  useEffect(() => {
    if (doctorData && doctorData._id) {
      fetchPatientsWithLabReports();
    }
  }, [doctorData]);

  const fetchPatientsWithLabReports = async () => {
    try {
      setLoading(true);
      // Fetch appointments for this doctor
      const appointmentsResponse = await fetch(`http://localhost:5000/api/appointments/doctor/${doctorData._id}`);
      const appointmentsData = await appointmentsResponse.json();

      if (appointmentsData.success) {
        // Filter for completed appointments only
        const completedAppointments = (appointmentsData.data || []).filter(
          apt => apt.status === 'completed' && apt.paymentStatus === 'paid'
        );

        // Get unique patients from completed appointments
        const uniquePatientsMap = new Map();
        completedAppointments.forEach(apt => {
          if (!uniquePatientsMap.has(apt.patientId)) {
            uniquePatientsMap.set(apt.patientId, {
              patientId: apt.patientId,
              patientName: apt.patientName,
              patientProfilePhoto: apt.patientProfilePhoto,
              patientEmail: apt.patientEmail,
              patientPhone: apt.patientPhone
            });
          }
        });

        const uniquePatients = Array.from(uniquePatientsMap.values());

        // Fetch lab reports for each patient
        const patientsWithReportsPromises = uniquePatients.map(async (patient) => {
          try {
            const reportsResponse = await fetch(`http://localhost:5000/api/patients/lab-reports/${patient.patientId}`);
            const reportsData = await reportsResponse.json();

            if (reportsData.success && reportsData.labReports && reportsData.labReports.length > 0) {
              return {
                ...patient,
                labReports: reportsData.labReports
              };
            }
            return null;
          } catch (error) {
            console.error(`Error fetching lab reports for patient ${patient.patientId}:`, error);
            return null;
          }
        });

        const patientsWithReports = await Promise.all(patientsWithReportsPromises);
        const filteredPatients = patientsWithReports.filter(p => p !== null);
        setPatientsWithReports(filteredPatients);
      }
    } catch (error) {
      console.error('Error fetching patients with lab reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProfilePhotoUrl = (photo) => {
    if (!photo) return null;
    if (photo.startsWith('http')) return photo;
    const timestamp = new Date().getTime();
    return `http://localhost:5000${photo}?t=${timestamp}`;
  };

  const handleReportClick = (patientId, reportId) => {
    if (expandedPatient === patientId && expandedReport === reportId) {
      setExpandedPatient(null);
      setExpandedReport(null);
    } else {
      setExpandedPatient(patientId);
      setExpandedReport(reportId);
    }
  };

  const handleViewReport = (report) => {
    const fileUrl = `http://localhost:5000${report.filePath}`;
    window.open(fileUrl, '_blank');
  };

  const handleDownloadReport = async (report) => {
    try {
      const fileUrl = `http://localhost:5000${report.filePath}`;
      const link = document.createElement('a');
      link.href = fileUrl;
      
      // Extract filename from path or use report name
      const fileName = report.name.replace(/[^a-zA-Z0-9]/g, '_');
      const extension = report.fileType && report.fileType.includes('pdf') ? 'pdf' : 'jpg';
      link.download = `${fileName}.${extension}`;
      
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download report. Please try again.');
    }
  };

  const handleRemoveReport = async (report, patientId) => {
    if (!window.confirm(`Are you sure you want to remove "${report.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/patients/lab-reports/${patientId}/${report._id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('Lab report removed successfully!');
        fetchPatientsWithLabReports();
      } else {
        alert(data.message || 'Failed to remove report');
      }
    } catch (error) {
      console.error('Error removing report:', error);
      alert('Failed to remove report. Please try again.');
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="lab-reports-page">
        <div className="loading-container">Loading patient lab reports...</div>
      </div>
    );
  }

  return (
    <div className="lab-reports-page">
      <div className="lab-reports-header">
        <h2>📋 Patient Lab Reports</h2>
        <p>View lab reports for patients with completed appointments</p>
      </div>

      {patientsWithReports.length === 0 ? (
        <div className="no-lab-reports">
          <div className="no-reports-icon">📋</div>
          <h3>No Lab Reports Available</h3>
          <p>Lab reports from patients with completed appointments will appear here.</p>
        </div>
      ) : (
        <div className="patients-lab-reports-list">
          {patientsWithReports.map((patient) => (
            <div key={patient.patientId} className="patient-lab-report-card">
              <div className="patient-lab-report-header">
                <div className="patient-lab-report-info">
                  <div className="patient-lab-report-photo">
                    {patient.patientProfilePhoto ? (
                      <img 
                        src={getProfilePhotoUrl(patient.patientProfilePhoto)} 
                        alt={patient.patientName} 
                      />
                    ) : (
                      <div className="patient-avatar-placeholder">
                        {patient.patientName?.charAt(0) || 'P'}
                      </div>
                    )}
                  </div>
                  <div className="patient-lab-report-details">
                    <h3>{patient.patientName}</h3>
                    <p>{patient.patientEmail}</p>
                    <span className="lab-report-count">
                      {patient.labReports.length} report{patient.labReports.length !== 1 ? 's' : ''} available
                    </span>
                  </div>
                </div>
                <button 
                  className={`btn-report-toggle ${expandedPatient === patient.patientId ? 'active' : ''}`}
                  onClick={() => setExpandedPatient(expandedPatient === patient.patientId ? null : patient.patientId)}
                >
                  📋 Report ({patient.labReports.length})
                </button>
              </div>

              {expandedPatient === patient.patientId && (
                <div className="patient-lab-reports-expanded">
                  {patient.labReports.map((report) => (
                    <div key={report._id} className="lab-report-item">
                      <div className="lab-report-icon">
                        {report.fileType && report.fileType.includes('pdf') ? '📄' : '🖼️'}
                      </div>
                      <div className="lab-report-info">
                        <h4>{report.name}</h4>
                        <p>{report.labName || 'Unknown Lab'}</p>
                        <span className="lab-report-date">📅 {formatDate(report.uploadDate)}</span>
                      </div>
                      <div className="lab-report-actions">
                        <button 
                          className="btn-view-report"
                          onClick={() => handleViewReport(report)}
                        >
                          👁️ View
                        </button>
                        <button 
                          className="btn-download-report"
                          onClick={() => handleDownloadReport(report)}
                        >
                          ⬇️ Download
                        </button>
                        <button 
                          className="btn-remove-report"
                          onClick={() => handleRemoveReport(report, patient.patientId)}
                        >
                          🗑️ Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Payment History Component with Calendar
const PaymentHistory = ({ doctorData }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (doctorData && doctorData._id) {
      fetchPayments();
    }
  }, [doctorData]);

  const fetchPayments = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/payments/doctor/${doctorData._id}`);
      const data = await response.json();
      if (data.success) {
        setPayments(data.data.payments);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter payments by selected date
  const filteredPayments = selectedDate 
    ? payments.filter(p => p.appointmentDate === selectedDate)
    : payments;

  const totalEarned = payments.reduce((acc, p) => acc + (p.consultationFee || 0), 0);
  const filteredTotal = filteredPayments.reduce((acc, p) => acc + (p.consultationFee || 0), 0);

  // Calendar functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    return { daysInMonth, firstDay };
  };

  const { daysInMonth, firstDay } = getDaysInMonth(currentMonth);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  // Get dates with payments - convert to the same format as booking page (DD/MM/YYYY)
  const paymentDates = payments.map(p => {
    // The booking page stores dates as DD/MM/YYYY
    if (p.appointmentDate && p.appointmentDate.includes('/')) {
      return p.appointmentDate;
    }
    // Convert YYYY-MM-DD to DD/MM/YYYY if needed
    if (p.appointmentDate && p.appointmentDate.includes('-')) {
      const parts = p.appointmentDate.split('-');
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return p.appointmentDate;
  });

  const handleDateClick = (day) => {
    // Create date in DD/MM/YYYY format to match booking page
    const dayStr = String(day).padStart(2, '0');
    const monthStr = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const dateStr = `${dayStr}/${monthStr}/${currentMonth.getFullYear()}`;
    console.log('Clicked date:', dateStr);
    console.log('Available payment dates:', paymentDates);
    if (paymentDates.includes(dateStr)) {
      setSelectedDate(selectedDate === dateStr ? null : dateStr);
    }
  };

  // Generate calendar days
  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dayStr = String(day).padStart(2, '0');
    const monthStr = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const dateStr = `${dayStr}/${monthStr}/${currentMonth.getFullYear()}`;
    const hasPayment = paymentDates.includes(dateStr);
    const isSelected = selectedDate === dateStr;
    calendarDays.push(
      <div
        key={day}
        className={`calendar-day ${hasPayment ? 'has-payment' : ''} ${isSelected ? 'selected' : ''}`}
        onClick={() => hasPayment && handleDateClick(day)}
      >
        {day}
        {hasPayment && <span className="payment-dot"></span>}
      </div>
    );
  }

  if (loading) {
    return <div className="loading-container">Loading payments...</div>;
  }

  return (
    <div className="payment-history">
      <h2>💳 Payment History</h2>
      
      <div className="payment-stats">
        <div className="payment-stat-card">
          <span className="stat-label">Total Earnings</span>
          <span className="stat-value">₹{totalEarned.toLocaleString()}</span>
        </div>
        <div className="payment-stat-card">
          <span className="stat-label">Total Payments</span>
          <span className="stat-value">{payments.length}</span>
        </div>
        {selectedDate && (
          <div className="payment-stat-card highlight">
            <span className="stat-label">Selected Date Earnings</span>
            <span className="stat-value">₹{filteredTotal.toLocaleString()}</span>
          </div>
        )}
      </div>

      <div className="payment-content">
        <div className="calendar-section">
          <div className="calendar-header">
            <button onClick={prevMonth}>‹</button>
            <h3>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h3>
            <button onClick={nextMonth}>›</button>
          </div>
          <div className="calendar-weekdays">
            <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
          </div>
          <div className="calendar-days">
            {calendarDays}
          </div>
          {selectedDate && (
            <button className="clear-filter" onClick={() => setSelectedDate(null)}>
              Clear Filter
            </button>
          )}
        </div>

        <div className="payments-list-section">
          <h3>
            {selectedDate ? `Payments on ${selectedDate}` : 'All Payments'}
            <span className="payment-count">({filteredPayments.length})</span>
          </h3>
          
          {filteredPayments.length === 0 ? (
            <div className="no-payments">
              <p>No payments found{selectedDate ? ` for ${selectedDate}` : ''}</p>
            </div>
          ) : (
            <div className="payments-list">
              {filteredPayments.map((payment) => (
                <div key={payment.id} className="payment-item">
                  <div className="payment-info">
                    <div className="patient-name">{payment.patientName}</div>
                    <div className="payment-meta">
                      <span className="payment-date">📅 {payment.appointmentDate}</span>
                      <span className="payment-time">⏰ {payment.appointmentTime}</span>
                    </div>
                    <div className="payment-details">
                      <span className="doctor-id">Doctor ID: {payment.doctorId}</span>
                      {payment.paymentId && <span className="transaction-id">TXN: {payment.paymentId}</span>}
                    </div>
                  </div>
                  <div className="payment-amount">
                    ₹{payment.consultationFee}
                  </div>
                </div>
              ))}
</div>
          )}
        </div>
      </div>
    </div>
  );
};


export default DoctorDashboard;
