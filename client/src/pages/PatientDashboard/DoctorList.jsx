import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './patient dashboard css/doctorlist.css';

const DoctorList = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOnlyActive, setShowOnlyActive] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/doctors/available');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        
        if (result.success) {
          setDoctors(result.data || []);
          setError(null);
        } else {
          setError(result.message || 'Failed to fetch doctors');
        }
      } catch (err) {
        console.error('Fetch doctors error:', err);
        setError('Failed to connect to server. Please check if backend is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
    const interval = setInterval(fetchDoctors, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const getPhotoUrl = (photoPath) => {
    if (!photoPath) return '/medicon.svg'; // fallback to app icon
    if (photoPath.startsWith('http')) return photoPath;
    return `http://localhost:5000${photoPath.startsWith('/') ? '' : '/'}${photoPath}`;
  };

  const formatExperience = (years) => {
    if (!years) return 'N/A';
    const numYears = parseInt(years);
    return numYears > 0 ? `${numYears} ${numYears === 1 ? 'year' : 'years'}` : 'N/A';
  };

  const filteredDoctors = showOnlyActive 
    ? doctors.filter(doctor => doctor.isOnline === true)
    : doctors;

  const activeCount = doctors.filter(d => d.isOnline === true).length;

  if (loading) {
    return (
      <div className="dashboard-home">
        <div className="doctors-container" style={{minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div className="loading-container" style={{textAlign: 'center'}}>
            <div style={{width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px'}}></div>
            <p>Loading doctors...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-home">
        <div className="doctors-container" style={{minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px'}}>
          <div className="error-message" style={{background: '#fee2e2', color: '#991b1b', padding: '20px 32px', borderRadius: '12px', textAlign: 'center', maxWidth: '500px'}}>
            <h3>Error loading doctors</h3>
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              style={{marginTop: '12px', padding: '8px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer'}}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-home">
      <div className="doctors-container">
        <div className="section-header" style={{marginBottom: '24px'}}>
          <h2 style={{margin: 0, fontSize: '28px', fontWeight: 700, color: '#1e293b'}}>Our Expert Doctors</h2>
          <p style={{margin: '8px 0 0 0', color: '#64748b', fontSize: '16px'}}>Find and book appointments with top specialists</p>
        </div>

        <div className="doctors-filter" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '12px'}}>
          <label className="filter-toggle" style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
            <input 
              type="checkbox" 
              checked={showOnlyActive}
              onChange={(e) => setShowOnlyActive(e.target.checked)}
              style={{width: '18px', height: '18px'}}
            />
            <span className="filter-label" style={{fontSize: '14px', color: '#475569'}}>
              Show only active doctors
            </span>
          </label>
          <span className="active-count" style={{fontSize: '14px', fontWeight: 500, color: '#059669'}}>
            {activeCount} doctor{activeCount !== 1 ? 's' : ''} active now
          </span>
        </div>

        {filteredDoctors.length === 0 ? (
          <div className="no-doctors-message" style={{textAlign: 'center', padding: '64px 32px', color: '#64748b'}}>
            {showOnlyActive ? (
              <>
                <div style={{fontSize: '48px', marginBottom: '16px'}}>👨‍⚕️</div>
                <p style={{fontSize: '18px', marginBottom: '8px'}}>No active doctors right now</p>
                <p>Toggle to see all available doctors or check back later</p>
              </>
            ) : (
              <>
                <div style={{fontSize: '48px', marginBottom: '16px'}}>🔍</div>
                <p style={{fontSize: '18px'}}>No doctors available</p>
                <p>Please check back later</p>
              </>
            )}
          </div>
        ) : (
          <div className="doctors-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px'}}>
            {filteredDoctors.map((doctor) => (
              <div key={doctor._id} className="doctor-card" style={{
                background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0,0, 0.1), 0 2px 4px -1px rgba(0, 0,0, 0.06)',
                border: '1px solid #e2e8f0', transition: 'all 0.2s'
              }}>
                <div className="doctor-avatar-small" style={{width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', marginBottom: '16px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  {doctor.profilePhoto ? (
                    <img 
                      src={getPhotoUrl(doctor.profilePhoto)} 
                      alt={`${doctor.name}, ${doctor.specialist}`}
                      style={{width: '100%', height: '100%', objectFit: 'cover'}}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <span style={{fontSize: '20px', fontWeight: 600, color: '#475569', display: doctor.profilePhoto ? 'none' : 'flex'}}>[Dr]</span>
                </div>
                <div className="doctor-info">
                  <h3 style={{margin: '0 0 4px 0', fontSize: '20px', fontWeight: 700, color: '#1e293b'}}>{doctor.name}</h3>
                  <p className="doctor-specialty" style={{margin: '0 0 12px 0', fontSize: '16px', fontWeight: 500, color: '#3b82f6'}}>{doctor.specialist}</p>
                  <div className="doctor-meta" style={{display: 'flex', gap: '16px', marginBottom: '12px', fontSize: '14px', color: '#64748b'}}>
                    <span>👨‍⚕️ {formatExperience(doctor.yearOfExperience)}</span>
                    <span>💰 Rs. {doctor.consultationFee || 500}/consult</span>
                  </div>
                  <div className="doctor-timing" style={{marginBottom: '16px', fontSize: '14px', color: '#64748b'}}>
                    🕒 {doctor.timing || '9:00 AM - 5:00 PM'}
                  </div>
                  <div className={`availability-badge ${doctor.isOnline ? 'available' : 'unavailable'}`} style={{
                    display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                    background: doctor.isOnline ? '#dcfce7' : '#fef2f2', color: doctor.isOnline ? '#166534' : '#991b1b'
                  }}>
                    {doctor.isOnline ? '🟢 Active Now' : '🔴 Not Active'}
                  </div>
                  <button 
                    className="btn-book-appointment" 
                    onClick={() => doctor.isOnline && navigate(`/booking?doctorId=${doctor._id}`)}
                    disabled={!doctor.isOnline}
                  >
                    <span>{doctor.isOnline ? '📅 Book Appointment' : 'Not Available'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorList;

