import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  X, 
  Shield, 
  AlertTriangle, 
  Moon, 
  Smartphone 
} from 'lucide-react';
import TwoFactorAuth from './TwoFactorAuth';

const Settings = ({ patientData }) => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({ 
    current: false, 
    new: false, 
    confirm: false 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Fixed: Added missing state declarations
  const [devices, setDevices] = useState([]);
  const [appearance, setAppearance] = useState({
    theme: 'light',
    language: 'en',
    fontSize: 'medium'
  });

  useEffect(() => {
    localStorage.setItem('patientDevices', JSON.stringify(devices));
  }, [devices]);

  useEffect(() => {
    if (patientData && patientData._id) {
      fetchTwoFactorStatus();
    }
  }, [patientData]);

  const fetchTwoFactorStatus = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/patients/2fa/status/${patientData?._id || ''}`
      );
      if (!response.ok) throw new Error('Network response not ok');
      const data = await response.json();
      if (data.success) {
        setTwoFactorEnabled(data.twoFactorEnabled || false);
      }
    } catch (error) {
      console.error('Error fetching 2FA status:', error);
    }
  };

  const handle2FAStatusChange = () => {
    fetchTwoFactorStatus();
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/patients/change-password/${patientData._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          currentPassword: passwordForm.currentPassword, 
          newPassword: passwordForm.newPassword 
        })
      });
      const data = await response.json();
      if (data.success) {
        setSuccess('Password updated successfully');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setShowPasswordModal(false), 1500);
      } else {
        setError(data.message || 'Failed to update password');
      }
    } catch (err) {
      setError('Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setDeleteError('');
    if (!deletePassword) {
      setDeleteError('Please enter your password to confirm');
      return;
    }
    setDeleteLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/patients/${patientData._id}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ password: deletePassword })
      });
      const data = await response.json();
      if (data.success) {
        alert('Your account has been permanently deleted');
        localStorage.removeItem('patientToken');
        localStorage.removeItem('patientData');
        window.location.href = '/patient-signin';
      } else {
        setDeleteError(data.message || 'Failed to delete account');
      }
    } catch (err) {
      setDeleteError('Failed to connect to server');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Fixed: Now properly defined
  const handleAppearanceChange = (key, value) => {
    setAppearance(prev => ({ ...prev, [key]: value }));
  };

  const containerStyle = {
    maxWidth: 900,
    margin: '0 auto',
    padding: 20
  };

  const sectionStyle = {
    background: 'white',
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  };

  const h2Style = { 
    fontSize: '1.75rem', 
    marginBottom: 24, 
    color: '#1f2937' 
  };

  const h3Style = { 
    display: 'flex', 
    alignItems: 'center', 
    gap: 10, 
    fontSize: '1.1rem', 
    marginBottom: 16, 
    color: '#374151' 
  };

  const modalOverlayStyle = { 
    position: 'fixed', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    background: 'rgba(0,0,0,0.5)', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    zIndex: 1000 
  };

  const modalStyle = { 
    background: 'white', 
    borderRadius: 16, 
    width: '90%', 
    maxWidth: 450, 
    padding: 24 
  };

  const togglePasswordIcon = (field) => {
    const fieldKey = field === 'currentPassword' ? 'current' : field === 'newPassword' ? 'new' : 'confirm';
    return showPasswords[fieldKey] ? EyeOff : Eye;
  };

  return (
    <div className="dashboard-home" style={containerStyle}>
      <h2 style={h2Style}>Settings</h2>

      {/* Appearance Settings */}
      <div style={{ ...sectionStyle, borderTop: '4px solid #6366f1' }}>
        <h3 style={h3Style}>
          <Moon size={20} color="#6366f1" />
          Appearance Settings
        </h3>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, fontSize: '0.95rem', color: '#1f2937', fontWeight: 500 }}>Theme</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {['light', 'dark', 'system'].map(theme => (
              <button
                key={theme}
                onClick={() => handleAppearanceChange('theme', theme)}
                style={{
                  padding: '8px 16px',
                  border: appearance.theme === theme ? '2px solid #0d9488' : '2px solid #e2e8f0',
                  background: appearance.theme === theme ? '#f0fdfa' : 'white',
                  borderRadius: 8,
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {theme}
              </button>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, fontSize: '0.95rem', color: '#1f2937', fontWeight: 500 }}>Language</label>
          <select
            value={appearance.language}
            onChange={e => handleAppearanceChange('language', e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.9rem', width: '100%' }}
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 8, fontSize: '0.95rem', color: '#1f2937', fontWeight: 500 }}>Font Size</label>
          <select
            value={appearance.fontSize}
            onChange={e => handleAppearanceChange('fontSize', e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.9rem', width: '100%' }}
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
      </div>

      {/* Change Password Section */}
      <div style={{ ...sectionStyle, borderTop: '4px solid #3b82f6' }}>
        <h3 style={h3Style}>
          <Lock size={20} color="#3b82f6" />
          Change Password
        </h3>
        <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: 16 }}>Update your password to keep your account secure</p>
        <button
          onClick={() => setShowPasswordModal(true)}
          style={{ background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb', padding: '10px 20px', borderRadius: 8, fontWeight: 500, cursor: 'pointer' }}
        >
          Change Password
        </button>
      </div>

      {/* 2FA Section */}
      <div style={{ ...sectionStyle, borderTop: '4px solid #8B5CF6' }}>
        <h3 style={h3Style}>
          <Shield size={20} color="#8B5CF6" />
          Two-Factor Authentication
        </h3>
        <div style={{ marginBottom: 16 }}>
          <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
            {twoFactorEnabled ? 'Two-Factor Authentication is enabled for added security.' : 'Add an extra layer of security to your account.'}
          </p>
          <button
            className="btn-change"
            onClick={() => setShowTwoFactorModal(true)}
            style={{ background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb', padding: '10px 20px', borderRadius: 8, fontWeight: 500, cursor: 'pointer', width: '100%' }}
          >
            {twoFactorEnabled ? 'Manage 2FA' : 'Enable 2FA'}
          </button>
        </div>
      </div>

      <TwoFactorAuth 
        patientData={patientData}
        isOpen={showTwoFactorModal}
        onClose={() => setShowTwoFactorModal(false)}
        onStatusChange={handle2FAStatusChange}
      />

      {/* Danger Zone */}
      <div style={{ ...sectionStyle, borderTop: '4px solid #ef4444', border: '2px solid #ef4444' }}>
        <h3 style={{ ...h3Style, color: '#991b1b' }}>
          <AlertTriangle size={20} />
          Danger Zone
        </h3>
        <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: 16 }}>
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#ef4444', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 500, cursor: 'pointer' }}
        >
          🗑️ Delete Account
        </button>
      </div>

      {/* Modals - Password Change */}
      {showPasswordModal && (
        <div style={modalOverlayStyle} onClick={() => setShowPasswordModal(false)}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3>Change Password</h3>
              <button onClick={() => setShowPasswordModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handlePasswordChange}>
              {['currentPassword', 'newPassword', 'confirmPassword'].map(field => (
                <div key={field} style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: '0.875rem', color: '#374151' }}>
                    {field === 'currentPassword' ? 'Current Password' : field === 'newPassword' ? 'New Password' : 'Confirm New Password'}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPasswords[field === 'currentPassword' ? 'current' : field === 'newPassword' ? 'new' : 'confirm'] ? 'text' : 'password'}
                      value={passwordForm[field]}
                      onChange={e => setPasswordForm({ ...passwordForm, [field]: e.target.value })}
                      required
                      style={{ width: '100%', padding: '10px 40px 10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: '0.95rem', boxSizing: 'border-box' }}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility(field === 'currentPassword' ? 'current' : field === 'newPassword' ? 'new' : 'confirm')}
                      style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}
                    >
                      {showPasswords[field === 'currentPassword' ? 'current' : field === 'newPassword' ? 'new' : 'confirm'] ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              ))}
              {error && (
                <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontSize: '0.875rem' }}>
                  {error}
                </div>
              )}
              {success && (
                <div style={{ background: '#d1fae5', color: '#065f46', padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontSize: '0.875rem' }}>
                  {success}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: 12,
                  background: loading ? '#93c5fd' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: '1rem',
                  fontWeight: 500,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div style={modalOverlayStyle} onClick={() => setShowDeleteModal(false)}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ color: '#991b1b' }}>Delete Account</h3>
              <button onClick={() => setShowDeleteModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <p style={{ color: '#dc2626', fontSize: '0.9rem', fontWeight: 500, marginBottom: 16 }}>
              Warning: This action cannot be undone!
            </p>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: '0.875rem', color: '#374151' }}>
                Enter password to confirm
              </label>
              <input
                type="password"
                value={deletePassword}
                onChange={e => setDeletePassword(e.target.value)}
                style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8, fontSize: '0.95rem', boxSizing: 'border-box' }}
              />
            </div>
            {deleteError && (
              <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontSize: '0.875rem' }}>
                {deleteError}
              </div>
            )}
            <button
              onClick={handleDeleteAccount}
              disabled={deleteLoading || !deletePassword}
              style={{
                width: '100%',
                padding: 12,
                background: (deleteLoading || !deletePassword) ? '#fca5a5' : '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontSize: '1rem',
                fontWeight: 500,
                cursor: (deleteLoading || !deletePassword) ? 'not-allowed' : 'pointer'
              }}
            >
              {deleteLoading ? 'Deleting...' : 'Delete Account'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;

