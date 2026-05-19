import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './patient dashboard css/labreport.css'
const LabReports = ({ patientData }) => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [patientReady, setPatientReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFormData, setUploadFormData] = useState({
    name: '',
    labName: '',
    description: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLab, setFilterLab] = useState('');
  const [analytics, setAnalytics] = useState({ total: 0, recent: 0, normal: 0 });
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Check if patientData is ready
  useEffect(() => {
    setPatientReady(!!patientData?._id);
  }, [patientData?._id]);

  useEffect(() => {
    if (patientReady && patientData?._id) {
      fetchLabReports();
    }
  }, [patientData?._id, patientReady]);

  // Filter and search reports
  useEffect(() => {
    let filtered = reports;

    if (searchTerm) {
      filtered = filtered.filter(report => 
        report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.labName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterLab) {
      filtered = filtered.filter(report => report.labName?.toLowerCase() === filterLab.toLowerCase());
    }

    setFilteredReports(filtered);

    // Update analytics
    setAnalytics({
      total: reports.length,
      recent: reports.filter(r => new Date(r.uploadDate) > new Date(Date.now() - 7*24*60*60*1000)).length,
      normal: reports.filter(r => !r.name.toLowerCase().includes('abnormal')).length
    });
  }, [reports, searchTerm, filterLab]);

  const fetchLabReports = async () => {
    if (!patientData?._id) return;
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/patients/lab-reports/${patientData._id}`);
      const data = await response.json();
      if (response.ok && data.success) {
        setReports(data.labReports || []);
      }
    } catch (error) {
      console.error('Error fetching lab reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = useCallback(() => {
    setShowUploadModal(true);
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      e.target.value = '';
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    const file = fileInputRef.current?.files[0];
    if (!file || !uploadFormData.name) {
      alert('Please fill all required fields');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('labReport', file);
      formData.append('name', uploadFormData.name);
      formData.append('labName', uploadFormData.labName);
      formData.append('description', uploadFormData.description);

      const response = await fetch(`http://localhost:5000/api/patients/lab-reports/${patientData._id}`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setShowUploadModal(false);
        setUploadFormData({ name: '', labName: '', description: '' });
        fileInputRef.current.value = '';
        fetchLabReports();
      } else {
        alert(data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleViewReport = (report) => {
    navigate(`/patient/lab-report/${report._id}`);
  };

  const handleDownloadPDF = async (report) => {
    try {
      const fileUrl = `http://localhost:5000${report.filePath}`;
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = `${report.name}.${report.fileType?.split('/')[1] || 'pdf'}`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download error:', error);
      alert('Download failed');
    }
  };

  const handleRemoveReport = async (report) => {
    if (!confirm(`Remove "${report.name}"?`)) return;
    try {
      const response = await fetch(`http://localhost:5000/api/patients/lab-reports/${patientData._id}/${report._id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        fetchLabReports();
      } else {
        alert('Remove failed');
      }
    } catch (error) {
      console.error('Remove error:', error);
      alert('Remove failed');
    }
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });

  const labs = [...new Set(reports.map(r => r.labName).filter(Boolean))];

  if (!patientReady) {
    return (
      <div className="lab-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading patient data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lab-container">
      {/* HERO ANALYTICS HEADER */}
      <div className="section-header">
        <h2>🧪 Lab Reports</h2>
        <div className="analytics-badges">
          <div className="badge">{analytics.total} Total</div>
          <div className="badge recent">{analytics.recent} Recent</div>
          <div className="badge">{analytics.normal}/{analytics.total} Normal</div>
        </div>
        <button className="btn-upload" onClick={handleUploadClick}>
          + Upload Report
        </button>
      </div>

      {/* FILTERS */}
      <div className="filters-bar">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <select 
          value={filterLab} 
          onChange={(e) => setFilterLab(e.target.value)}
          className="filter-select"
        >
          <option value="">All Labs</option>
          {labs.map(lab => (
            <option key={lab} value={lab}>{lab}</option>
          ))}
        </select>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="skeleton-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-thumbnail"></div>
              <div style={{padding: '1.5rem'}}>
                <div style={{height: '1.2rem', width: '80%', background: '#e2e8f0', borderRadius: '4px', marginBottom: '0.75rem'}}></div>
                <div style={{height: '1rem', width: '60%', background: '#e2e8f0', borderRadius: '4px'}}></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="no-reports">
          <div className="empty-state-icon">🧪</div>
          <h3>No Lab Reports Found</h3>
          <p>{searchTerm || filterLab ? 'Try adjusting your search or filter.' : 'Upload your first lab report to get started.'}</p>
          <button className="btn-upload" onClick={handleUploadClick} style={{marginTop: '2rem'}}>
            Upload First Report
          </button>
        </div>
      ) : (
        <div className="reports-grid">
          {filteredReports.map((report) => (
            <div key={report._id} className="report-card">
              <div className="report-thumbnail">
                <img 
                  src={`http://localhost:5000${report.filePath}`} 
                  alt={report.name}
                  onLoad={() => {/* handled in CSS */}}
                  loading="lazy"
                />
                <div className="thumbnail-placeholder">
                  {report.fileType?.includes('pdf') ? '📄' : '🖼️'}
                </div>
              </div>
              <div className="report-info">
                <h4>{report.name}</h4>
                <p>{report.labName || 'Independent Lab'}</p>
                <span className="report-date">📅 {formatDate(report.uploadDate)}</span>
              </div>
              <div className="report-actions">
                <span className="status-ready">✓ Ready</span>
                <button className="btn-modern" onClick={() => handleViewReport(report)}>
                  👁️ View
                </button>
                <button className="btn-download" onClick={() => handleDownloadPDF(report)}>
                  ⬇️ Download
                </button>
                <button className="btn-remove" onClick={() => handleRemoveReport(report)}>
                  🗑️ Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* UPLOAD MODAL */}
      {showUploadModal && (
        <div className="upload-modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Upload Lab Report</h3>
              <button className="modal-close" onClick={() => setShowUploadModal(false)}>×</button>
            </div>
            <form onSubmit={handleUploadSubmit}>
              <div className="form-group">
                <label>Report Name *</label>
                <input
                  type="text"
                  value={uploadFormData.name}
                  onChange={(e) => setUploadFormData({...uploadFormData, name: e.target.value})}
                  placeholder="e.g., Complete Blood Count (CBC)"
                  required
                />
              </div>
              <div className="form-group">
                <label>Lab Name</label>
                <input
                  type="text"
                  value={uploadFormData.labName}
                  onChange={(e) => setUploadFormData({...uploadFormData, labName: e.target.value})}
                  placeholder="e.g., SRL Diagnostics"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={uploadFormData.description}
                  onChange={(e) => setUploadFormData({...uploadFormData, description: e.target.value})}
                  placeholder="Additional notes..."
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>File * (PDF/Image, 10MB)</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowUploadModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={uploading}>
                  {uploading ? '⏳ Uploading...' : '🚀 Upload Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default LabReports;

