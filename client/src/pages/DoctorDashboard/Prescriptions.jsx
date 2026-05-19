import { useState, useEffect } from 'react';
import { FileText, Search, Calendar, Printer, Download, Edit3, Send, Trash2, Plus } from 'lucide-react';
import jsPDF from 'jspdf';
import PrescriptionPad from '../../components/PrescriptionPad';

const Prescriptions = ({ doctorData }) => {
  // Toast notification system FIRST
  const showToast = (message, type = 'info') => {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 9999;
      padding: 16px 24px; border-radius: 8px; color: white; font-weight: 500;
      min-width: 300px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transform: translateX(400px); transition: all 0.3s ease;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#f59e0b'};
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.style.transform = 'translateX(0)', 100);
    setTimeout(() => {
      toast.style.transform = 'translateX(400px)';
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 4000);
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('doctorToken');
    console.log('🔑 Auth token:', token ? 'Present' : 'MISSING');
    if (!token) {
      showToast('⚠️ Token missing - please login again', 'warning');
    }
    return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
  };

const [prescriptions, setPrescriptions] = useState([]);
const [loading, setLoading] = useState(true);
const [searchQuery, setSearchQuery] = useState('');
const [selectedPrescription, setSelectedPrescription] = useState(null);

// Loading states for buttons
const [isSending, setIsSending] = useState(false);
const [isDeleting, setIsDeleting] = useState(false);
const [isEditingPrescriptionId, setIsEditingPrescriptionId] = useState('');

useEffect(() => {
  if (doctorData && doctorData._id) {
    fetchPrescriptions();
  }
}, [doctorData]);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/prescriptions/doctor/${doctorData._id}`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setPrescriptions(data.data);
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const [editingPrescription, setEditingPrescription] = useState(null);
  const [showPad, setShowPad] = useState(false);
  const [selectedApt, setSelectedApt] = useState(null);
  const [appts, setAppts] = useState([]);

  useEffect(() => {
    if (doctorData && doctorData._id) {
      fetchPrescriptions();
      fetchAppts();
    }
  }, [doctorData]);

  const fetchAppts = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/appointments/doctor/${doctorData._id}`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setAppts(data.data);
      }
    } catch (error) {
      console.error('Error fetching appts:', error);
    }
  };

  const pendingAppts = appts.filter(apt => apt.status === 'booked' && apt.paymentStatus === 'paid' && !prescriptions.find(p => p.appointmentId === apt._id));

  const filteredPrescriptions = prescriptions.filter(rx => 
    rx.patientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleWritePending = (apt) => {
    setSelectedApt(apt);
    setEditingPrescription(null);
    setShowPad(true);
  };

  const handleSavePrescription = async (presData) => {
    console.log('Received presData:', presData);
    try {
      const data = {
        patientId: selectedApt.patientId,
        doctorId: doctorData._id,
        appointmentId: selectedApt._id || '',
        patientName: selectedApt.patientName,
        doctorName: doctorData.name,
        date: presData.date || new Date().toLocaleDateString(),
        diagnosis: presData.diagnosis || '',
        medicines: presData.medicines.map(m => ({
          name: m.name,
          dosage: m.dose,
          frequency: m.frequency,
          duration: m.duration,
          instructions: ''
        })),
        advice: Array.isArray(presData.advice) ? presData.advice.join(', ') : presData.advice,
        followUpDate: presData.followUpDate || ''
      };
      console.log('Sending to backend:', data);
      const res = await fetch('http://localhost:5000/api/prescriptions', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      const result = await res.json();
      
      if (res.ok && result.success) {
        showToast('✅ Prescription saved successfully!');
        fetchPrescriptions();
        setShowPad(false);
        setSelectedApt(null);
      } else {
        showToast(`❌ Save failed (${res.status}): ${result.message || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      console.error('Save error:', error);
      showToast(`❌ Save error: ${error.message}`, 'error');
    }
  };

  const handleEditSave = async (presData) => {
    console.log('Edit save clicked:', editingPrescription._id);
    try {
      console.log('Token for edit:', localStorage.getItem('doctorToken') ? 'Present' : 'MISSING');
      const response = await fetch(`http://localhost:5000/api/prescriptions/${editingPrescription._id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(presData),
      });
      console.log('Edit response status:', response.status);
      const result = await response.json();
      console.log('Edit response:', result);
      if (response.ok && result.success) {
        fetchPrescriptions();
        setEditingPrescription(null);
        setShowPad(false);
        alert('✅ Prescription updated!');
      } else {
        alert(`❌ Update failed (${response.status}): ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Edit error:', error);
      alert('❌ Network error updating: ' + error.message);
    }
  };


const viewPrescription = async (prescription) => {
    console.log('View clicked:', prescription._id);
    
    // Fetch full prescription details if needed
    try {
      const token = localStorage.getItem('doctorToken');
      if (!token) {
        showToast('⚠️ No auth token - please login again', 'error');
        return;
      }
      
      const response = await fetch(`http://localhost:5000/api/prescriptions/${prescription._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setSelectedPrescription(data.data);
        showToast('✅ Prescription loaded', 'success');
      } else {
        showToast(`View failed: ${data.message}`, 'error');
      }
    } catch (error) {
      console.error('View error:', error);
      showToast(`View error: ${error.message}`, 'error');
    }
  };

const handleSendPrescription = async (prescriptionId) => {
    console.log('🚀 SEND BUTTON CLICKED:', prescriptionId);
    
    const prescription = prescriptions.find(p => p._id === prescriptionId);
    if (!prescription) {
      showToast('❌ Prescription not found', 'error');
      return;
    }
    
    setIsSending(prescriptionId);
    try {
      let patientPhone = prescription.patientId?.phone || prescription.appointmentId?.patientPhone;
      
      console.log('📱 Initial phone check:', patientPhone);
      
      // Fallback: fetch appointment details
      if (!patientPhone && prescription.appointmentId) {
        console.log('🔍 Fetching appointment for phone:', prescription.appointmentId);
        const res = await fetch(`http://localhost:5000/api/appointments/${prescription.appointmentId}`, {
          headers: getAuthHeaders()
        });
        console.log('📅 Appointment fetch status:', res.status);
        const aptData = await res.json();
        patientPhone = aptData.data?.patientPhone || aptData.data?.patientId?.phone;
        console.log('📱 Found phone:', patientPhone);
      }
      
      if (!patientPhone) {
        console.error('❌ NO PHONE FOUND for prescription:', prescription._id);
        showToast('❌ Patient phone not available for sending', 'error');
        return;
      }
      
      console.log('📤 Sending prescription to:', patientPhone);
      
      const response = await fetch(`http://localhost:5000/api/prescriptions/${prescriptionId}/send`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ patientPhone })
      });
      
      console.log('📨 Send API status:', response.status);
      const data = await response.json();
      console.log('📨 Send response FULL:', data);
      
      if (data.success) {
        showToast('✅ Prescription sent to patient via SMS!', 'success');
        fetchPrescriptions();
      } else {
        console.error('❌ API ERROR:', data);
        showToast(`❌ Send failed: ${data.message || 'Server error'} (${response.status})`, 'error');
      }
    } catch (error) {
      console.error('💥 SEND ERROR:', error);
      showToast(`❌ Send error: ${error.message}`, 'error');
    } finally {
      setIsSending(false);
    }
  };

