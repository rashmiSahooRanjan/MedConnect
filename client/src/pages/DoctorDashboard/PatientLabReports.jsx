import { useState, useEffect } from 'react';
import { ClipboardList, Search, Eye, Download, File } from 'lucide-react';

const PatientLabReports = ({ doctorData }) => {
  const [labReports, setLabReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    if (doctorData && doctorData._id) {
      fetchLabReports();
    }
  }, [doctorData]);

  const fetchLabReports = async () => {
    try {
      setLoading(true);
      // Would fetch patient's lab reports linked to doctor appointments
      // Demo data with sample reports
      const demoReports = [
        {
          _id: 'lr1',
          patientName: 'John Doe',
          uploadDate: '2024-01-25',
          reportType: 'Blood Test',
          fileName: 'john_doe_blood_test.pdf',
          fileUrl: '/demo/labreport1.pdf',
          status: 'normal'
        },
        {
          _id: 'lr2',
          patientName: 'Jane Smith',
          uploadDate: '2024-01-22',
          reportType: 'CBC & ESR',
          fileName: 'jane_smith_cbc.pdf',
          fileUrl: '/demo/labreport2.jpg',
          status: 'high'
        },
        {
          _id: 'lr3',
          patientName: 'Bob Johnson',
          uploadDate: '2024-01-20',
          reportType: 'Lipid Profile',
          fileName: 'bob_lipid_profile.pdf',
          fileUrl: '/demo/labreport3.pdf',
          status: 'normal'
        }
      ];
      setLabReports(demoReports);
    } catch (error) {
      console.error('Error fetching lab reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = labReports.filter(report => 
    report.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.reportType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const viewReport = (report) => {
    setSelectedReport(report);
    // In real app, open PDF viewer or iframe
    window.open(report.fileUrl, '_blank');
  };

  const downloadReport = (report) => {
    const link = document.createElement('a');
    link.href = report.fileUrl;
    link.download = report.fileName;
    link.click();
  };

  if (loading) {
    return <div className="loading-container" style={{minHeight: '400px'}}>Loading lab reports...</div>;
  }

  return (
    <div className="lab-reports-page">
      <div className="page-header-modern">
        <div>
          <h1>🧪 Patient Lab Reports</h1>
          <p>Review uploaded lab reports from your patients</p>
        </div>
        <div className="search-box-modern">
          <Search size={20} />
          <input 
            placeholder="Search by patient or report type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="lab-reports-grid">
        {filteredReports.map(report => (
          <div key={report._id} className="lab-report-card">
            <div className="report-header">
              <div className="report-icon">
                <File size={32} />
              </div>
              <div className="report-info">
                <h3>{report.patientName}</h3>
                <p>{report.reportType} • {new Date(report.uploadDate).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="report-status">
              <span className={`status-badge ${report.status}`}>
                {report.status.toUpperCase()}
              </span>
            </div>
            <div className="report-actions">
              <button 
                className="btn-secondary" 
                onClick={() => viewReport(report)}
                title="View Report"
              >
                <Eye size={18} />
              </button>
              <button 
                className="btn-primary" 
                onClick={() => downloadReport(report)}
                title="Download"
              >
                <Download size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <div className="no-reports">
          <ClipboardList size={64} />
          <h3>No lab reports found</h3>
          <p>Patients will upload reports here for your review</p>
        </div>
      )}
    </div>
  );
};

export default PatientLabReports;

