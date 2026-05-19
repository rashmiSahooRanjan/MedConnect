import { useState, useEffect, useRef } from 'react';
import './patient dashboard css/userprofile.css';

const UserProfile = ({ patientData, setPatientData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: patientData?.name || '',
    email: patientData?.email || '',
    contactNumber: patientData?.contactNumber || '',
    dateOfBirth: patientData?.dateOfBirth || '',
    gender: patientData?.gender || '',
    bloodGroup: patientData?.bloodGroup || '',
    address: patientData?.address || '',
    emergencyContact: patientData?.emergencyContact || '',
  });

  useEffect(() => {
    if (patientData) {
      setFormData({
        name: patientData.name || '',
        email: patientData.email || '',
        contactNumber: patientData.contactNumber || '',
        dateOfBirth: patientData.dateOfBirth || '',
        gender: patientData.gender || '',
        bloodGroup: patientData.bloodGroup || '',
        address: patientData.address || '',
        emergencyContact: patientData.emergencyContact || '',
      });
    }
  }, [patientData]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`http://localhost:5000/api/patients/profile/${patientData._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log('Profile update response:', response.status, data);

      if (response.ok) {
        const newPatientData = { ...patientData, ...data };
        setPatientData(newPatientData);
        localStorage.setItem('patientData', JSON.stringify(newPatientData));
        setIsEditing(false);
        alert('Profile updated successfully!');
      } else {
        alert(data.message || 'Failed to update profile: ' + response.status);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again. Error: ' + error.message);
    }
    setIsSaving(false);
  };

  const handlePhotoClick = () => {
    fileInputRef.current.click();
  };

  const getPhotoUrl = (photoPath) => {
    if (!photoPath) return null;
    if (photoPath.startsWith('http')) return photoPath;
    return `http://localhost:5000${photoPath}`;
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('profilePhoto', file);

      const response = await fetch(`http://localhost:5000/api/patients/profile/photo/${patientData._id}`, {
        method: 'PUT',
        body: formData,
      });

      const data = await response.json();
      console.log('Photo update response:', response.status, data);

      if (response.ok) {
        const newPatientData = { ...patientData, ...data };
        setPatientData(newPatientData);
        localStorage.setItem('patientData', JSON.stringify(newPatientData));
        alert('Photo updated successfully!');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        alert(data.message || 'Failed to update photo: ' + response.status);
      }
    } catch (error) {
      console.error('Error updating photo:', error);
      alert('Failed to update photo. Please try again. Error: ' + error.message);
    }
    setIsUploading(false);
  };

  return (
    <div className="dashboard-home">
      <div className="profile-container">
        <div className="profile-header-section">
          <div className="profile-avatar-large">
            {patientData?.profilePhoto ? (
              <img src={getPhotoUrl(patientData.profilePhoto)} alt={patientData.name} />
            ) : (
              <span>{patientData?.name?.charAt(0) || 'P'}</span>
            )}
          </div>
          <div className="profile-info">
            <h2>{patientData?.name}</h2>
            <p className="patient-id">Patient ID: {patientData?.uniqueId}</p>
            <button 
              className="btn-edit-photo" 
              onClick={handlePhotoClick}
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Change Photo'}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </div>
        </div>

        <div className="profile-form-section">
          <div className="profile-section-header">
            <h3>Personal Information</h3>
            <button 
              className="btn-edit" 
              onClick={() => {
                if (isEditing) {
                  handleSaveProfile();
                } else {
                  setIsEditing(!isEditing);
                }
              }}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Edit Profile')}
            </button>
          </div>

          <div className="profile-grid">
            <div className="profile-field">
              <label>Full Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                disabled={!isEditing}
              />
            </div>
            <div className="profile-field">
              <label>Email ID</label>
              <input 
                type="email" 
                value={formData.email}
                disabled={!isEditing}
              />
            </div>
            <div className="profile-field">
              <label>Contact Number</label>
              <input 
                type="tel" 
                value={formData.contactNumber}
                onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                disabled={!isEditing}
              />
            </div>
            <div className="profile-field">
              <label>Date of Birth</label>
              <input 
                type="date" 
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                disabled={!isEditing}
              />
            </div>
            <div className="profile-field">
              <label>Gender</label>
              <select 
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
                disabled={!isEditing}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="profile-field">
              <label>Blood Group</label>
              <select 
                value={formData.bloodGroup}
                onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}
                disabled={!isEditing}
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
            <div className="profile-field full-width">
              <label>Address</label>
              <input 
                type="text" 
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                disabled={!isEditing}
              />
            </div>
            <div className="profile-field">
              <label>Emergency Contact</label>
              <input 
                type="tel" 
                value={formData.emergencyContact}
                onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                disabled={!isEditing}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

