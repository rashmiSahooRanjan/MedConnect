
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './lab-reports-viewer.css'; // Page-specific styles

const LabReportViewer = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = '';

  // Dummy report data or fetch if API supports single report
  // For now, use public URL pattern - in production fetch `/api/patients/lab-reports/${patientId}/${reportId}`
  useEffect(() => {
    if (reportId) {
      // Simulate fetch - replace with real API if available
      // For demo, use first available lab report file from uploads
      const demoFilePath = '/uploads/labReport-1771850775241.pdf';
      setReport({
        _id: reportId,
        name: `Lab Report ${reportId.slice(-4)}`,
        labName: 'Demo Lab',
        filePath: demoFilePath,
        uploadDate: new Date().toISOString(),
        fileType: 'application/pdf'
      });
      setLoading(false);
    }
  }, [reportId]);

  const handleDownload = () => {
    if (report) {
      const fileUrl = `http://localhost:5000${report.filePath}`;
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = report.name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleFullscreen = () => {
    if (report) {
      window.open(`http://localhost:5000${report.filePath}`, '_blank');
    }
  };

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });

  if (loading) {
    return (
      <div className="viewer-page-loading">
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
          <p>Loading lab report...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="viewer-error">
        <h2>Report not found</h2>
        <button onClick={() => navigate('/patient/dashboard')} className="btn-back">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const fileUrl = `http://localhost:5000${report.filePath}`;

  return (
    <div className="report-viewer-page">
      <div className="report-viewer-container">
        {/* Header */}
        <header className="report-page-header">
        <button className="btn-back-dashboard" onClick={() => navigate('/patient/dashboard', { state: { activeTab: 'lab' } })}>
            ← Back to Dashboard
          </button>
          <div className="report-header-title">
            <h1>{report.name}</h1>
            <p>{report.labName} • {formatDate(report.uploadDate)}</p>
          </div>
        </header>

        {/* Viewer Body */}
        <main className="report-viewer-body">
          <iframe
            src={fileUrl}
            className="report-viewer-iframe"
            title="Lab Report Viewer"
          />
        </main>

        {/* Footer Actions */}
        <footer className="report-viewer-footer">
          <button className="btn-action btn-download-footer" onClick={handleDownload}>
            ⬇️ Download Report
          </button>
          <button className="btn-action btn-fullscreen" onClick={handleFullscreen}>
            🔳 Fullscreen View
          </button>
        </footer>
      </div>
    </div>
  );
};

export default LabReportViewer;

