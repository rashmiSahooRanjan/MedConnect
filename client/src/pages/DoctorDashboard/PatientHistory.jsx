import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Calendar, ArrowLeft, User, Phone, Mail } from 'lucide-react';

const PatientHistory = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patientData, setPatientData] = useState(null);
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctorData, setDoctorData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
  const loadData = async () => {
      try {
        setLoading(true);
        console.log('Loading PatientHistory for patientId:', patientId);
        
        // Get doctor data from localStorage
        const storedDoctor = localStorage.getItem('doctorData');
        console.log('localStorage doctorData:', storedDoctor ? 'Found' : 'Missing');
        if (!storedDoctor) {
          setError('No doctor data found. Please login as doctor first.');
          return;
        }
        const doctor = JSON.parse(storedDoctor);
        console.log('Doctor ID:', doctor._id);
        setDoctorData(doctor);

        // Demo fallback data
        const demoPatient = { name: 'Demo Patient', email: 'demo@example.com', contactNumber: '+91 9876543210', profilePhoto: '' };
        const demoHistory = [
          { id: 'demo1', appointmentType: 'ONLINE', bookingReason: 'Follow-up consultation', appointmentDate: '2024-11-20', appointmentTime: '10:30 AM', status: 'completed', consultationFee: 500 },
          { id: 'demo2', appointmentType: 'OFFLINE', bookingReason: 'General checkup', appointmentDate: '2024-11-15', appointmentTime: '14:00 PM', status: 'completed', consultationFee: 800 }
        ];
        setPatientData(demoPatient);
        setHistoryItems(demoHistory);
        
        // Try real API calls
        console.log('Fetching patient profile...');
        const patientRes = await fetch(`http://localhost:5000/api/patients/${patientId}`);
        console.log('Patient API status:', patientRes.status);
        if (patientRes.ok) {
          const patientResult = await patientRes.json();
          console.log('Patient data:', patientResult.data);
          setPatientData(patientResult.data || demoPatient);
        }

        console.log('Fetching appointments...');
        const historyRes = await fetch(`http://localhost:5000/api/appointments/doctor/${doctor._id}/patient/${patientId}`);
        console.log('Appointments API status:', historyRes.status);
        if (historyRes.ok) {
          const historyResult = await historyRes.json();
          console.log('Appointments data:', historyResult);
          if (historyResult.success && historyResult.data.length > 0) {
            const historyData = historyResult.data.map(apt => ({
              id: apt._id,
              type: 'appointment',
              appointmentType: apt.appointmentType.toUpperCase(),
              bookingReason: apt.notes || 'General consultation',
              appointmentDate: new Date(apt.appointmentDate).toLocaleDateString('en-IN'),
              appointmentTime: apt.appointmentTime,
              status: apt.status,
              consultationFee: apt.consultationFee,
              _raw: apt
            }));
            setHistoryItems(historyData);
          } else {
            console.log('No real appointments, using demo');
          }
        }
      } catch (err) {
        console.error('Error loading patient history:', err);
        setError(`Error: ${err.message}. Check browser console & ensure backend running on localhost:5000`);
        // Use demo data on error
        setPatientData({ name: 'Demo Patient', email: 'demo@example.com', contactNumber: '+91 9876543210' });
        setHistoryItems([
          { id: 'demo1', appointmentType: 'ONLINE', bookingReason: 'Follow-up', appointmentDate: '2024-11-20', appointmentTime: '10:30 AM', status: 'completed', consultationFee: 500 }
        ]);
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      loadData();
    }
  }, [patientId]);

  if (loading) {
    return (
      <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div className="loading-container">Loading patient history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{minHeight: '100vh', padding: '2rem', textAlign: 'center'}}>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/doctor/dashboard')} className="btn-back" style={{marginTop: '1rem'}}>
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '1rem' }}>
      {/* Page Header */}
      <div style={{ 
        background: 'white', 
        borderRadius: '12px', 
        padding: '1.5rem', 
        marginBottom: '1.5rem', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button 
            onClick={() => navigate('/doctor/dashboard')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem', 
              background: '#6b7280', color: 'white', border: 'none', 
              padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' 
            }}
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <h1 style={{ margin: 0, fontSize: '1.75rem' }}>📜 Patient History</h1>
        </div>
        
        {/* Patient Profile Header */}
        {patientData && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem', 
            marginTop: '1.5rem', 
            padding: '1.5rem', 
            background: '#f0f9ff', 
            borderRadius: '12px',
            flexWrap: 'wrap'
          }}>
            <div style={{ 
              width: '80px', height: '80px', 
              borderRadius: '50%', 
              background: '#e0e7ff', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', fontWeight: 'bold', overflow: 'hidden', border: '3px solid #3b82f6'
            }}>
              {patientData.profilePhoto ? (
                <img 
                  src={`http://localhost:5000${patientData.profilePhoto}`} 
                  alt={patientData.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                patientData.name?.charAt(0)?.toUpperCase()
              )}
            </div>
            <div>
              <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '1.5rem' }}>
                {patientData.name || 'Unknown Patient'}
              </h2>
              {patientData.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                  <Mail size={16} />
                  <span>{patientData.email}</span>
                </div>
              )}
              {patientData.contactNumber && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280' }}>
                  <Phone size={16} />
                  <span>{patientData.contactNumber}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Appointments History */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={20} />
          Appointment History ({historyItems.length})
        </h3>
        
        {historyItems.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {historyItems.map((item) => (
              <div key={item.id} style={{ 
                padding: '1.25rem', 
                border: '1px solid #e5e7eb', 
                borderRadius: '8px',
                background: '#fafbfc'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ 
                      width: '10px', height: '10px', 
                      borderRadius: '50%', 
                      background: '#10b981' 
                    }} />
                    <strong>{item.appointmentType} Appointment</strong>
                  </div>
                  <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {item.appointmentDate} • {item.appointmentTime}
                  </span>
                </div>
                <div style={{ 
                  padding: '0.75rem', 
                  background: '#f3f4f6', 
                  borderRadius: '6px', 
                  marginBottom: '0.75rem',
                  fontSize: '0.875rem'
                }}>
                  <strong>Booking Reason:</strong> {item.bookingReason}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  Status: <span style={{ color: '#059669', fontWeight: '500' }}>{item.status.toUpperCase()}</span> • 
                  Fee: ₹{item.consultationFee}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem 1rem', 
            color: '#6b7280' 
          }}>
            <Clock size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <h3>No appointments found</h3>
            <p>This patient has no appointment history with you yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientHistory;

