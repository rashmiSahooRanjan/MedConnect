import { useState, useEffect } from 'react';
import { DollarSign, Calendar, Search, Filter, Download } from 'lucide-react';

const PaymentHistory = ({ doctorData }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (doctorData && doctorData._id) {
      fetchPayments();
    }
  }, [doctorData]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      // Note: Would need backend route like /api/payments/doctor/:id
      // For now, derive from appointments
      const res = await fetch(`http://localhost:5000/api/appointments/doctor/${doctorData._id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const paymentData = data.data
            .filter(apt => apt.paymentStatus === 'paid')
            .map(apt => ({
              _id: apt._id,
              patientName: apt.patientName,
              appointmentDate: apt.appointmentDate,
              amount: apt.consultationFee || 500,
              status: 'completed',
              paymentDate: apt.createdAt
            }));
          setPayments(paymentData);
        }
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      // Demo data
      setPayments([
        { _id: 'pay1', patientName: 'John Doe', appointmentDate: '2024-01-20', amount: 1500, status: 'completed', paymentDate: '2024-01-20' },
        { _id: 'pay2', patientName: 'Jane Smith', appointmentDate: '2024-01-18', amount: 1200, status: 'completed', paymentDate: '2024-01-18' },
        { _id: 'pay3', patientName: 'Bob Johnson', appointmentDate: '2024-01-15', amount: 800, status: 'completed', paymentDate: '2024-01-15' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(p => 
    p.patientName.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (filterStatus === 'all' || p.status === filterStatus)
  );

  const totalEarnings = payments.reduce((sum, p) => sum + p.amount, 0);
  const thisMonthEarnings = payments
    .filter(p => new Date(p.paymentDate).getMonth() === new Date().getMonth())
    .reduce((sum, p) => sum + p.amount, 0);

  if (loading) {
    return <div className="loading-container" style={{minHeight: '400px'}}>Loading payments...</div>;
  }

  return (
    <div className="payment-history-page">
      <div className="page-header-modern">
        <div>
          <h1>💰 Payment History</h1>
          <p>Track your earnings and payment details</p>
        </div>
        <div className="header-controls">
          <div className="search-box-modern">
            <Search size={20} />
            <input 
              placeholder="Search payments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="refunded">Refunded</option>
          </select>
          <button className="btn-download">
            <Download size={20} />
            Export
          </button>
        </div>
      </div>

      <div className="stats-grid" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr)'}}>
        <div className="stat-card" style={{borderLeftColor: '#10b981'}}>
          <div className="stat-icon" style={{backgroundColor: 'rgba(16,185,129,0.1)'}}>
            <DollarSign size={24} />
          </div>
          <div className="stat-info">
            <h3>₹{totalEarnings.toLocaleString()}</h3>
            <p>Total Earnings</p>
          </div>
        </div>
        <div className="stat-card" style={{borderLeftColor: '#3b82f6'}}>
          <div className="stat-icon" style={{backgroundColor: 'rgba(59,130,246,0.1)'}}>
            <Calendar size={24} />
          </div>
          <div className="stat-info">
            <h3>₹{thisMonthEarnings.toLocaleString()}</h3>
            <p>This Month</p>
          </div>
        </div>
      </div>

      <div className="payments-list">
        <div className="table-header">
          <span>Patient</span>
          <span>Date</span>
          <span>Amount</span>
          <span>Status</span>
        </div>
        {filteredPayments.map(payment => (
          <div key={payment._id} className="payment-row">
            <span className="patient-name">{payment.patientName}</span>
            <span>{new Date(payment.appointmentDate).toLocaleDateString()}</span>
            <span className="amount">₹{payment.amount.toLocaleString()}</span>
            <span className={`status-badge ${payment.status}`}>
              {payment.status.toUpperCase()}
            </span>
          </div>
        ))}
        {filteredPayments.length === 0 && (
          <div className="no-payments">
            <DollarSign size={64} />
            <h3>No payments match your filter</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentHistory;

