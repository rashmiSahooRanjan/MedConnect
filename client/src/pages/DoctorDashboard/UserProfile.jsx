import { useState, useEffect, useRef } from 'react';

const UserProfile = ({ doctorData, setDoctorData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: doctorData?.name || '',
    email: doctorData?.email || '',
    contactNumber: doctorData?.contactNumber || '',
    specialty: doctorData?.specialty || '',
    yearOfExperience: doctorData?.yearOfExperience || '',
    consultationFee: doctorData?.consultationFee || '',
    timing: doctorData?.timing || '',
    clinicAddress: doctorData?.clinicAddress || '',
  });

  useEffect(() => {
    if (doctorData) {
      setFormData({
        name: doctorData.name || '',
        email: doctorData.email || '',
        contactNumber: doctorData.contactNumber || '',
        specialty: doctorData.specialty || doctorData.specialist || '',
        yearOfExperience: doctorData.yearOfExperience || '',
        consultationFee: doctorData.consultationFee || '',
        timing: doctorData.timing || '',
        clinicAddress: doctorData.clinicAddress || '',
      });
    }
  }, [doctorData]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const updateData = {
        ...formData,
        specialist: formData.specialty,
      };
      delete updateData.specialty;
      
      const response = await fetch(`http://localhost:5000/api/doctors/profile/${doctorData._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (response.ok) {
        const updatedData = data.data || data;
        const newDoctorData = { ...doctorData, ...updatedData };
        setDoctorData(newDoctorData);
        localStorage.setItem('doctorData', JSON.stringify(newDoctorData));
        setIsEditing(false);
        alert('Profile updated successfully!');
      } else {
        alert(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
    setIsSaving(false);
  };

  const handlePhotoClick = () => {
    fileInputRef.current.click();
  };

  const getPhotoUrl = (photoPath) => {
    if (!photoPath) return null;
    if (photoPath.startsWith('http')) return photoPath;
    const timestamp = new Date().getTime();
    return `http://localhost:5000${photoPath}?t=${timestamp}`;
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formDataPhoto = new FormData();
      formDataPhoto.append('profilePhoto', file);

      const response = await fetch(`http://localhost:5000/api/doctors/profile/photo/${doctorData._id}`, {
        method: 'PUT',
        body: formDataPhoto,
      });

      const data = await response.json();

      if (response.ok) {
        const newPhotoUrl = data.data?.profilePhoto || data.profilePhoto;
        const newDoctorData = { ...doctorData, profilePhoto: newPhotoUrl };
        setDoctorData(newDoctorData);
        localStorage.setItem('doctorData', JSON.stringify(newDoctorData));
        if (fileInputRef.current) fileInputRef.current.value = '';
        alert('Photo updated successfully!');
      } else {
        alert(data.message || 'Failed to update photo');
      }
    } catch (error) {
      console.error('Error updating photo:', error);
      alert('Failed to update photo');
    }
    setIsUploading(false);
  };

  return (
    <div className="dashboard-home">
      <div className="profile-container">
        <div className="profile-header-section">
          <div className="profile-avatar-large">
            {doctorData?.profilePhoto ? (
              <img src={getPhotoUrl(doctorData.profilePhoto)} alt={doctorData.name} />
            ) : (
              <span>{doctorData?.name?.charAt(0) || 'D'}</span>
            )}
          </div>
          <div className="profile-info">
            <h2>Dr. {doctorData?.name}</h2>
            <p className="patient-id">Doctor ID: {doctorData?.uniqueId}</p>
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
            <h3>Professional Information</h3>
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
                placeholder="Enter phone number"
              />
            </div>
            <div className="profile-field">
              <label>Specialty</label>
              <input 
                type="text" 
                value={formData.specialty}
                onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                disabled={!isEditing}
              />
            </div>
            <div className="profile-field">
              <label>Years of Experience</label>
              <input 
                type="number" 
                value={formData.yearOfExperience}
                onChange={(e) => setFormData({...formData, yearOfExperience: e.target.value})}
                disabled={!isEditing}
              />
            </div>
            <div className="profile-field">
              <label>Consultation Fee (₹)</label>
              <input 
                type="number" 
                value={formData.consultationFee}
                onChange={(e) => setFormData({...formData, consultationFee: e.target.value})}
                disabled={!isEditing}
              />
            </div>
            <div className="profile-field">
              <label>Timing</label>
              <input 
                type="text" 
                value={formData.timing}
                onChange={(e) => setFormData({...formData, timing: e.target.value})}
                disabled={!isEditing}
                placeholder="e.g., 9:00 AM - 5:00 PM"
              />
            </div>
            <div className="profile-field full-width">
              <label>Clinic Address</label>
              <input 
                type="text" 
                value={formData.clinicAddress}
                onChange={(e) => setFormData({...formData, clinicAddress: e.target.value})}
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

