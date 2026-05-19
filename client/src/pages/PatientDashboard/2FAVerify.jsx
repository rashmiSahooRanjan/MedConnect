import React, { useState } from 'react';
import { X, Shield, CheckCircle, AlertCircle } from 'lucide-react';

const TwoFactorVerify = ({ patientData, isOpen, onVerifySuccess, onClose }) => {
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!code || !password) {
      setError('Please enter both password and verification code');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`http://localhost:5000/api/patients/2fa/verify/${patientData._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: code, password })
      });
      const data = await response.json();
      if (data.success) {
        // Store verified session
        localStorage.setItem('patient2FASession', JSON.stringify({ verified: true, timestamp: Date.now() }));
        onVerifySuccess();
      } else {
        setError(data.message || 'Verification failed');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setCode('');
    setPassword('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000,
      padding: '20px'
    }} onClick={closeModal}>
      <div style={{
        background: 'white', borderRadius: '16px', width: '90%', maxWidth: '450px', padding: '32px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ margin: 0, color: '#1f2937', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Shield size={24} />
            Verify 2FA
          </h3>
          <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '4px' }}>
            <X size={24} />
          </button>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        <form onSubmit={handleVerify}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151' }}>Account Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              style={{
                width: '100%', padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: '8px',
                fontSize: '1rem', boxSizing: 'border-box'
              }}
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151' }}>Verification Code</label>
            <input
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="123456"
              required
              style={{
                width: '100%', padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: '8px',
                fontSize: '1.2rem', fontWeight: '600', textAlign: 'center', letterSpacing: '6px'
              }}
            />
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '6px' }}>
              Enter 6-digit code from your authenticator app
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={closeModal}
              style={{
                flex: 1, padding: '12px 20px', background: '#f3f4f6', color: '#374151',
                border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontWeight: '500'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !code || !password}
              style={{
                flex: 1, padding: '12px 20px',
                background: loading || !code || !password ? '#9ca3af' : '#10b981',
                color: 'white', border: 'none', borderRadius: '8px',
                fontWeight: '600', cursor: loading || !code || !password ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TwoFactorVerify;

