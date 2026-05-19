import { useState, useEffect } from 'react';
import './patient dashboard css/appointment.css'
const Appointments = ({ patientData }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [cancellingId, setCancellingId] = useState(null);

  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return new Date(parts[2], parts[1] - 1, parts[0]);
    }
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '';
    const date = parseDate(dateStr);
    if (!date) return dateStr;
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const formatDateForFilter = (dateStr) => {
    if (!dateStr) return '';
    const date = parseDate(dateStr);
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const fetchAppointments = async () => {
    if (!patientData || !patientData._id) return;
    
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/appointments/patient/${patientData._id}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setAppointments(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch appointments');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [patientData]);

  const handleCancelAppointment = async (appointmentId) => {
    const reason = window.prompt('Please provide a reason for cancellation (optional):');
    
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      setCancellingId(appointmentId);
      const response = await fetch(`http://localhost:5000/api/appointments/${appointmentId}/cancel-with-refund`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          reason: reason || 'Cancelled by patient'
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAppointments(appointments.map(apt => 
          apt._id === appointmentId ? { 
            ...apt, 
            status: 'cancelled',
            paymentStatus: 'refunded',
            notes: reason || 'Cancelled by patient',
            refundAmount: apt.consultationFee
          } : apt
        ));
        alert('Appointment cancelled successfully. Refund will be processed.');
      } else {
        alert(data.message || 'Failed to cancel appointment');
      }
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      alert('Failed to cancel appointment. Please try again.');
    } finally {
      setCancellingId(null);
    }
  };

  const formatDateForCalendar = (dateStr) => {
    return formatDateForFilter(dateStr);
  };

  const getStatusDisplay = (apt) => {
    if (apt.status === 'cancelled') return 'Cancelled';
    if (apt.status === 'completed') return 'Completed';
    if (apt.paymentStatus === 'paid') return 'Confirmed';
    return 'Pending';
  };

  const getStatusClass = (apt) => {
    if (apt.status === 'cancelled') return 'cancelled';
    if (apt.status === 'completed') return 'completed';
    if (apt.paymentStatus === 'paid') return 'confirmed';
    return 'pending';
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'upcoming' && apt.status === 'booked' && apt.paymentStatus === 'paid') ||
      (activeTab === 'completed' && apt.status === 'completed') ||
      (activeTab === 'cancelled' && apt.status === 'cancelled');
    
    const matchesDate = !selectedDate || formatDateForCalendar(apt.appointmentDate) === selectedDate;
    
    return matchesTab && matchesDate;
  });

  const appointmentDates = appointments.map(apt => formatDateForCalendar(apt.appointmentDate));

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    
    for (let i = 0; i < startingDay; i++) {
      days.push({ day: null, empty: true });
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const hasAppointment = appointmentDates.includes(currentDate);
      days.push({ day: i, date: currentDate, hasAppointment });
    }
    
    return days;
  };

  const handleDateClick = (dayInfo) => {
    if (dayInfo.empty) return;
    setSelectedDate(dayInfo.date === selectedDate ? '' : dayInfo.date);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleClearFilter = () => {
    setSelectedDate('');
  };

  const getTabCounts = () => {
    return {
      all: appointments.length,
      upcoming: appointments.filter(a => a.status === 'booked' && a.paymentStatus === 'paid').length,
      completed: appointments.filter(a => a.status === 'completed').length,
      cancelled: appointments.filter(a => a.status === 'cancelled').length,
    };
  };

  const tabCounts = getTabCounts();

  const getPaymentStatusDisplay = (apt) => {
    if (apt.paymentStatus === 'paid') return 'Paid';
    if (apt.paymentStatus === 'pending') return 'Pending';
    if (apt.paymentStatus === 'refunded') return 'Refunded';
    return apt.paymentStatus;
  };

  if (loading) {
    return (
      <div className="dashboard-home">
        <div className="appointments-container">
          <div className="loading-container">Loading appointments...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-home">
      <div className="appointments-container appointments-page-modern">
        <div className="appointments-header-modern">
          <div className="header-left-modern">
            <h2>My Appointments</h2>
            <p>View and manage your appointments</p>
          </div>
          <div className="header-right-modern">
            {selectedDate && (
              <button className="btn-clear-filter" onClick={handleClearFilter}>
                ✕ Clear Date Filter
              </button>
            )}
          </div>
        </div>

        <div className="appointment-calendar-section">
          <div className="appointment-calendar">
            <div className="calendar-header">
              <button className="calendar-nav" onClick={handlePrevMonth}>‹</button>
              <span className="calendar-month">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <button className="calendar-nav" onClick={handleNextMonth}>›</button>
            </div>
            <div className="calendar-weekdays">
              <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
            </div>
            <div className="calendar-days">
              {getDaysInMonth(currentMonth).map((dayInfo, index) => (
                <button
                  key={index}
                  className={`calendar-day ${dayInfo.empty ? 'empty' : ''} ${dayInfo.hasAppointment ? 'has-appointment' : ''} ${dayInfo.date === selectedDate ? 'selected' : ''}`}
                  onClick={() => handleDateClick(dayInfo)}
                  disabled={dayInfo.empty}
                >
                  {dayInfo.day}
                  {dayInfo.hasAppointment && <span className="appointment-dot"></span>}
                </button>
              ))}
            </div>
          </div>
          <div className="calendar-legend">
            <div className="legend-item">
              <span className="legend-dot has-appointment"></span>
              <span>Date with appointment</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot selected"></span>
              <span>Selected date</span>
            </div>
          </div>
        </div>

        <div className="appointments-tabs-modern">
          <button 
            className={`tab-modern ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All <span className="tab-count">{tabCounts.all}</span>
          </button>
          <button 
            className={`tab-modern ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming <span className="tab-count">{tabCounts.upcoming}</span>
          </button>
          <button 
            className={`tab-modern ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            Completed <span className="tab-count">{tabCounts.completed}</span>
          </button>
          <button 
            className={`tab-modern ${activeTab === 'cancelled' ? 'active' : ''}`}
            onClick={() => setActiveTab('cancelled')}
          >
            Cancelled <span className="tab-count">{tabCounts.cancelled}</span>
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {filteredAppointments.length === 0 ? (
          <div className="no-appointments-modern">
            <div className="empty-state-icon">📅</div>
            <h3>No Appointments Found</h3>
            <p>{selectedDate ? 'No appointments on the selected date' : "You don't have any appointments yet"}</p>
          </div>
        ) : (
          <div className="appointments-list-modern">
            {filteredAppointments.map((apt) => (
              <div key={apt._id} className={`appointment-card-modern ${getStatusClass(apt)}`}>
                <div className="appointment-date-box-modern">
                  <span className="date-day">{parseDate(apt.appointmentDate)?.getDate() || '-'}</span>
                  <span className="date-month">{parseDate(apt.appointmentDate)?.toLocaleDateString('en-US', { month: 'short' }) || '-'}</span>
                  <span className="date-year">{parseDate(apt.appointmentDate)?.getFullYear() || '-'}</span>
                </div>
                
                <div className="appointment-patient-modern">
                  <div className="patient-avatar-modern">
                    {apt.doctorName ? apt.doctorName.split(' ').map(n => n[0]).join('').slice(0, 2) : 'Dr'}
                  </div>
                  <div className="patient-details-modern">
                    <h3>{apt.doctorName || 'Doctor'}</h3>
                    <p className="patient-specialty">{apt.doctorSpecialty || 'General'}</p>
                    <div className="patient-contact">
                      <span>📅 {apt.appointmentType === 'online' ? 'Online' : 'Offline'} Consultation</span>
                    </div>
                  </div>
                </div>
                
                <div className="appointment-details-modern">
                  <div className="detail-row">
                    <span className="detail-icon">🕐</span>
                    <span className="detail-text">{apt.appointmentTime}</span>
                  </div>
                  <div className="detail-row fee">
                    <span className="detail-icon">💰</span>
                    <span className="detail-text">₹{apt.consultationFee}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-icon">📍</span>
                    <span className="detail-text">{formatDateDisplay(apt.appointmentDate)}</span>
                  </div>
                </div>
                
                <div className="appointment-status-modern">
                  <span className={`status-badge ${getStatusClass(apt)}`}>
                    <span className="status-dot"></span>
                    {getStatusDisplay(apt)}
                  </span>
                  <span className={`status-badge payment-${apt.paymentStatus}`}>
                    {getPaymentStatusDisplay(apt)}
                  </span>
                </div>
                
                <div className="appointment-actions-modern">
                  {apt.status === 'booked' && apt.paymentStatus === 'paid' && (
                    <button 
                      className="btn-action btn-cancel-modern"
                      onClick={() => handleCancelAppointment(apt._id)}
                      disabled={cancellingId === apt._id}
                    >
                      {cancellingId === apt._id ? 'Cancelling...' : 'Cancel'}
                    </button>
                  )}
                  {apt.status === 'cancelled' && apt.paymentStatus === 'refunded' && (
                    <span className="refund-badge">Refund: ₹{apt.refundAmount || apt.consultationFee}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointments;

