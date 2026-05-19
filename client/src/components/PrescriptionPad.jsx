import React, { useState, useRef } from 'react';

const PrescriptionPad = ({ 
  doctorData, 
  patientData, 
  appointmentData,
  prescription, 
  onSave, 
  onCancel,
  saving = false 
}) => {
  // Form state
  const [formData, setFormData] = useState({
    // Clinic Details
    clinicName: 'Dr. Rashmi Ranjan Sahoo Clinic',
    clinicAddress: 'Near SUM Hospital, Bhubaneswar, Odisha - 751003',
    clinicPhone: '+91 99999 88888',
    clinicEmail: 'drrashmiranjansahoo@example.com',
    
    // Doctor Details
    doctorName: 'Rashmi Ranjan Sahoo',
    qualification: 'MBBS, MD (Medicine)',
    registrationNo: 'ORI 56789',
    
    // Patient Details
    patientName: patientData?.name || '',
    patientId: patientData?.uniqueId || '',
    age: '',
    gender: '',
    date: new Date().toISOString().split('T')[0],
    
    // Medical Details
    diagnosis: '',
    medicines: prescription?.medicines?.length ? prescription.medicines : [
      { name: '', dose: '', frequency: '', duration: '' }
    ],
    advice: prescription?.advice || '',
    followUpDate: ''
  });

  // File upload states
  const [clinicLogo, setClinicLogo] = useState(null);
  const [doctorSignature, setDoctorSignature] = useState(null);
  
  // Preview state
  const [showPreview, setShowPreview] = useState(false);
  const previewRef = useRef(null);

  // Default advice options
  const defaultAdvice = [
    'Take medicines after food',
    'Drink plenty of water',
    'Avoid spicy / oily food',
    'Follow up after 5–7 days'
  ];

  const [selectedAdvice, setSelectedAdvice] = useState(
    prescription?.advice ? prescription.advice.map(a => ({ text: typeof a === 'string' ? a : a.text || '', selected: true })) 
    : defaultAdvice.map(a => ({ text: a, selected: true }))
  );

  // Handle file upload for logo
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setClinicLogo(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle file upload for signature
  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDoctorSignature(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMedicineChange = (index, field, value) => {
    const updatedMedicines = [...formData.medicines];
    updatedMedicines[index] = { ...updatedMedicines[index], [field]: value };
    setFormData(prev => ({ ...prev, medicines: updatedMedicines }));
  };

  const addMedicine = () => {
    setFormData(prev => ({
      ...prev,
      medicines: [...prev.medicines, { name: '', dose: '', frequency: '', duration: '' }]
    }));
  };

  const removeMedicine = (index) => {
    if (formData.medicines.length > 1) {
      const updatedMedicines = formData.medicines.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, medicines: updatedMedicines }));
    }
  };

  const toggleAdvice = (index) => {
    const updated = [...selectedAdvice];
    updated[index].selected = !updated[index].selected;
    setSelectedAdvice(updated);
  };

  const generatePreview = () => {
    // Validate form before preview
    if (!formData.patientName.trim()) {
      alert('Please fill patient name first');
      return;
    }
    if (formData.medicines.filter(m => m.name.trim()).length === 0) {
      alert('Please add at least one medicine');
      return;
    }
    setShowPreview(true);
    setTimeout(() => {
      const previewElement = document.getElementById('prescription-preview');
      if (previewElement) {
        previewElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handlePrintPDF = async () => {
    // Import html2pdf dynamically
    if (typeof window !== 'undefined') {
      try {
        // Create a script element to load html2pdf
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        script.onload = () => {
          const element = document.getElementById('prescription-preview');
          if (element) {
            const opt = {
              margin: 10,
              filename: 'Prescription.pdf',
              image: { type: 'jpeg', quality: 0.98 },
              html2canvas: { scale: 2, useCORS: true },
              jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            html2pdf().set(opt).from(element).save();
            alert('PDF downloaded successfully!');
          }
        };
        document.head.appendChild(script);
      } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please try again.');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      clinicName: 'Dr. Rashmi Ranjan Sahoo Clinic',
      clinicAddress: 'Near SUM Hospital, Bhubaneswar, Odisha - 751003',
      clinicPhone: '+91 99999 88888',
      clinicEmail: 'drrashmiranjansahoo@example.com',
      doctorName: 'Rashmi Ranjan Sahoo',
      qualification: 'MBBS, MD (Medicine)',
      registrationNo: 'ORI 56789',
      patientName: patientData?.name || '',
      patientId: patientData?.uniqueId || '',
      age: '',
      gender: '',
      date: new Date().toISOString().split('T')[0],
      diagnosis: '',
      medicines: [{ name: '', dose: '', frequency: '', duration: '' }],
      advice: '',
      followUpDate: ''
    });
    setClinicLogo(null);
    setDoctorSignature(null);
    setShowPreview(false);
  };

  const handleSave = async () => {
    // Validate before save
    if (!formData.patientName.trim()) {
      alert('Patient name is required');
      return;
    }
    if (formData.medicines.filter(m => m.name.trim()).length === 0) {
      alert('At least one medicine is required');
      return;
    }

    const finalAdvice = selectedAdvice
      .filter(a => a.selected)
      .map(a => a.text);
    
    if (formData.advice) {
      finalAdvice.push(formData.advice);
    }

    const prescriptionData = {
      patientId: patientData?._id || patientData?._id,
      doctorId: doctorData?._id,
      diagnosis: formData.diagnosis,
      medicines: formData.medicines.filter(m => m.name.trim()),
      advice: finalAdvice,
      followUpDate: formData.followUpDate,
      date: new Date(formData.date).toISOString()
    };

    console.log('Saving prescription:', prescriptionData); // Debug

    if (onSave) {
      await onSave(prescriptionData);
    }
  };

  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB');
  };

  return (
    <div className="prescription-pad-container" style={{background: 'white', color: 'black'}}>
      {/* Header Section */}
      <div className="prescription-header-section">
        <h1 className="prescription-main-title">Online Prescription Pad</h1>
        <p className="prescription-subtitle">Fill details → Upload logo & signature → Generate → Print / Save as PDF</p>
      </div>

      {/* Form Section */}
      <div className="prescription-form-section">
        
        {/* File Upload Section */}
        <div className="prescription-section">
          <h3 className="section-heading">📁 File Upload</h3>
          <div className="file-upload-grid">
            <div className="file-upload-item">
              <label>Upload Clinic Logo (Optional)</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleLogoUpload}
                className="file-input"
              />
              {clinicLogo && (
                <div className="image-preview">
                  <img src={clinicLogo} alt="Clinic Logo" />
                </div>
              )}
            </div>
            <div className="file-upload-item">
              <label>Upload Doctor Signature (PNG transparent recommended)</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleSignatureUpload}
                className="file-input"
              />
              {doctorSignature && (
                <div className="image-preview signature-preview">
                  <img src={doctorSignature} alt="Doctor Signature" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Clinic Details */}
        <div className="prescription-section">
          <h3 className="section-heading">🏥 Clinic Details</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Clinic / Hospital Name</label>
              <input 
                type="text" 
                value={formData.clinicName}
                onChange={(e) => handleInputChange('clinicName', e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Phone / Mobile</label>
              <input 
                type="text" 
                value={formData.clinicPhone}
                onChange={(e) => handleInputChange('clinicPhone', e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-group full-width">
              <label>Clinic Address</label>
              <textarea 
                value={formData.clinicAddress}
                onChange={(e) => handleInputChange('clinicAddress', e.target.value)}
                className="form-input"
                rows="2"
              />
            </div>
            <div className="form-group">
              <label>Email (Optional)</label>
              <input 
                type="email" 
                value={formData.clinicEmail}
                onChange={(e) => handleInputChange('clinicEmail', e.target.value)}
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Doctor Details */}
        <div className="prescription-section">
          <h3 className="section-heading">👨‍⚕️ Doctor Details</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Doctor Name *</label>
              <input 
                type="text" 
                value={formData.doctorName}
                onChange={(e) => handleInputChange('doctorName', e.target.value)}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label>Qualification / Degree</label>
              <input 
                type="text" 
                value={formData.qualification}
                onChange={(e) => handleInputChange('qualification', e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Registration Number</label>
              <input 
                type="text" 
                value={formData.registrationNo}
                onChange={(e) => handleInputChange('registrationNo', e.target.value)}
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Patient Details */}
        <div className="prescription-section">
          <h3 className="section-heading">👤 Patient Details</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Patient Name *</label>
              <input 
                type="text" 
                value={formData.patientName}
                onChange={(e) => handleInputChange('patientName', e.target.value)}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label>Patient ID (Optional)</label>
              <input 
                type="text" 
                value={formData.patientId}
                onChange={(e) => handleInputChange('patientId', e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Age</label>
              <input 
                type="text" 
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select 
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                className="form-input"
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Date</label>
              <input 
                type="date" 
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Diagnosis */}
        <div className="prescription-section">
          <h3 className="section-heading">🩺 Diagnosis</h3>
          <div className="form-group">
            <textarea 
              value={formData.diagnosis}
              onChange={(e) => handleInputChange('diagnosis', e.target.value)}
              className="form-input"
              rows="2"
              placeholder="Enter diagnosis..."
            />
          </div>
        </div>

        {/* Medicines Section */}
        <div className="prescription-section">
          <h3 className="section-heading">💊 Medicines Section</h3>
          <div className="medicines-table">
            <div className="medicine-header-row">
              <div className="medicine-col medicine-col-name">Medicine Name</div>
              <div className="medicine-col medicine-col-dose">Dose</div>
              <div className="medicine-col medicine-col-freq">Frequency / Timing</div>
              <div className="medicine-col medicine-col-duration">Duration</div>
              <div className="medicine-col medicine-col-action"></div>
            </div>
            {formData.medicines.map((medicine, index) => (
              <div key={index} className="medicine-row-input">
                <input 
                  type="text"
                  placeholder="Medicine name"
                  value={medicine.name}
                  onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                  className="form-input"
                />
                <input 
                  type="text"
                  placeholder="e.g., 1-0-1"
                  value={medicine.dose}
                  onChange={(e) => handleMedicineChange(index, 'dose', e.target.value)}
                  className="form-input"
                />
                <select 
                  value={medicine.frequency}
                  onChange={(e) => handleMedicineChange(index, 'frequency', e.target.value)}
                  className="form-input"
                >
                  <option value="">Select</option>
                  <option value="After food">After food</option>
                  <option value="Before food">Before food</option>
                  <option value="Morning">Morning</option>
                  <option value="Night">Night</option>
                  <option value="Morning & Night">Morning & Night</option>
                </select>
                <input 
                  type="text"
                  placeholder="e.g., 5 days"
                  value={medicine.duration}
                  onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                  className="form-input"
                />
                <button 
                  type="button"
                  className="remove-medicine-btn"
                  onClick={() => removeMedicine(index)}
                  disabled={formData.medicines.length === 1}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button type="button" className="add-medicine-btn" onClick={addMedicine}>
            + Add Medicine
          </button>
        </div>

        {/* Advice Section */}
        <div className="prescription-section">
          <h3 className="section-heading">💡 Advice / Instructions</h3>
          <div className="advice-checkbox-grid">
            {selectedAdvice.map((advice, index) => (
              <label key={index} className="advice-checkbox-item">
                <input 
                  type="checkbox" 
                  checked={advice.selected}
                  onChange={() => toggleAdvice(index)}
                />
                <span>{advice.text}</span>
              </label>
            ))}
          </div>
          <div className="form-group" style={{ marginTop: '15px' }}>
            <textarea 
              value={formData.advice}
              onChange={(e) => handleInputChange('advice', e.target.value)}
              className="form-input"
              rows="3"
              placeholder="Additional advice / instructions..."
            />
          </div>
          <div className="form-group">
            <label>Follow-up Date</label>
            <input 
              type="date" 
              value={formData.followUpDate}
              onChange={(e) => handleInputChange('followUpDate', e.target.value)}
              className="form-input"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="prescription-actions">
          <button 
            type="button" 
            className="btn-generate-prescription"
            onClick={generatePreview}
          >
            👁️ Generate Prescription
          </button>
          <button 
            type="button" 
            className="btn-reset-form"
            onClick={resetForm}
          >
            🔄 Reset Form
          </button>
        </div>
      </div>

      {/* Prescription Preview */}
      {showPreview && (
        <div className="prescription-preview-section" id="prescription-preview" ref={previewRef} style={{background: 'white', color: 'black'}}>
          <div className="preview-header">
            <h2>📋 Prescription Preview</h2>
          </div>
          
          <div className="prescription-preview-card" style={{background: 'white', color: 'black'}}>
            {/* Top Section */}
            <div className="preview-top">
              <div className="preview-logo-section">
                {clinicLogo ? (
                  <img src={clinicLogo} alt="Clinic Logo" className="preview-clinic-logo" />
                ) : (
                  <div className="preview-medical-cross">✚</div>
                )}
              </div>
              <div className="preview-clinic-info">
                <h2 className="preview-clinic-name">{formData.clinicName}</h2>
                <p className="preview-clinic-address">{formData.clinicAddress}</p>
                <p className="preview-clinic-contact">📞 {formData.clinicPhone} | ✉️ {formData.clinicEmail}</p>
              </div>
            </div>
            
            <div className="preview-divider"></div>
            
            {/* Rx and Date */}
            <div className="preview-rx-date">
              <div className="preview-rx">Rx</div>
              <div className="preview-date">Date: {formatDate(formData.date)}</div>
            </div>
            
            {/* Patient Info */}
            <div className="preview-patient-info">
              <div className="preview-patient-row">
                <span className="preview-label">Patient Name:</span>
                <span className="preview-value">{formData.patientName || '________________'}</span>
              </div>
              <div className="preview-patient-details">
                <span className="preview-label">Patient ID:</span>
                <span className="preview-value">{formData.patientId || 'N/A'}</span>
                <span className="preview-label" style={{ marginLeft: '20px' }}>Age:</span>
                <span className="preview-value">{formData.age || '___'}</span>
                <span className="preview-label" style={{ marginLeft: '20px' }}>Sex:</span>
                <span className="preview-value">{formData.gender || '___'}</span>
              </div>
            </div>
            
            {/* Diagnosis */}
            {formData.diagnosis && (
              <div className="preview-diagnosis">
                <span className="preview-label">Diagnosis:</span>
                <span className="preview-value">{formData.diagnosis}</span>
              </div>
            )}
            
            {/* Medicines Table */}
            <div className="preview-medicines-table">
              <table>
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Dose</th>
                    <th>Frequency / Timing</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.medicines.filter(m => m.name.trim()).map((medicine, index) => (
                    <tr key={index}>
                      <td>{medicine.name}</td>
                      <td>{medicine.dose}</td>
                      <td>{medicine.frequency}</td>
                      <td>{medicine.duration}</td>
                    </tr>
                  ))}
                  {formData.medicines.filter(m => m.name.trim()).length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', color: '#999' }}>No medicines added</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Advice */}
            {(selectedAdvice.filter(a => a.selected).length > 0 || formData.advice) && (
              <div className="preview-advice">
                <span className="preview-label">Advice:</span>
                <ul className="preview-advice-list">
                  {selectedAdvice.filter(a => a.selected).map((advice, index) => (
                    <li key={index}>{advice.text}</li>
                  ))}
                  {formData.advice && <li>{formData.advice}</li>}
                </ul>
              </div>
            )}
            
            {/* Follow-up */}
            {formData.followUpDate && (
              <div className="preview-followup">
                <span className="preview-label">Follow-up Date:</span>
                <span className="preview-value">{formatDate(formData.followUpDate)}</span>
              </div>
            )}
            
            {/* Signature Section */}
            <div className="preview-signature-section">
              <div className="preview-signature">
                {doctorSignature ? (
                  <img src={doctorSignature} alt="Signature" className="signature-image" />
                ) : (
                  <div className="signature-placeholder-line"></div>
                )}
                <div className="preview-doctor-info">
                  <div className="preview-doctor-name">{formData.doctorName}</div>
                  <div className="preview-doctor-qual">{formData.qualification}</div>
                  <div className="preview-doctor-reg">Reg. No: {formData.registrationNo}</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Print/Save PDF Button */}
          <div className="preview-actions">
            <button 
              type="button"
              className="btn-print-pdf"
              onClick={handlePrintPDF}
            >
              🖨️ Print / Save as PDF
            </button>
            <button 
              type="button"
              className="btn-save-prescription-pad"
              onClick={handleSave}
              disabled={saving || !formData.patientName}
            >
              {saving ? 'Saving...' : '💾 Save Prescription'}
            </button>
            {onCancel && (
              <button 
                type="button"
                className="btn-cancel-prescription"
                onClick={onCancel}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PrescriptionPad;
