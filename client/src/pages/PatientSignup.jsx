import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PhotoUpload from '../components/PhotoUpload';

const PatientSignup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contactNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [photo, setPhoto] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [uniqueId, setUniqueId] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handlePhotoChange = (file) => {
    setPhoto(file);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required';
    } else if (!/^\d{10}$/.test(formData.contactNumber)) {
      newErrors.contactNumber = 'Please enter a valid 10-digit number';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setSuccess(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('contactNumber', formData.contactNumber);
      formDataToSend.append('password', formData.password);
      if (photo) {
        formDataToSend.append('profilePhoto', photo);
      }

      const response = await axios.post('/api/patients/signup', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('Registration successful!');
      setUniqueId(response.data.uniqueId);
      
      // Redirect to signin after 2 seconds
      setTimeout(() => {
        navigate('/patient/signin');
      }, 2000);
    } catch (error) {
      setErrors({ 
        general: error.response?.data?.message || 'Registration failed. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-card">
        <div className="form-header">
          <h2>Patient Registration</h2>
          <p>Create your patient account</p>
        </div>

        {errors.general && (
          <div className="alert alert-error">{errors.general}</div>
        )}

        {success && (
          <div className="alert alert-success">{success}</div>
        )}

        {uniqueId && (
          <div className="unique-id-display">
            <div className="unique-id-label">Your Unique Patient ID</div>
            <div className="unique-id-value">{uniqueId}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="name"
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Email ID</label>
            <input
              type="email"
              name="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Contact Number</label>
            <input
              type="tel"
              name="contactNumber"
              className={`form-input ${errors.contactNumber ? 'error' : ''}`}
              placeholder="Enter 10-digit contact number"
              value={formData.contactNumber}
              onChange={handleChange}
              maxLength={10}
            />
            {errors.contactNumber && <span className="error-message">{errors.contactNumber}</span>}
          </div>

          <PhotoUpload onPhotoChange={handlePhotoChange} />

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="Create a password (min 8 characters)"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <span className="loading-spinner"></span> : ''}
            {loading ? 'Registering...' : 'Register'}
          </button>

          <div className="form-footer">
            <p>Already have an account? <Link to="/patient/signin">Sign In</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientSignup;
