import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Captcha from '../components/Captcha';

const PatientSignin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleCaptchaVerify = (isValid) => {
    setCaptchaVerified(isValid);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    if (!captchaVerified) {
      newErrors.captcha = 'Please verify the captcha';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setGeneralError('');

    try {
      // Normal login - verify password first
      const response = await axios.post('/api/patients/signin', formData);
      
      // Store user data in localStorage
      localStorage.setItem('patientData', JSON.stringify(response.data));
      localStorage.setItem('patientToken', response.data.token);
      
      // Redirect to patient dashboard
      navigate('/patient/dashboard');
    } catch (error) {
      setGeneralError(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-card">
        <div className="form-header">
          <h2>Patient Login</h2>
          <p>Sign in to your patient account</p>
        </div>

        {generalError && (
          <div className="alert alert-error">{generalError}</div>
        )}

        <form onSubmit={handleSubmit}>
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
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <Captcha onVerify={handleCaptchaVerify} />
          {errors.captcha && <span className="error-message">{errors.captcha}</span>}

          <button type="submit" className="btn btn-primary" disabled={loading || !captchaVerified}>
            {loading ? <span className="loading-spinner"></span> : ''}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => navigate('/patient/signup')}
          >
            Create New Account
          </button>

          <div className="form-footer">
            <p>Don't have an account? <Link to="/patient/signup">Sign Up</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientSignin;

