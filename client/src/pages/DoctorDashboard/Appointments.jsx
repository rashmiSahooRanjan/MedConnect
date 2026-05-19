import { useState, useEffect } from 'react';
import PrescriptionPad from '../../components/PrescriptionPad';

const Appointments = ({ doctorData }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedPatientData, setSelectedPatientData] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
const [savingPrescription, setSavingPrescription] = useState(false);

  const validateToken = async () => {
    const token = localStorage.getItem('doctorToken');
    if (!token) {
      console.error('❌ Appointments: No doctorToken found');
      localStorage.removeItem('doctorData');
      localStorage.removeItem('doctorToken');
      window.location.href = '/doctor/signin';
      return false;
    }

    try {
      // Verify doctor exists via public endpoint
      const response = await fetch(`http://localhost:5000/api/doctors/${doctorData._id}`);
      
      if (!response.ok) {
        throw new Error(`Doctor profile fetch failed: ${response.status}`);
      }
      
      const profileData = await response.json();
      if (!profileData._id) {
        throw new Error('Invalid doctor data');
      }
      
      console.log('✅ Appointments: Token validated');
      return true;
    } catch (error) {
      console.error('❌ Appointments: Token validation failed:', error);
      localStorage.removeItem('doctorData');
      localStorage.removeItem('doctorToken');
      alert('Session expired. Redirecting to login...');
      window.location.href = '/doctor/signin';
      return false;
    }
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('doctorToken');
    return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
  };

  useEffect(() => {
    if (doctorData && doctorData._id) {
      fetchAppointments();
    }
  }, [doctorData]);

  const fetchAppointments = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/appointments/doctor/${doctorData._id}`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setAppointments(data.data);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (appointmentId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/appointments/${appointmentId}/confirm`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      
      if (data.success) {
        const notification = {
          id: Date.now(),
          title: 'Appointment Confirmed',
          message: `Appointment confirmed for ${data.data.patientName}`,
          time: new Date().toLocaleTimeString(),
          type: 'success'
        };
        setNotifications(prev => [notification, ...prev]);
        fetchAppointments();
        alert('Appointment confirmed successfully!');
      } else {
        alert(data.message || 'Failed to confirm appointment');
      }
    } catch (error) {
      console.error('Error confirming appointment:', error);
      alert('Failed to confirm appointment');
    }
  };

  const handleCancel = async (appointmentId) => {
    if (!window.confirm('Cancel appointment? Patient will be refunded.')) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/appointments/${appointmentId}/cancel-with-refund`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ reason: 'Cancelled by doctor' })
      });
      const data = await response.json();
      
      if (data.success) {
        fetchAppointments();
        alert('Appointment cancelled & refund initiated!');
      } else {
        alert(data.message || 'Failed to cancel');
      }
    } catch (error) {
      alert('Failed to cancel appointment');
    }
  };

  const handleRefund = async (appointmentId) => {
    if (!window.confirm('Process refund?')) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/appointments/${appointmentId}/cancel-with-refund`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ reason: 'Refund by doctor' })
      });
      const data = await response.json();
      
      if (data.success) {
        fetchAppointments();
        alert('Refund processed!');
      }
    } catch (error) {
      alert('Failed to process refund');
    }
  };

  const handleOpenPrescription = (appointment) => {
    setSelectedPatientData({
      _id: appointment.patientId,
      name: appointment.patientName,
      phone: appointment.patientPhone
    });
    setSelectedAppointment(appointment);
    setShowPrescriptionModal(true);
  };

  const handleSavePrescription = async (prescriptionData) => {
    const isTokenValid = await validateToken();
    if (!isTokenValid) return;
    
    setSavingPrescription(true);
    console.log('Appointments handleSavePrescription data:', prescriptionData);
    try {
      const payload = {
        patientId: selectedPatientData._id,
        doctorId: doctorData._id,
        appointmentId: selectedAppointment._id,
        patientName: selectedPatientData.name,
        doctorName: doctorData.name,
        date: prescriptionData.date || new Date().toLocaleDateString(),
        diagnosis: prescriptionData.diagnosis || '',
        medicines: prescriptionData.medicines.map(m => ({
          name: m.name,
          dosage: m.dose,
          frequency: m.frequency,
          duration: m.duration,
          instructions: ''
        })),
        advice: Array.isArray(prescriptionData.advice) ? prescriptionData.advice.join(', ') : prescriptionData.advice,
        followUpDate: prescriptionData.followUpDate || ''
      };
      console.log('Sending payload:', payload);
      const res = await fetch('http://localhost:5000/api/prescriptions', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      console.log('Backend response:', data);
      if (res.ok && data.success) {
        alert('✅ Prescription saved!');
        setShowPrescriptionModal(false);
        setSelectedPatientData(null);
        setSelectedAppointment(null);
        fetchAppointments();
      } else {
        alert(data.message || 'Error saving');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Network error: ' + error.message);
    } finally {
      setSavingPrescription(false);
    }
  };

  const totalAppointments = appointments.length;
  const confirmedAppointments = appointments.filter(a => a.status === 'confirmed').length;
  const completedAppointments = appointments.filter(a => a.status === 'completed').length;
  const cancelledAppointments = appointments.filter(a => a.status === 'cancelled').length;

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = searchQuery === '' || 
      apt.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.patientEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.patientPhone?.includes(searchQuery);
    
    if (!matchesSearch) return false;
    
    if (activeTab === 'all') return true;
    if (activeTab === 'paid') return apt.paymentStatus === 'paid' && apt.status !== 'cancelled';
    if (activeTab === 'confirmed') return apt.status === 'confirmed';
    if (activeTab === 'completed') return apt.status === 'completed';
    if (activeTab === 'cancelled') return apt.status === 'cancelled';
    return true;
  });

  const getStatusBadge = (appointment) => {
    if (appointment.status === 'cancelled') return <span className="status-badge cancelled"><span></span>Cancelled</span>;
    if (appointment.paymentStatus === 'refunded') return <span className="status-badge refunded"><span></span>Refunded</span>;
    if (appointment.paymentStatus === 'paid') return <span className="status-badge paid"><span></span>Paid</span>;
    if (appointment.status === 'completed') return <span className="status-badge completed"><span></span>Completed</span>;
    return <span className="status-badge pending"><span></span>Pending</span>;
  };

  const getAppointmentTypeIcon = (type) => {
    const typeLower = type?.toLowerCase() || '';
    if (typeLower.includes('video')) return '📹';
    if (typeLower.includes('follow')) return '🔄';
    if (typeLower.includes('checkup')) return '🩺';
    if (typeLower.includes('emergency')) return '🚨';
    return '📅';
  };

  if (loading) return <div className="loading-container">Loading appointments...</div>;

  return (
    <div className="appointments-page-modern">
      <div className="appointments-stats">
        <div className="stat-card-modern total">
          <div className="stat-icon-modern">📋</div>
          <div className="stat-content-modern">
            <span className="stat-number">{totalAppointments}</span>
            <span className="stat-label">Total</span>
          </div>
        </div>
        <div className="stat-card-modern confirmed">
          <div className="stat-icon-modern">✓</div>
          <div className="stat-content-modern">
            <span className="stat-number">{confirmedAppointments}</span>
            <span className="stat-label">Confirmed</span>
          </div>
        </div>
        <div className="stat-card-modern completed">
          <div className="stat-icon-modern">✓✓</div>
          <div className="stat-content-modern">
            <span className="stat-number">{completedAppointments}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>
        <div className="stat-card-modern cancelled">
          <div className="stat-icon-modern">✕</div>
          <div className="stat-content-modern">
            <span className="stat-number">{cancelledAppointments}</span>
            <span className="stat-label">Cancelled</span>
          </div>
        </div>
      </div>

      <div className="appointments-header-modern">
        <div className="header-left-modern">
          <h2>Appointments</h2>
          <p>Manage and track all patient appointments</p>
        </div>
        <div className="header-right-modern">
          <div className="search-box-modern">
            <span>🔍</span>
            <input 
              type="text" 
              placeholder="Search patient..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && <button className="clear-search" onClick={() => setSearchQuery('')}>✕</button>}
          </div>
        </div>
      </div>

      <div className="appointments-tabs-modern">
        <button className={`tab-modern ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
          <span>📋</span>All <span>{totalAppointments}</span>
        </button>
        <button className={`tab-modern ${activeTab === 'paid' ? 'active' : ''}`} onClick={() => setActiveTab('paid')}>
          <span>💳</span>Paid <span>{appointments.filter(a => a.paymentStatus === 'paid' && a.status !== 'cancelled').length}</span>
        </button>
        <button className={`tab-modern ${activeTab === 'confirmed' ? 'active' : ''}`} onClick={() => setActiveTab('confirmed')}>
          <span>📅</span>Confirmed <span>{confirmedAppointments}</span>
        </button>
        <button className={`tab-modern ${activeTab === 'completed' ? 'active' : ''}`} onClick={() => setActiveTab('completed')}>
          <span>✓</span>Completed <span>{completedAppointments}</span>
        </button>
        <button className={`tab-modern ${activeTab === 'cancelled' ? 'active' : ''}`} onClick={() => setActiveTab('cancelled')}>
          <span>✕</span>Cancelled <span>{cancelledAppointments}</span>
        </button>
      </div>

      <div className="appointments-list-modern">
        {filteredAppointments.length === 0 ? (
          <div className="no-appointments-modern">
            <div>📅</div>
            <h3>No appointments found</h3>
            <p>{searchQuery ? 'Try adjusting search' : 'No appointments'}</p>
          </div>
        ) : (
          filteredAppointments.map((appointment) => (
            <div key={appointment._id} className="appointment-card-modern">
              <div className="appointment-date-box-modern">
                <span>{appointment.appointmentDate?.split('/')[0] || '--'}</span>
                <span>{appointment.appointmentDate?.split('/')[1] || '--'}</span>
                <span>{appointment.appointmentDate?.split('/')[2] || '--'}</span>
              </div>
              
              <div className="appointment-patient-modern">
                <div className="patient-avatar-modern">{appointment.patientName?.charAt(0) || 'P'}</div>
                <div className="patient-details-modern">
                  <h3>{appointment.patientName}</h3>
                  <div>
                    <span>📧 {appointment.patientEmail}</span>
                    <span>📞 {appointment.patientPhone}</span>
                  </div>
                </div>
              </div>
              
              <div className="appointment-details-modern">
                <div><span>⏰</span><span>{appointment.appointmentTime}</span></div>
                <div><span>{getAppointmentTypeIcon(appointment.appointmentType)}</span><span>{appointment.appointmentType}</span></div>
                <div className="fee"><span>💰</span><span>₹{appointment.consultationFee}</span></div>
              </div>
              
              <div className="appointment-status-modern">
                {getStatusBadge(appointment)}
                {appointment.refundAmount > 0 && <span>₹{appointment.refundAmount} refunded</span>}
              </div>
              
              <div className="appointment-actions-modern">
                {appointment.paymentStatus === 'paid' && appointment.status !== 'cancelled' && appointment.status !== 'completed' && appointment.status !== 'confirmed' && (
                  <>
                    <button className="btn-action btn-confirm-modern" onClick={() => handleConfirm(appointment._id)}>
                      <span>✓</span>Confirm
                    </button>
                    <button className="btn-action btn-cancel-modern" onClick={() => handleCancel(appointment._id)}>
                      <span>✕</span>Cancel
                    </button>
                  </>
                )}
                {appointment.paymentStatus === 'paid' && appointment.status === 'confirmed' && (
                  <>
                    <button className="btn-action btn-cancel-modern" onClick={() => handleCancel(appointment._id)}>
                      <span>✕</span>Cancel
                    </button>
                    <button className="btn-action btn-prescription-modern" onClick={() => handleOpenPrescription(appointment)}>
                      <span>📝</span>Prescription
                    </button>
                    <button className="btn-action btn-refund-modern" onClick={() => handleRefund(appointment._id)}>
                      <span>💰</span>Refund
                    </button>
                  </>
                )}
                {appointment.status === 'cancelled' && (
                  <>
                    <span className="status-text cancelled">Cancelled</span>
                    {appointment.paymentStatus === 'paid' && (
                      <button className="btn-action btn-refund-modern" onClick={() => handleRefund(appointment._id)}>
                        <span>💰</span>Process Refund
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      {showPrescriptionModal && selectedPatientData && selectedAppointment && (
        <div className="modal-overlay" onClick={() => setShowPrescriptionModal(false)}>
          <div className="modal-content-fullscreen" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Write Prescription for {selectedPatientData.name}</h2>
              <button className="close-btn" onClick={() => setShowPrescriptionModal(false)}>×</button>
            </div>
            <PrescriptionPad 
              doctorData={doctorData}
              patientData={selectedPatientData}
              appointmentData={selectedAppointment}
              onSave={handleSavePrescription}
              onCancel={() => setShowPrescriptionModal(false)}
              saving={savingPrescription}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
