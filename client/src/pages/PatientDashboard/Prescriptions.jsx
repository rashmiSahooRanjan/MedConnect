import { useState, useEffect } from 'react';
import './patient dashboard css/prescriptions.css';
const Prescriptions = ({ patientData }) => {
  const [prescriptions, setPrescriptions] = useState([]);  
  const [stats, setStats] = useState([
    { label: 'Total Prescriptions', value: '0', icon: '💊', color: '#8B5CF6' },
    { label: 'Recent', value: '0', icon: '📅', color: '#0D9488' },
    { label: 'Downloadable', value: '0', icon: '⬇️', color: '#F59E0B' }
  ]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (patientData && patientData._id) {
      fetchPrescriptions();
    }
  }, [patientData]);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('patientToken');
      const response = await fetch(`http://localhost:5000/api/prescriptions/patient/${patientData._id}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await response.json();

      if (response.ok && data.success) {
        const prescData = data.data || [];
        setPrescriptions(prescData);
        
        // Update stats
        const total = prescData.length;
        const today = new Date().toDateString();
        const recent = prescData.filter(p => {
          const pDate = new Date(p.date);
          return pDate.toDateString() === today;
        }).length;
        const downloadable = prescData.filter(p => p._id).length;
        
        setStats([
          { label: 'Total Prescriptions', value: total.toString(), icon: '💊', color: '#8B5CF6' },
          { label: 'Today', value: recent.toString(), icon: '📅', color: '#0D9488' },
          { label: 'Downloadable', value: downloadable.toString(), icon: '⬇️', color: '#F59E0B' }
        ]);
      } else {
        console.error('Fetch error:', data.message);
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? dateStr : date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const handleRemovePrescription = async (prescription) => {
if (!confirm("Are you sure you want to delete the prescription from Dr. " + prescription.doctorName + "? This action cannot be undone.")) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/prescriptions/${prescription._id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        alert('Prescription deleted successfully!');
        fetchPrescriptions();
      } else {
        alert(data.message || 'Failed to delete prescription');
      }
    } catch (error) {
      console.error('Error deleting prescription:', error);
      alert('Failed to delete prescription. Please try again.');
    }
  };

  const handleDownloadPrescription = async (prescription) => {
    try {
      const response = await fetch(`http://localhost:5000/api/prescriptions/${prescription._id}`);
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch prescription');
      }

      const prescriptionData = data.data;
      
      // Load html2pdf script dynamically
      await new Promise((resolve, reject) => {
        if (window.html2pdf) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });

      // Create preview HTML
      const previewHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px;">
            <h1 style="color: #2c5aa0; margin: 0; font-size: 28px;">PRESCRIPTION</h1>
            <p style="color: #666; margin: 5px 0 0 0;">Date: ${formatDate(prescriptionData.date)}</p>
          </div>
          
          <div style="display: flex; margin-bottom: 30px;">
            <div style="flex: 1;">
              <h3 style="color: #2c5aa0; margin-bottom: 10px;">Doctor:</h3>
              <p style="font-size: 18px; font-weight: bold; margin: 0;">Dr. ${prescriptionData.doctorName}</p>
              <p style="margin: 5px 0; color: #666;">${prescriptionData.doctorSpecialty || 'General Physician'}</p>
            </div>
            <div style="flex: 1;">
              <h3 style="color: #2c5aa0; margin-bottom: 10px;">Patient:</h3>
              <p style="font-size: 18px; font-weight: bold; margin: 0;">${prescriptionData.patientName}</p>
            </div>
          </div>

          ${prescriptionData.diagnosis ? `
            <div style="margin-bottom: 25px;">
              <h3 style="color: #2c5aa0; border-bottom: 1px solid #ddd; padding-bottom: 8px;">Diagnosis:</h3>
              <p style="line-height: 1.6; margin: 10px 0;">${prescriptionData.diagnosis}</p>
            </div>
          ` : ''}

          ${prescriptionData.medicines && prescriptionData.medicines.length > 0 ? `
            <div style="margin-bottom: 25px;">
              <h3 style="color: #2c5aa0; border-bottom: 1px solid #ddd; padding-bottom: 8px;">Medicines:</h3>
              <div style="margin-top: 15px;">
                ${prescriptionData.medicines.map((medicine, index) => `
                  <div style="display: flex; margin-bottom: 12px; padding: 12px; background: #f8f9fa; border-left: 4px solid #28a745; border-radius: 4px;">
                    <div style="font-size: 20px; margin-right: 15px; align-self: center;">${index + 1}.</div>
                    <div style="flex: 1;">
                      <div style="font-weight: bold; font-size: 16px; margin-bottom: 4px;">${medicine.name}</div>
                      ${medicine.dosage ? `<p style="margin: 2px 0; color: #333;"><strong>Dosage:</strong> ${medicine.dosage}</p>` : ''}
                      ${medicine.frequency ? `<p style="margin: 2px 0; color: #333;"><strong>Frequency:</strong> ${medicine.frequency}</p>` : ''}
                      ${medicine.duration ? `<p style="margin: 2px 0; color: #333;"><strong>Duration:</strong> ${medicine.duration}</p>` : ''}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : `
            <div style="margin-bottom: 25px; color: #999; font-style: italic;">
              <h3 style="color: #2c5aa0; border-bottom: 1px solid #ddd; padding-bottom: 8px;">Medicines:</h3>
              <p>No medicines prescribed</p>
            </div>
          `}

          ${prescriptionData.tests && prescriptionData.tests.length > 0 ? `
            <div style="margin-bottom: 25px;">
              <h3 style="color: #2c5aa0; border-bottom: 1px solid #ddd; padding-bottom: 8px;">Tests:</h3>
              <ul style="margin-top: 15px; padding-left: 20px;">
                ${prescriptionData.tests.map((test, index) => `<li style="margin-bottom: 8px; line-height: 1.6;">${test.name}${test.instructions ? ' - ' + test.instructions : ''}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          ${prescriptionData.advice ? `
            <div style="margin-bottom: 25px;">
              <h3 style="color: #2c5aa0; border-bottom: 1px solid #ddd; padding-bottom: 8px;">Advice:</h3>
              <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; line-height: 1.6;">
                ${prescriptionData.advice.replace(/\n/g, '<br>')}
              </div>
            </div>
          ` : ''}

          ${prescriptionData.followUpDate ? `
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #333;">
              <h4 style="color: #d63384; margin-bottom: 10px;">Follow-up Date</h4>
              <p style="font-size: 18px; font-weight: bold; margin: 0;">${formatDate(prescriptionData.followUpDate)}</p>
            </div>
          ` : ''}

          <div style="margin-top: 40px; text-align: right;">
            <p style="margin: 0; font-weight: bold;">Dr. ${prescriptionData.doctorName}</p>
            <p style="margin: 2px 0 0 0; font-size: 14px; color: #666;">${prescriptionData.doctorSpecialty || 'General Physician'}</p>
          </div>
        </div>
      `;

      // Create temporary preview element
      const previewDiv = document.createElement('div');
      previewDiv.innerHTML = previewHtml;
      previewDiv.style.position = 'absolute';
      previewDiv.style.left = '-9999px';
      previewDiv.style.top = '-9999px';
      document.body.appendChild(previewDiv);

      // Generate PDF using html2pdf
      const opt = {
        margin: [15, 15, 15, 15],
        filename: `Prescription_${prescription.doctorName.replace(/\\s+/g, '_')}_${formatDate(prescription.date)}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      html2pdf().set(opt).from(previewDiv).save().then(() => {
        // Cleanup
        document.body.removeChild(previewDiv);
      }).catch((error) => {
        // Cleanup on error
        document.body.removeChild(previewDiv);
        console.error('PDF generation error:', error);
        alert('Failed to generate PDF. JSON fallback available.');
        // Fallback to JSON download
        const content = JSON.stringify(prescriptionData, null, 2);
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const fileName = `Prescription_${prescription.doctorName.replace(/\\s+/g, '_')}_${formatDate(prescription.date)}.json`;
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      });

    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download prescription. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="dashboard-home">
        <div className="prescriptions-container">
          <div className="loading-container">Loading prescriptions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-home">
      <div className="prescriptions-container">
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
          <h2>My Prescriptions</h2>
          <p>Manage and download your prescriptions</p>
        </div>

        {prescriptions.length === 0 ? (
          <div className="no-prescriptions">
            <div className="empty-state-icon">💊</div>
            <h3>No Prescriptions</h3>
            <p>You don't have any prescriptions yet.</p>
          </div>
        ) : (
          <div className="prescriptions-list">
            {prescriptions.map((prescription) => (
              <div key={prescription._id} className="prescription-card">
                <div className="prescription-header">
                  <div>
                    <h4>Dr. {prescription.doctorName}</h4>
                    <span className="prescription-date">📅 {formatDate(prescription.date)}</span>
                    <span className="prescription-specialty"> | {prescription.doctorSpecialty || 'General Physician'}</span>
                  </div>
                  <div className="prescription-actions">
                    <button className="btn-download" onClick={() => handleDownloadPrescription(prescription)}>Download PDF</button>
                    <button className="btn-remove" onClick={() => handleRemovePrescription(prescription)}>Remove</button>
                  </div>
                </div>
                {prescription.medicines && prescription.medicines.length > 0 && (
                  <div className="medicines-list">
                    {prescription.medicines.map((medicine, index) => (
                      <div key={index} className="medicine-item">
                        <div className="medicine-name">💊 {medicine.name}</div>
                        <div className="medicine-details">
                          <span>{medicine.dosage || medicine.frequency}</span>
                          <span className="duration">{medicine.duration ? `for ${medicine.duration}` : ''}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {prescription.advice && (
                  <div className="prescription-advice">
                    <strong>Advice:</strong> {prescription.advice}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Prescriptions;