const handleDeletePrescription = async (prescriptionId) => {
    if (!window.confirm('Delete this prescription? This cannot be undone.')) return;
    
    setIsDeleting(prescriptionId);
    try {
      const response = await fetch(`http://localhost:5000/api/prescriptions/${prescriptionId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      const data = await response.json();
      console.log('Delete response:', response.status, data);
      
      if (data.success) {
        showToast('✅ Prescription deleted successfully', 'success');
        fetchPrescriptions();
      } else {
        showToast(`❌ Delete failed: ${data.message || 'Server error'} (${response.status})`, 'error');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showToast(`❌ Delete error: ${error.message}`, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditPrescription = async (prescription) => {
    setIsEditingPrescriptionId(prescription._id);
    try {
      if (!localStorage.getItem('doctorToken')) {
        showToast('❌ Please login again - no auth token', 'error');
        return;
      }
      setEditingPrescription(prescription);
      setShowPad(true);
    } finally {
      setIsEditingPrescriptionId('');
    }
  };

  const handleNewPrescription = () => {
    console.log('New prescription clicked - setShowNewPrescription(true)');
    setShowNewPrescription(true);
  };

  const [showNewPrescription, setShowNewPrescription] = useState(false);

  const downloadPDFPrescription = () => {
    if (!selectedPrescription) {
      showToast('No prescription selected for download', 'error');
      return;
    }

    console.log('Download PDF clicked for:', selectedPrescription._id);
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let currentY = margin + 20;

    // Title
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('PRESCRIPTION', pageWidth / 2, currentY, { align: 'center' });
    currentY += 15;

    // Date and Doctor
    doc.setFontSize(12);
    doc.text(`Date: ${selectedPrescription.date || new Date().toLocaleDateString()}`, pageWidth / 2, currentY, { align: 'center' });
    currentY += 8;
    doc.text(`Dr. ${doctorData?.name || 'Doctor Name'}`, pageWidth / 2, currentY, { align: 'center' });
    currentY += 15;

    // Separator line
    doc.setLineWidth(2);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 20;

    // Patient Info
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Patient Information', margin, currentY);
    currentY += 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text(`Name: ${selectedPrescription.patientName}`, margin, currentY);
    currentY += 7;
    doc.text(`Patient ID: ${selectedPrescription.patientId?._id || 'N/A'}`, margin, currentY);
    currentY += 15;

    // Diagnosis
    if (selectedPrescription.diagnosis) {
      doc.setFont('helvetica', 'bold');
      doc.text('Diagnosis:', margin, currentY);
      currentY += 8;
      doc.setFont('helvetica', 'normal');
      const diagnosisLines = doc.splitTextToSize(selectedPrescription.diagnosis, pageWidth - margin * 2);
      doc.text(diagnosisLines, margin, currentY);
      currentY += diagnosisLines.length * 6 + 10;
    }

    // Medications Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Medications:', margin, currentY);
    currentY += 12;

    // Table Header
    const colWidths = [80, 35, 40, 35];
    const headerY = currentY;
    doc.setFillColor(200, 220, 255);
    doc.rect(margin, headerY, pageWidth - margin*2, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Medicine', margin + 5, headerY + 6);
    doc.text('Dosage', margin + 85, headerY + 6);
    doc.text('Frequency', margin + 125, headerY + 6);
    doc.text('Duration', margin + 170, headerY + 6);
    currentY += 12;

    // Medications rows
    selectedPrescription.medicines?.forEach((med, index) => {
      if (currentY > pageHeight - 60) {
        doc.addPage();
        currentY = margin + 20;
      }

      const rowY = currentY;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      // Truncate long text
      const nameText = doc.splitTextToSize(med.name || med || 'N/A', colWidths[0] - 10);
      doc.text(nameText, margin + 5, rowY, { maxWidth: colWidths[0] - 10 });
      
      doc.text(med.dosage || '', margin + 85, rowY);
      doc.text(med.frequency || '', margin + 125, rowY);
      doc.text(med.duration || '', margin + 170, rowY);
      
      // Row line
      doc.setLineWidth(0.3);
      doc.line(margin, rowY + 2, pageWidth - margin, rowY + 2);
      
      currentY += 8;
    });

    currentY += 10;

    // Advice
    if (selectedPrescription.advice) {
      doc.setFont('helvetica', 'bold');
      doc.text('Instructions:', margin, currentY);
      currentY += 8;
      doc.setFont('helvetica', 'normal');
      const adviceLines = doc.splitTextToSize(selectedPrescription.advice, pageWidth - margin * 2);
      doc.text(adviceLines, margin, currentY);
      currentY += (adviceLines.length * 5) + 10;
    }

    // Follow up
    if (selectedPrescription.followUpDate) {
      currentY += 5;
      doc.text(`Follow-up Date: ${selectedPrescription.followUpDate}`, margin, currentY);
      currentY += 15;
    }

    // Signature line
    const sigY = Math.max(currentY, pageHeight - 60);
    doc.setLineWidth(1);
    doc.line(pageWidth - 140, sigY, pageWidth - 20, sigY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Doctor Signature', pageWidth - 80, sigY + 5, { align: 'center' });
    doc.setFontSize(10);
    doc.text(doctorData?.name || 'Doctor Name', pageWidth - 80, sigY + 15, { align: 'center' });
    doc.text(doctorData?.qualification || '', pageWidth - 80, sigY + 22, { align: 'center' });

    // Download
    const fileName = `Prescription_${selectedPrescription.patientName.replace(/\\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')}_${Date.now()}.pdf`;
    doc.save(fileName);
    showToast('✅ Prescription PDF downloaded successfully!', 'success');
  };

  if (loading) {
    return <div className="loading-container" style={{minHeight: '400px'}}>Loading prescriptions...</div>;
  }

  return (
    <div className="prescriptions-page">
      <div className="page-header-modern">
        <div>
          <h1>💊 Prescriptions</h1>
          <p>Manage issued prescriptions for your patients</p>
        </div>
        <button className="btn-primary" style={{marginLeft: 'auto'}} onClick={handleNewPrescription}>
          <Plus size={20} /> New Prescription
        </button>
        <div className="search-box-modern">
          <Search size={20} />
          <input 
            placeholder="Search prescriptions by patient name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <h3 style={{margin: '2rem 0 1rem 0', color: '#374151'}}>Pending Prescriptions</h3>
      <div className="prescriptions-grid">
        {pendingAppts.map(apt => (
          <div key={apt._id} className="prescription-card pending-card">
            <div className="prescription-header">
              <div>
                <div className="patient-avatar">{apt.patientName.charAt(0)}</div>
                <div>
                  <h3>{apt.patientName}</h3>
                  <span>{apt.appointmentDate} {apt.appointmentTime}</span>
                </div>
              </div>
              <span className="status-badge pending">Pending</span>
            </div>
            <div className="prescription-actions-single">
              <button className="btn-primary" onClick={() => handleWritePending(apt)}>
                <Edit3 size={20} /> Write Prescription
              </button>
            </div>
          </div>
        ))}
      </div>

      <h3 style={{margin: '2rem 0 1rem 0', color: '#374151'}}>Saved Prescriptions</h3>
      <div className="prescriptions-grid">
        {filteredPrescriptions.map(prescription => (
          <div key={prescription._id} className="prescription-card">
            <div className="prescription-header">
              <div>
                <div className="patient-avatar">{prescription.patientId?.profilePhoto ? (
                  <img src={`http://localhost:5000/${prescription.patientId.profilePhoto}`} alt="Photo" />
                ) : prescription.patientName.charAt(0)}</div>
                <div>
                  <h3>{prescription.patientName}</h3>
                  <span className="prescription-date">{new Date(prescription.date).toLocaleDateString()}</span>
                </div>
              </div>
              <span className={`status-badge ${prescription.status}`}>
                {prescription.status.toUpperCase()}
              </span>
            </div>
            <div className="prescription-medicines">
              {prescription.medicines?.slice(0, 2).map((med, idx) => (
                <div key={idx} className="medicine-item">
                  <FileText size={16} />
                  <span>{med.name || med}</span>
                </div>
              )) || []}
              {prescription.medicines?.length > 2 && (
                <div className="more-medicines">+{prescription.medicines.length - 2} more</div>
              )}
            </div>
            <div className="prescription-footer">
              <p className="instructions">{prescription.advice?.[0] || 'No instructions'}</p>
              <div className="prescription-actions">
                <button 
                  className="btn-secondary" 
                  onClick={() => viewPrescription(prescription)}
                >
                  👁️ View
                </button>
                <button 
                  className="btn-primary" 
                  onClick={() => handleEditPrescription(prescription)}
                  disabled={isEditingPrescriptionId === prescription._id}
                >
                  <Edit3 size={16} /> {isEditingPrescriptionId === prescription._id ? 'Loading...' : 'Edit'}
                </button>
                <button 
                  className="btn-success" 
                  onClick={() => handleSendPrescription(prescription._id)}
                  disabled={isSending === prescription._id}
                >
                  {isSending === prescription._id ? (
                    <>
                      <span style={{animation: 'spin 1s linear infinite'}}>⏳</span> Sending...
                    </>
                  ) : (
                    <>
                      <Send size={16} /> Send
                    </>
                  )}
                </button>
                <button 
                  className="btn-download" 
                  onClick={downloadPDFPrescription}
                >
                  <Download size={16} /> Download PDF
                </button>
                <button 
                  className="btn-danger" 
                  onClick={() => handleDeletePrescription(prescription._id)}
                  disabled={isDeleting === prescription._id}
                >
                  {isDeleting === prescription._id ? (
                    <>
                      <span style={{animation: 'spin 1s linear infinite'}}>🗑️</span> Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} /> Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

{(showPad || showNewPrescription) && (
        <div className="modal-overlay" onClick={() => {setShowPad(false); setShowNewPrescription(false);}}>
          <div className="modal-content-fullscreen" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingPrescription ? 'Edit Prescription' : 'New Prescription'}</h2>
              <button className="close-btn" onClick={() => {setShowPad(false); setShowNewPrescription(false);}}>×</button>
            </div>
            <PrescriptionPad
              doctorData={doctorData}
              patientData={editingPrescription || selectedApt}
              prescription={editingPrescription}
              onSave={editingPrescription ? handleEditSave : handleSavePrescription}
              onCancel={() => {setShowPad(false); setShowNewPrescription(false);}}
              saving={false}
            />
          </div>
        </div>
      )}

      {selectedPrescription && (
        <div className="modal-overlay" onClick={() => setSelectedPrescription(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Prescription Details</h2>
              <button className="close-btn" onClick={() => setSelectedPrescription(null)}>×</button>
            </div>
            <div className="prescription-full">
              <div className="patient-info">
                <h3>{selectedPrescription.patientName}</h3>
                <p>Date: {new Date(selectedPrescription.date).toLocaleDateString()}</p>
              </div>
              <div className="medicines-list">
                <h4>Medications:</h4>
                <ul>
                  {selectedPrescription.medicines.map((med, idx) => (
                    <li key={idx}>{med}</li>
                  ))}
                </ul>
              </div>
              <div className="instructions-section">
                <h4>Instructions:</h4>
                <p>{selectedPrescription.instructions}</p>
              </div>
              <div className="modal-actions">
                <button className="btn-primary"><Download size={16} /> Download PDF</button>
                <button className="btn-secondary"><Printer size={16} /> Print</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {pendingAppts.length === 0 && prescriptions.length === 0 && (
        <div className="no-prescriptions">
          <FileText size={64} />
          <h3>No appointments or prescriptions</h3>
          <p>Accept appointments or create new prescription</p>
        </div>
      )}
    </div>
  );
};

export default Prescriptions;



