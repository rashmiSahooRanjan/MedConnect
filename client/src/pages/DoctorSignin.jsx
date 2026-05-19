import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Captcha from '../components/Captcha';

const DoctorSignin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [twoFactorEmail, setTwoFactorEmail] = useState('');
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

  const handleTwoFactorCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setTwoFactorCode(value);
    if (errors.twoFactorCode) {
      setErrors({ ...errors, twoFactorCode: '' });
    }
  };

  const handleCaptchaVerify = (isValid) => {
    setCaptchaVerified(isValid);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!showTwoFactor) {
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
    } else {
      if (!twoFactorCode || twoFactorCode.length < 6) {
        newErrors.twoFactorCode = 'Please enter a valid 6-digit code';
      }
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
      // If showing 2FA form, verify the code
      if (showTwoFactor) {
        const verifyResponse = await axios.post('/api/doctors/2fa/verify', {
          email: twoFactorEmail,
          token: twoFactorCode
        });
        
        // Store user data and token
        const verifyData = verifyResponse.data;
        localStorage.setItem('doctorData', JSON.stringify(verifyData));
        if (verifyData.token) {
          localStorage.setItem('doctorToken', verifyData.token);
        }
        
        // Redirect to doctor dashboard
        navigate('/doctor/dashboard');
        return;
      }

      // Normal login - verify password first
      const response = await axios.post('/api/doctors/signin', formData);
      
      // Check if 2FA is required
      if (response.data.requiresTwoFactor) {
        // Show 2FA verification form
        setShowTwoFactor(true);
        setTwoFactorEmail(response.data.email);
        setLoading(false);
        return;
      }
      
      // Store user data and token
      const responseData = response.data;
      const doctorData = responseData.data || responseData;
      localStorage.setItem('doctorData', JSON.stringify(doctorData));
      if (responseData.token) {
        localStorage.setItem('doctorToken', responseData.token);
      }
      
      // Redirect to doctor dashboard
      navigate('/doctor/dashboard');
    } catch (error) {
      setGeneralError(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setShowTwoFactor(false);
    setTwoFactorCode('');
    setTwoFactorEmail('');
    setGeneralError('');
  };

  return (
    <div className="form-container">
      <div className="form-card">
        <div className="form-header">
          <h2>{showTwoFactor ? 'Two-Factor Authentication' : 'Doctor Login'}</h2>
          <p>{showTwoFactor ? 'Enter the code from your authenticator app' : 'Sign in to your doctor account'}</p>
        </div>

        {generalError && (
          <div className="alert alert-error">{generalError}</div>
        )}

        <form onSubmit={handleSubmit}>
          {!showTwoFactor ? (
            <>
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
            </>
          ) : (
            <>
              <div className="two-factor-info">
                <div className="two-factor-icon">🔐</div>
                <p>Two-Factor Authentication is enabled for your account.</p>
                <p className="two-factor-hint">Open your authenticator app (Google Authenticator, Authy, etc.) and enter the 6-digit code.</p>
              </div>

              <div className="form-group">
                <label className="form-label">Verification Code</label>
                <input
                  type="text"
                  className={`form-input ${errors.twoFactorCode ? 'error' : ''}`}
                  placeholder="Enter 6-digit code"
                  value={twoFactorCode}
                  onChange={handleTwoFactorCodeChange}
                  maxLength={6}
                  autoFocus
                />
                {errors.twoFactorCode && <span className="error-message">{errors.twoFactorCode}</span>}
              </div>

              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={handleBackToLogin}
                style={{ marginBottom: '15px' }}
              >
                ← Back to Login
              </button>
            </>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading || (!showTwoFactor && !captchaVerified)}>
            {loading ? <span className="loading-spinner"></span> : ''}
            {loading ? (showTwoFactor ? 'Verifying...' : 'Signing in...') : (showTwoFactor ? 'Verify Code' : 'Sign In')}
          </button>

          {!showTwoFactor && (
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => navigate('/doctor/signup')}
            >
              Create New Account
            </button>
          )}

          <div className="form-footer">
            {!showTwoFactor && (
              <p>Don't have an account? <Link to="/doctor/signup">Sign Up</Link></p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorSignin;
