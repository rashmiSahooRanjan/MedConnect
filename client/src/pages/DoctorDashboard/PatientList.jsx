import { useState, useEffect } from 'react';
import { Users, Search, Phone, Mail } from 'lucide-react';

import { useNavigate } from 'react-router-dom';

const PatientList = ({ doctorData }) => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (doctorData && doctorData._id) {
      fetchPatients();
    }
  }, [doctorData]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/appointments/doctor/${doctorData._id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          // Group appointments by patient to get unique patients
          const patientMap = new Map();
data.data.filter(apt => ['booked', 'confirmed', 'completed', 'cancelled'].includes(apt.status)).forEach(apt => {
            if (!patientMap.has(apt.patientId)) {
              patientMap.set(apt.patientId, {
                _id: apt.patientId,
                name: apt.patientName,
                email: apt.patientEmail,
                phone: apt.patientPhone,
                latestAppointment: apt.appointmentDate,
                totalAppointments: 1
              });
            } else {
              const existing = patientMap.get(apt.patientId);
              existing.totalAppointments += 1;
              if (new Date(apt.appointmentDate) > new Date(existing.latestAppointment)) {
                existing.latestAppointment = apt.appointmentDate;
              }
            }
          });
          setPatients(Array.from(patientMap.values()));
        }
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      // Demo data
      setPatients([
        { _id: 'p1', name: 'John Doe', email: 'john@example.com', phone: '+91 98765 43210', latestAppointment: '2024-01-15', totalAppointments: 3 },
        { _id: 'p2', name: 'Jane Smith', email: 'jane@example.com', phone: '+91 98765 43211', latestAppointment: '2024-01-12', totalAppointments: 2 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="loading-container" style={{minHeight: '400px'}}>Loading patients...</div>;
  }

  return (
    <div className="patient-list-page">
      <div className="page-header-modern">
        <div>
          <h1>👥 Patient List</h1>
          <p>Manage your patients and view appointment history</p>
        </div>
        <div className="search-box-modern">
          <Search size={20} />
          <input 
            placeholder="Search patients by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="stats-grid" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr)', marginBottom: '2rem'}}>
        <div className="stat-card" style={{borderLeftColor: '#3b82f6'}}>
          <div className="stat-icon" style={{backgroundColor: 'rgba(59,130,246,0.1)'}}>
            <Users size={24} />
          </div>
          <div className="stat-info">
            <h3>{patients.length}</h3>
            <p>Total Patients</p>
          </div>
        </div>
      </div>

      <div className="patients-grid">
        {filteredPatients.map(patient => (
          <div key={patient._id} className="patient-card-modern">
            <div className="patient-header">
              <div className="patient-avatar" style={{background: '#10b981'}}>
                {patient.name.charAt(0)}
              </div>
              <div>
                <h3>{patient.name}</h3>
                <p>{patient.totalAppointments} appointments</p>
              </div>
            </div>
            <div className="patient-details">
              <div className="detail-item">
                <Mail size={16} />
                <span>{patient.email}</span>
              </div>
              <div className="detail-item">
                <Phone size={16} />
                <span>{patient.phone}</span>
              </div>
              <div className="detail-item">
                <span>Last visit: {new Date(patient.latestAppointment).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="patient-actions">
              <button className="btn-view-history" onClick={() => navigate(`/doctor/dashboard/patient-history/${patient._id}`)}>View History</button>
              <button className="btn-new-appointment">New Appointment</button>
            </div>
          </div>
        ))}
        {filteredPatients.length === 0 && (
          <div className="no-patients">
            <Users size={64} />
            <h3>No patients found</h3>
            <p>{searchQuery ? 'Try a different search term' : 'Get started by accepting appointments'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientList;

