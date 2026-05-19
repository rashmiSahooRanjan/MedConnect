import { useState, useEffect } from 'react';

const DashboardHome = ({ doctorData }) => {
  const [appointments, setAppointments] = useState([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (doctorData && doctorData._id) {
      fetchData();
    }
  }, [doctorData]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
      const appointmentsRes = await fetch(`http://localhost:5000/api/appointments/doctor/${doctorData._id}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!appointmentsRes.ok) {
        throw new Error(`HTTP ${appointmentsRes.status}: ${appointmentsRes.statusText}`);
      }
      
      const appointmentsData = await appointmentsRes.json();
      if (appointmentsData.success) {
        setAppointments(appointmentsData.data || []);
      } else {
        console.warn('Dashboard data partial success:', appointmentsData);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn('Dashboard fetch timeout - showing cached/offline UI');
      } else {
        console.error('Dashboard fetch error:', error);
      }
      // Don't clear loading - show error UI instead
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate appointment statistics
  const totalAppointments = appointments.length;
  const confirmedAppointments = appointments.filter(a => a.status === 'booked').length;
  const completedAppointments = appointments.filter(a => a.status === 'completed').length;
  const cancelledAppointments = appointments.filter(a => a.status === 'cancelled').length;
  const pendingAppointments = appointments.filter(a => a.status === 'booked' && a.paymentStatus === 'paid').length;

  // Calculate monthly data for the last 6 months
  const getMonthlyData = () => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = monthDate.toLocaleDateString('en-US', { month: 'short' });
      const monthAppointments = appointments.filter(a => {
        const aptDate = new Date(a.appointmentDate);
        return aptDate.getMonth() === monthDate.getMonth() &&
               aptDate.getFullYear() === monthDate.getFullYear();
      });
      months.push({
        name: monthName,
        count: monthAppointments.length,
        completed: monthAppointments.filter(a => a.status === 'completed').length
      });
    }
    return months;
  };

  const monthlyData = getMonthlyData();
  const maxMonthlyCount = Math.max(...monthlyData.map(m => m.count), 1);

  const getStatusPercentages = () => {
    if (totalAppointments === 0) return { completed: 0, cancelled: 0, pending: 0 };
    return {
      completed: Math.round((completedAppointments / totalAppointments) * 100),
      cancelled: Math.round((cancelledAppointments / totalAppointments) * 100),
      pending: Math.round((pendingAppointments / totalAppointments) * 100)
    };
  };

  const statusPercentages = getStatusPercentages();

  const getUpcomingAppointments = () => {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return appointments
      .filter(a => {
        const aptDate = new Date(a.appointmentDate);
        return a.status === 'booked' && a.paymentStatus === 'paid' &&
               aptDate >= now && aptDate <= nextWeek;
      })
      .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
      .slice(0, 3);
  };

  const upcomingAppointments = getUpcomingAppointments();

  const totalEarnings = appointments
    .filter(a => a.paymentStatus === 'paid')
    .reduce((sum, a) => sum + (a.consultationFee || 0), 0);

  const stats = [
    { label: 'Total Patients', value: appointments.filter((a, index, self) => self.findIndex(b => b.patientId === a.patientId) === index).length, icon: '🧑‍🤝‍🧑', color: '#0D9488' },
    { label: 'Appointments Today', value: appointments.filter(a => {
      const today = new Date().toDateString();
      const aptDate = new Date(a.appointmentDate).toDateString();
      return aptDate === today && a.status === 'booked';
    }).length, icon: '📅', color: '#8B5CF6' },
    { label: 'Pending Confirmations', value: appointments.filter(a => a.status === 'booked' && a.paymentStatus === 'paid').length, icon: '⏳', color: '#F59E0B' },
    { label: 'Total Earnings', value: `₹${totalEarnings.toLocaleString()}`, icon: '💰', color: '#10B981' },
  ];

  if (loading) {
    return <div className="loading-container">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-home">
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

      <div className="dashboard-sections">
        <div className="dashboard-section">
          <h2>📅 Upcoming Appointments</h2>
          <div className="appointments-list">
            {upcomingAppointments.length > 0 ? upcomingAppointments.map((apt, index) => (
              <div key={index} className="appointment-item">
                <div className="appointment-time">{apt.appointmentTime}</div>
                <div className="appointment-details">
                  <h4>{apt.patientName}</h4>
                  <p>{apt.appointmentType}</p>
                </div>
              </div>
            )) : (
              <div className="no-appointments">No upcoming appointments</div>
            )}
          </div>
        </div>

        <div className="dashboard-section">
          <h2>🧑‍🤝‍🧑 Recent Patients</h2>
          <div className="patients-list">
            {appointments.slice(0, 3).map((appointment, index) => (
              <div key={index} className="patient-item">
                <div className="patient-avatar">{appointment.patientName?.charAt(0) || 'P'}</div>
                <div className="patient-details">
                  <h4>{appointment.patientName}</h4>
                  <p>{appointment.appointmentType}</p>
                  <span className="last-visit">Last visit: {appointment.appointmentDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="analysis-section">
        <div className="analysis-header">
          <div className="analysis-header-content">
            <h3>Practice Analysis</h3>
            <p>Visual breakdown of your practice data</p>
          </div>
          <div className="analysis-header-badge">
            <span className="badge-icon">📊</span>
            <span>Insights</span>
          </div>
        </div>
        <div className="analysis-grid">
          <div className="analysis-card donut-card">
            <div className="analysis-card-header">
              <h4>Appointment Status</h4>
              <span className="card-badge">Live</span>
            </div>
            <div className="chart-container donut-container">
              {totalAppointments > 0 ? (
                <div className="donut-chart-wrapper">
                  <div className="donut-chart">
                    <svg viewBox="0 0 100 100" className="donut-svg">
                      <circle cx="50" cy="50" r="35" fill="transparent" stroke="#e2e8f0" strokeWidth="12" />
                      {statusPercentages.completed > 0 && (
                        <circle cx="50" cy="50" r="35" fill="transparent" stroke="#10B981" strokeWidth="12"
                          strokeDasharray={`${statusPercentages.completed * 2.2} ${220 - statusPercentages.completed * 2.2}`}
                          strokeDashoffset="0" transform="rotate(-90 50 50)" className="donut-segment completed-segment" />
                      )}
                      {statusPercentages.cancelled > 0 && (
                        <circle cx="50" cy="50" r="35" fill="transparent" stroke="#EF4444" strokeWidth="12"
                          strokeDasharray={`${statusPercentages.cancelled * 2.2} ${220 - statusPercentages.cancelled * 2.2}`}
                          strokeDashoffset={`-${statusPercentages.completed * 2.2}`} transform="rotate(-90 50 50)" className="donut-segment cancelled-segment" />
                      )}
                      {statusPercentages.pending > 0 && (
                        <circle cx="50" cy="50" r="35" fill="transparent" stroke="#F59E0B" strokeWidth="12"
                          strokeDasharray={`${statusPercentages.pending * 2.2} ${220 - statusPercentages.pending * 2.2}`}
                          strokeDashoffset={`-${(statusPercentages.completed + statusPercentages.cancelled) * 2.2}`} transform="rotate(-90 50 50)" className="donut-segment pending-segment" />
                      )}
                    </svg>
                    <div className="donut-center">
                      <span className="donut-center-value">{totalAppointments}</span>
                      <span className="donut-center-label">Total</span>
                    </div>
                  </div>
                  <div className="donut-legend">
                    <div className="legend-item completed"><span className="legend-dot"></span><span>Completed</span><span>{completedAppointments}</span></div>
                    <div className="legend-item cancelled"><span className="legend-dot"></span><span>Cancelled</span><span>{cancelledAppointments}</span></div>
                    <div className="legend-item pending"><span className="legend-dot"></span><span>Pending</span><span>{pendingAppointments}</span></div>
                  </div>
                </div>
              ) : (
                <div className="no-data-state">
                  <div className="no-data-icon">📋</div>
                  <p>No appointments yet</p>
                  <span>Book your first appointment to see insights</span>
                </div>
              )}
            </div>
          </div>

          <div className="analysis-card bar-card">
            <div className="analysis-card-header">
              <h4>Monthly Trends</h4>
              <span className="card-period">Last 6 months</span>
            </div>
            <div className="chart-container bar-container">
              <div className="enhanced-bar-chart">
                {monthlyData.map((month, index) => (
                  <div key={index} className="bar-column">
                    <div className="bar-tooltip">{month.count} appointments</div>
                    <div className="bar-wrapper">
                      <div
                        className="bar"
                        style={{height: `${maxMonthlyCount > 0 ? Math.max((month.count/maxMonthlyCount)*100, 5) : 5}%`}}
                        data-completed={month.completed}
                        data-count={month.count}
                      >
                        {month.count > 0 && <span className="bar-value">{month.count}</span>}
                      </div>
                    </div>
                    <span className="bar-label">{month.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;

