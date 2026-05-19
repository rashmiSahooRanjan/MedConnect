import { useState, useEffect } from 'react';
import { Calendar, User, FileText, CreditCard, Pill, Activity, Clock } from 'lucide-react';
import './doctor-history.css';

const History = ({ doctorData, selectedPatient }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [expandedItems, setExpandedItems] = useState({});

  useEffect(() => {
    if (doctorData && doctorData._id) {
      fetchDoctorHistory();
    } else {
      console.log('No doctorData._id available:', doctorData);
    }
  }, [doctorData, selectedPatient]);

  useEffect(() => {
    console.log('Doctor History mounted, doctorData:', doctorData, 'selectedPatient:', selectedPatient);
  }, []);

  const fetchDoctorHistory = async () => {
    try {
      setLoading(true);
      let historyData = [];

      // Use unified doctor history API (appointments + prescriptions + messages)
      const response = await fetch(`http://localhost:5000/api/doctors/${doctorData._id}/history`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          historyData = data.data;
          console.log('Loaded real unified history:', historyData.length, 'items from /doctors/:id/history');
        } else {
          console.log('No history data returned');
        }
      } else {
        console.log('History API failed:', response.status);
      }

      const sortedHistory = historyData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setHistory(sortedHistory);
    } catch (error) {
      console.error('Error fetching doctor history:', error);
      console.log('Using empty history - create appointments/prescriptions/messages to populate');
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatRelativeTime = (timestamp) => {
    const now = new Date();
    const diffMs = now - new Date(timestamp);
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return formatDate(timestamp);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      appointment: <Calendar size={20} />,
      payment: <CreditCard size={20} />,
      lab: <FileText size={20} />,
      prescription: <Pill size={20} />,
      communication: <Activity size={20} />,
      profile: <User size={20} />
    };
    return icons[category] || <Activity size={20} />;
  };

  const getCategoryColor = (category) => {
    const colors = {
      appointment: 'bg-blue-100 text-blue-800',
      payment: 'bg-green-100 text-green-800',
      lab: 'bg-orange-100 text-orange-800',
      prescription: 'bg-purple-100 text-purple-800',
      communication: 'bg-indigo-100 text-indigo-800',
      profile: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const filteredHistory = history.filter(item => 
    activeTab === 'all' || item.category === activeTab
  );

  const groupedHistory = filteredHistory.reduce((acc, item) => {
    const dateKey = formatDate(item.timestamp);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(item);
    return acc;
  }, {});

  const toggleExpanded = (id) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const tabs = [
    { id: 'all', label: 'All', count: history.length },
    { id: 'appointment', label: 'Appointments', count: history.filter(h => h.category === 'appointment').length },
    { id: 'payment', label: 'Payments', count: history.filter(h => h.category === 'payment').length },
    { id: 'lab', label: 'Lab Reports', count: history.filter(h => h.category === 'lab').length },
    { id: 'prescription', label: 'Prescriptions', count: history.filter(h => h.category === 'prescription').length },
    { id: 'communication', label: 'Communication', count: history.filter(h => h.category === 'communication').length }
  ];

  if (loading) {
    return (
      <div className="dashboard-home doctor-history">
        <div className="history-container">
          <div className="loading-container">Loading doctor activity history...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-home doctor-history">
      <div className="history-container">
        <div className="section-header">
          <h2>{selectedPatient ? `${selectedPatient.name}'s History` : 'Doctor Activity History'}</h2>
          <div className="tab-buttons">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label} <span className="tab-count">({tab.count})</span>
              </button>
            ))}
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="no-history">
            <div className="empty-state-icon">📜</div>
            <h3>No Activity History</h3>
            <p>No activities found for the selected filter. {activeTab !== 'all' && 'Try "All" tab to see everything.'}</p>
          </div>
        ) : (
          <div className="history-timeline">
            {Object.entries(groupedHistory).map(([date, items]) => (
              <div key={date} className="history-date-group">
                <div className="history-date-header">
                  <Calendar size={20} />
                  <span>{date}</span>
                  <div className="date-item-count">{items.length} activities</div>
                </div>
                {items.map((item) => (
                  <div key={item._id} className="history-item">
                    <div className="history-marker">
                      <div className={`marker-icon ${getCategoryColor(item.category).replace('text-', 'bg-').replace('100', '500')}`}>
                        {getCategoryIcon(item.category)}
                      </div>
                    </div>
                    <div className="history-content">
                      <div className="history-header">
                        <h4>{item.action}</h4>
                        <span className="history-time">
                          <Clock size={14} /> {formatTime(item.timestamp)}
                          <span className="relative-time">{formatRelativeTime(item.timestamp)}</span>
                        </span>
                      </div>
                      <p className="history-description">{item.description}</p>
                      <div className={`category-badge ${getCategoryColor(item.category)}`}>
                        {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                      </div>
                      {item.relatedId && (
                        <button className="view-details-btn" onClick={() => setSelectedActivity(item)}>
                          View Details
                        </button>
                      )}
                      {expandedItems[item._id] && (
                        <div className="expanded-details">
                          <p><strong>Related ID:</strong> {item.relatedId}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedActivity && (
        <div className="modal-overlay" onClick={() => setSelectedActivity(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedActivity.action}</h3>
              <button className="close-btn" onClick={() => setSelectedActivity(null)}>×</button>
            </div>
            <div className="modal-body">
              <p className="modal-description">{selectedActivity.description}</p>
              <div className="modal-meta">
                <span><strong>Date:</strong> {formatDate(selectedActivity.timestamp)}</span>
                <span><strong>Time:</strong> {formatTime(selectedActivity.timestamp)}</span>
                <span><strong>Category:</strong> {selectedActivity.category}</span>
                {selectedActivity.relatedId && (
                  <span><strong>Related ID:</strong> {selectedActivity.relatedId}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .tab-buttons {
          display: flex;
          gap: 8px;
          margin-top: 16px;
          flex-wrap: wrap;
        }
        .tab-btn {
          padding: 8px 16px;
          border: 1px solid #e5e7eb;
          background: white;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .tab-btn.active {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }
        .tab-count {
          font-size: 12px;
          font-weight: 500;
          margin-left: 4px;
        }
        .history-date-group {
          margin-bottom: 32px;
        }
        .history-date-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          padding: 12px 0;
          border-bottom: 2px solid #f3f4f6;
          font-weight: 600;
          color: #374151;
        }
        .date-item-count {
          margin-left: auto;
          font-size: 14px;
          color: #6b7280;
        }
        .history-marker {
          position: relative;
        }
        .marker-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .history-content {
          flex: 1;
          padding-left: 16px;
        }
        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 4px;
        }
        .history-time {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 14px;
          color: #6b7280;
        }
        .relative-time {
          margin-left: 8px;
          font-size: 12px;
        }
        .history-description {
          color: #374151;
          margin-bottom: 8px;
          line-height: 1.5;
        }
        .category-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          display: inline-block;
        }
        .view-details-btn {
          background: #f3f4f6;
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 13px;
          cursor: pointer;
          margin-top: 8px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .view-details-btn:hover {
          background: #e5e7eb;
        }
        .expanded-details {
          margin-top: 12px;
          padding: 12px;
          background: #f8fafc;
          border-radius: 8px;
          border-left: 4px solid #3b82f6;
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          background: white;
          border-radius: 12px;
          max-width: 500px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
        }
        .modal-header {
          padding: 24px 24px 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #6b7280;
        }
        .modal-body {
          padding: 0 24px 24px;
        }
        .modal-description {
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 16px;
          color: #1f2937;
        }
        .modal-meta {
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 14px;
        }
        .modal-meta span {
          display: flex;
          align-items: center;
          gap: 6px;
        }
      `}</style>
    </div>
  );
};

export default History;

