import { useState, useEffect } from 'react';
import './patient dashboard css/paymenthistory.css';

const PaymentHistory = ({ patientData }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [error, setError] = useState(null);

  useEffect(() => {
    if (patientData && patientData._id) {
      fetchPaymentHistory();
    }
  }, [patientData]);

  const [stats, setStats] = useState([
    { label: 'Total Paid', value: 'Rs.0', icon: '💰', color: '#10B981' },
    { label: 'Transactions', value: '0', icon: '📊', color: '#8B5CF6' },
    { label: 'Avg Payment', value: 'Rs.0', icon: '📈', color: '#F59E0B' }
  ]);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/appointments/patient/${patientData._id}`);
      const data = await response.json();

      if (response.ok) {
        const paidAppointments = data.data
          .filter(apt => apt.paymentStatus === 'paid')
          .map(apt => ({
            id: apt._id,
            description: `Consultation - ${apt.doctorName}`,
            doctorName: apt.doctorName,
            doctorId: apt.doctorId,
            date: apt.appointmentDate,
            time: apt.appointmentTime,
            amount: `Rs.${apt.consultationFee}`,
            status: 'Paid'
          }));
        setPayments(paidAppointments);
        
        // Update stats
        const totalAmount = paidAppointments.reduce((sum, p) => sum + parseInt(p.amount.replace('Rs.', '') || 0), 0);
        const avgAmount = paidAppointments.length > 0 ? Math.round(totalAmount / paidAppointments.length) : 0;
        
        setStats([
          { label: 'Total Paid', value: `Rs.${totalAmount}`, icon: '💰', color: '#10B981' },
          { label: 'Transactions', value: paidAppointments.length.toString(), icon: '📊', color: '#8B5CF6' },
          { label: 'Avg Payment', value: `Rs.${avgAmount}`, icon: '📈', color: '#F59E0B' }
        ]);
      } else {
        setError(data.message || 'Failed to fetch payment history');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Error fetching payment history:', err);
    } finally {
      setLoading(false);
    }
  };


  const formatDateForCalendar = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    return dateStr;
  };

  const paymentDates = payments.map(p => formatDateForCalendar(p.date));

  const filteredPayments = selectedDate 
    ? payments.filter(p => formatDateForCalendar(p.date) === selectedDate)
    : payments;

  const totalPaid = payments.reduce((acc, p) => acc + parseInt(p.amount.replace('Rs.', '')), 0);

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
      const hasPayment = paymentDates.includes(currentDate);
      days.push({ day: i, date: currentDate, hasPayment });
    }
    
    return days;
  };

  const handleDateClick = (dayInfo) => {
    if (dayInfo.empty || !dayInfo.hasPayment) return;
    setSelectedDate(dayInfo.date === selectedDate ? null : dayInfo.date);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleClearFilter = () => {
    setSelectedDate(null);
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const date = new Date(parts[2], parts[1] - 1, parts[0]);
      return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? dateStr : date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="dashboard-home">
        <div className="payment-container">
          <div className="loading-container">Loading payment history...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-home">
      <div className="payment-container">
        {/* Stats Grid */}
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card" style={{ borderLeftColor: stat.color }}>
              <div className="stat-icon" style={{ backgroundColor: `${stat.color}20` }}>
                <span style={{ color: stat.color }}>{stat.icon}</span>
              </div>
              <div className="stat-info">
                <h3>{stat.value}</h3>
                <p>{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="section-header">
          <h2>Payment History</h2>
          {selectedDate && (
            <button className="btn-clear-filter" onClick={handleClearFilter}>
              X Clear Filter
            </button>
          )}
        </div>

        <div className="payment-calendar-section">
          <div className="payment-calendar">
            <div className="calendar-header">
              <button className="calendar-nav" onClick={handlePrevMonth}>prev</button>
              <span className="calendar-month">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <button className="calendar-nav" onClick={handleNextMonth}>next</button>
            </div>
            <div className="calendar-weekdays">
              <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
            </div>
            <div className="calendar-days">
              {getDaysInMonth(currentMonth).map((dayInfo, index) => (
                <button
                  key={index}
                  className={`calendar-day ${dayInfo.empty ? 'empty' : ''} ${dayInfo.hasPayment ? 'has-payment' : ''} ${dayInfo.date === selectedDate ? 'selected' : ''}`}
                  onClick={() => handleDateClick(dayInfo)}
                  disabled={dayInfo.empty || !dayInfo.hasPayment}
                >
                  {dayInfo.day}
                  {dayInfo.hasPayment && <span className="payment-dot"></span>}
                </button>
              ))}
            </div>
          </div>
          <div className="calendar-legend">
            <div className="legend-item">
              <span className="legend-dot has-payment"></span>
              <span>Date with payment</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot selected"></span>
              <span>Selected date</span>
            </div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {filteredPayments.length === 0 ? (
          <div className="no-payments">
            <p>No payment records found {selectedDate ? 'for the selected date' : ''}</p>
          </div>
        ) : (
          <div className="payments-list">
            {filteredPayments.map((payment) => (
              <div key={payment.id} className="payment-item">
                <div className="payment-info">
                  <h4>{payment.description}</h4>
                  <div className="payment-details">
                    <span className="doctor-id">👨‍⚕️ Doctor ID: {payment.doctorId}</span>
                    <span className="payment-date">📅 {payment.date}</span>
                    <span className="payment-time">🕐 {payment.time}</span>
                  </div>
                </div>
                <div className="payment-right">
                  <span className="payment-amount">{payment.amount}</span>
                  <span className={`payment-status ${payment.status.toLowerCase()}`}>
                    {payment.status === 'Paid' ? '✓ Paid' : '⏳ Pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentHistory;
