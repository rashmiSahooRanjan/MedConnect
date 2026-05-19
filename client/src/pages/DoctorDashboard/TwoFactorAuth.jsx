import React, { useState, useEffect } from 'react';
import { X, Shield, CheckCircle, AlertCircle, Copy, Download, QrCode } from 'lucide-react';

const DoctorTwoFactorAuth = ({ doctorData, isOpen, onClose, onStatusChange }) => {
  const [twoFactorStep, setTwoFactorStep] = useState('initial');
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [twoFactorError, setTwoFactorError] = useState('');
  const [twoFactorSuccess, setTwoFactorSuccess] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [passwordFor2FA, setPasswordFor2FA] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchTwoFactorStatus();
    }
  }, [isOpen, doctorData]);

  const fetchTwoFactorStatus = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/doctors/2fa/status/${doctorData._id}`);
      const data = await response.json();
      if (data.success) {
        setTwoFactorEnabled(data.twoFactorEnabled || false);
        setTwoFactorStep('initial');
        setTwoFactorError('');
      }
    } catch (error) {
      console.error('Error fetching 2FA status:', error);
    }
  };

  const handleSetup2FA = async () => {
    try {
      setTwoFactorLoading(true);
      setTwoFactorError('');
      const response = await fetch(`http://localhost:5000/api/doctors/2fa/setup/${doctorData._id}`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        setQrCode(data.qrCode);
        setTwoFactorStep('verify');
      } else {
        setTwoFactorError(data.message || 'Failed to setup 2FA');
      }
    } catch (error) {
      setTwoFactorError('Failed to setup 2FA. Please try again.');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleVerifyAndEnable2FA = async () => {
    if (!verificationCode || !passwordFor2FA) {
      setTwoFactorError('Please enter verification code and password');
      return;
    }
    try {
      setTwoFactorLoading(true);
      setTwoFactorError('');
      const response = await fetch(`http://localhost:5000/api/doctors/2fa/enable/${doctorData._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verificationCode, password: passwordFor2FA })
      });
      const data = await response.json();
      if (data.success) {
        setBackupCodes(data.backupCodes);
        setTwoFactorStep('backup-codes');
        setTwoFactorSuccess('2FA enabled successfully!');
        setTwoFactorEnabled(true);
        onStatusChange && onStatusChange();
      } else {
        setTwoFactorError(data.message || 'Failed to enable 2FA');
      }
    } catch (error) {
      setTwoFactorError('Failed to enable 2FA. Please try again.');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!passwordFor2FA) {
      setTwoFactorError('Please enter your password to disable 2FA');
      return;
    }
    try {
      setTwoFactorLoading(true);
      setTwoFactorError('');
      const response = await fetch(`http://localhost:5000/api/doctors/2fa/disable/${doctorData._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordFor2FA })
      });
      const data = await response.json();
      if (data.success) {
        setTwoFactorStep('initial');
        setTwoFactorEnabled(false);
        setTwoFactorSuccess('2FA disabled successfully');
        onStatusChange && onStatusChange();
      } else {
        setTwoFactorError(data.message || 'Failed to disable 2FA');
      }
    } catch (error) {
      setTwoFactorError('Failed to disable 2FA. Please try again.');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const copySecret = async (secret) => {
    await navigator.clipboard.writeText(secret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const downloadBackupCodes = () => {
    const content = backupCodes.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'medi-connect-doctor-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const closeModal = () => {
    setTwoFactorStep('initial');
    setTwoFactorError('');
    setTwoFactorSuccess('');
    setQrCode('');
    setVerificationCode('');
    setPasswordFor2FA('');
    setBackupCodes([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={closeModal} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="doctor-two-factor-modal" onClick={(e) => e.stopPropagation()} style={{
        background: 'white',
        borderRadius: '16px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, color: '#1f2937' }}>
            <Shield size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Two-Factor Authentication
          </h3>
          <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
            <X size={24} />
          </button>
        </div>

        {twoFactorError && (
          <div style={{
            background: '#fee2e2',
            color: '#991b1b',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '16px',
            border: '1px solid #fecaca'
          }}>
            <AlertCircle size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            {twoFactorError}
          </div>
        )}

        {twoFactorSuccess && (
          <div style={{
            background: '#d1fae5',
            color: '#065f46',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '16px',
            border: '1px solid #a7f3d0'
          }}>
            <CheckCircle size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            {twoFactorSuccess}
          </div>
        )}

        {twoFactorStep === 'initial' && (
          <div className="two-factor-initial">
            {twoFactorEnabled ? (
              <div className="two-factor-enabled-info" style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: '#10b981',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}>
                  <CheckCircle size={32} color="white" />
                </div>
                <div className="enabled-badge" style={{
                  display: 'inline-block',
                  padding: '8px 20px',
                  background: '#d1fae5',
                  color: '#065f46',
                  borderRadius: '20px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  marginBottom: '16px'
                }}>
                  ✓ 2FA is Enabled
                </div>
                <p style={{ color: '#6b7280', marginBottom: '24px', lineHeight: '1.6' }}>
                  Two-Factor Authentication is protecting your account. You'll need your authenticator app or backup codes to sign in.
                </p>
                <p style={{ fontWeight: '500', color: '#374151', marginBottom: '16px' }}>To disable 2FA:</p>
                <div style={{ marginBottom: '16px' }}>
                  <input
                    type="password"
                    placeholder="Enter your account password"
                    value={passwordFor2FA}
                    onChange={(e) => setPasswordFor2FA(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '0.95rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <button
                  onClick={handleDisable2FA}
                  disabled={twoFactorLoading || !passwordFor2FA}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: (twoFactorLoading || !passwordFor2FA) ? '#9ca3af' : '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: (twoFactorLoading || !passwordFor2FA) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {twoFactorLoading ? 'Disabling...' : 'Disable 2FA'}
                </button>
              </div>
            ) : (
              <div className="two-factor-enable-info" style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: '#8B5CF6',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}>
                  <Shield size={32} color="white" />
                </div>
                <h4 style={{ marginBottom: '16px', color: '#1f2937' }}>Enable Two-Factor Authentication</h4>
                <p style={{ color: '#6b7280', marginBottom: '24px', lineHeight: '1.6' }}>
                  2FA adds extra security to your MediConnect account. Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.).
                </p>
                <ul style={{ textAlign: 'left', color: '#6b7280', marginBottom: '24px', paddingLeft: '20px' }}>
                  <li>📱 Install authenticator app</li>
                  <li>📲 Scan QR code below</li>
                  <li>🔑 Enter 6-digit code</li>
                </ul>
                <button
                  onClick={handleSetup2FA}
                  disabled={twoFactorLoading}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: twoFactorLoading ? '#9ca3af' : '#8B5CF6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: twoFactorLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {twoFactorLoading ? 'Setting up...' : 'Setup 2FA'}
                </button>
              </div>
            )}
          </div>
        )}

        {twoFactorStep === 'verify' && (
          <div className="two-factor-verify" style={{ textAlign: 'center' }}>
            <h4 style={{ marginBottom: '16px', color: '#1f2937' }}>Verify Authenticator</h4>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>
              Open your authenticator app and enter the 6-digit code.
            </p>
            {qrCode && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{
                  background: '#f8fafc',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '2px dashed #e2e8f0'
                }}>
                  <img src={qrCode} alt="2FA QR Code" style={{ width: '200px', height: '200px' }} />
                </div>
                <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '8px' }}>
                  Can't scan? Copy secret manually:
                </p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px', justifyContent: 'center' }}>
                  <input
                    readOnly
                    value="Secret copied to clipboard"
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      background: '#f9fafb'
                    }}
                  />
                  <button
                    onClick={() => copySecret('MANUAL_SECRET_FROM_QR')}
                    style={{
                      padding: '8px 12px',
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title="Copy secret"
                  >
                    <Copy size={16} />
                  </button>
                </div>
                {copiedSecret && (
                  <p style={{ color: '#10b981', fontSize: '0.8rem', marginTop: '4px' }}>Copied!</p>
                )}
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', color: '#374151', marginBottom: '4px' }}>Verification Code</label>
                <input
                  type="text"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="123456"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    textAlign: 'center',
                    letterSpacing: '4px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', color: '#374151', marginBottom: '4px' }}>Password</label>
                <input
                  type="password"
                  value={passwordFor2FA}
                  onChange={(e) => setPasswordFor2FA(e.target.value)}
                  placeholder="Account password"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.95rem'
                  }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setTwoFactorStep('initial')}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Back
              </button>
              <button
                onClick={handleVerifyAndEnable2FA}
                disabled={twoFactorLoading || verificationCode.length !== 6 || !passwordFor2FA}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: (twoFactorLoading || verificationCode.length !== 6 || !passwordFor2FA) ? '#9ca3af' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: (twoFactorLoading || verificationCode.length !== 6 || !passwordFor2FA) ? 'not-allowed' : 'pointer'
                }}
              >
                {twoFactorLoading ? 'Verifying...' : 'Enable 2FA'}
              </button>
            </div>
          </div>
        )}

        {twoFactorStep === 'backup-codes' && (
          <div className="two-factor-backup-codes" style={{ textAlign: 'center' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: '#10b981',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <CheckCircle size={32} color="white" />
            </div>
            <h4 style={{ marginBottom: '8px', color: '#1f2937' }}>2FA Enabled Successfully!</h4>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>
              Save these backup codes securely. Use them if you lose access to your authenticator app.
            </p>
            <div style={{
              background: '#f8fafc',
              border: '2px solid #e2e8f0',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px'
            }}>
              {backupCodes.map((code, index) => (
                <div key={index} style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '12px',
                  marginBottom: '12px',
                  fontFamily: 'monospace',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  textAlign: 'center'
                }}>
                  {code.split('').map((char, charIndex) => (
                    <span key={charIndex} style={{
                      background: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      padding: '8px 4px',
                      minWidth: '24px'
                    }}>
                      {char}
                    </span>
                  ))}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={downloadBackupCodes}
                style={{
                  padding: '12px 24px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Download size={20} />
                Download Codes
              </button>
              <button
                onClick={closeModal}
                style={{
                  padding: '12px 24px',
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Done
              </button>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '20px' }}>
              Print or save these codes in a safe place. Each code can only be used once.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorTwoFactorAuth;

