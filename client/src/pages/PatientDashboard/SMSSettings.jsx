import React, { useState, useEffect } from 'react';
import { MessageSquare, Check, X, Phone, Bell, CreditCard, Calendar, RefreshCw, Shield } from 'lucide-react';

function SMSSettings({ patientData }) {
  const [settings, setSettings] = useState({
    smsNotifications: true,
    smsNotificationSettings: {
      appointmentBooking: true,
      paymentConfirmation: true,
      appointmentConfirmation: true,
      appointmentCancellation: true,
      refundNotifications: true,
      twoFactorAuth: true
    }
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(function() {
    if (patientData && patientData._id) {
      fetchSMSSettings();
    }
  }, [patientData && patientData._id]);

  function fetchSMSSettings() {
    fetch('http://localhost:5000/api/patients/sms-settings/' + patientData._id)
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (data.success) {
          setSettings({
            smsNotifications: data.smsNotifications,
            smsNotificationSettings: data.smsNotificationSettings
          });
        }
      })
      .catch(function(err) { console.error('Error fetching SMS settings:', err); });
  }

  function handleToggle(key) {
    if (key === 'smsNotifications') {
      setSettings(function(prev) { return Object.assign({}, prev, { smsNotifications: !prev.smsNotifications }); });
    } else {
      setSettings(function(prev) { 
        return Object.assign({}, prev, { 
          smsNotificationSettings: Object.assign({}, prev.smsNotificationSettings, { [key]: !prev.smsNotificationSettings[key] }) 
        }); 
      });
    }
  }

  function saveSettings() {
    setLoading(true);
    setError('');
    setSuccess('');
    
    fetch('http://localhost:5000/api/patients/sms-settings/' + patientData._id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (data.success) {
          setSuccess('SMS notification settings saved successfully!');
          setTimeout(function() { setSuccess(''); }, 3000);
        } else {
          setError(data.message || 'Failed to save settings');
        }
      })
      .catch(function() { setError('Failed to save settings'); })
      .finally(function() { setLoading(false); });
  }

  var sectionStyle = { 
    background: 'white', 
    borderRadius: 12, 
    padding: 24, 
    marginBottom: 20, 
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)' 
  };
  var h3Style = { 
    display: 'flex', 
    alignItems: 'center', 
    gap: 10, 
    fontSize: '1.1rem', 
    marginBottom: 16, 
    color: '#374151' 
  };
  var toggleStyle = function(isActive) { return {
    width: 48, 
    height: 26, 
    background: isActive ? '#10b981' : '#d1d5db', 
    borderRadius: 13, 
    position: 'relative', 
    cursor: 'pointer',
    transition: 'background 0.2s'
  }; };
  var toggleKnobStyle = function(isActive) { return {
    width: 22, 
    height: 22, 
    background: 'white', 
    borderRadius: '50%', 
    position: 'absolute', 
    top: 2, 
    left: isActive ? 24 : 2, 
    transition: 'transform 0.2s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
  }; };

  var notificationItems = [
    { key: 'appointmentBooking', label: 'Appointment Booking', icon: Calendar, desc: 'Get SMS when you book an appointment' },
    { key: 'paymentConfirmation', label: 'Payment Confirmation', icon: CreditCard, desc: 'Get SMS when payment is successful' },
    { key: 'appointmentConfirmation', label: 'Appointment Confirmation', icon: Check, desc: 'Get SMS when appointment is confirmed by doctor' },
    { key: 'appointmentCancellation', label: 'Appointment Cancellation', icon: X, desc: 'Get SMS when appointment is cancelled' },
    { key: 'refundNotifications', label: 'Refund Notifications', icon: RefreshCw, desc: 'Get SMS when refund is initiated' },
    { key: 'twoFactorAuth', label: '2FA Status Changes', icon: Shield, desc: 'Get SMS when 2FA is enabled or disabled' }
  ];

  return React.createElement('div', { style: sectionStyle },
    React.createElement('h3', { style: h3Style },
      React.createElement(MessageSquare, { size: 20 }), 
      ' SMS Notifications'
    ),
    
    // Main SMS Toggle
    React.createElement('div', { 
      style: { 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: 16, 
        background: '#f9fafb', 
        borderRadius: 8, 
        marginBottom: 20 
      } 
    },
      React.createElement('div', null,
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
          React.createElement(Bell, { size: 18, color: '#10b981' }),
          React.createElement('span', { style: { fontWeight: 600, color: '#1f2937' } }, 'Enable SMS Notifications')
        ),
        React.createElement('p', { style: { color: '#6b7280', fontSize: '0.875rem', marginTop: 4 } },
          'Receive important updates via SMS on your phone'
        )
      ),
      React.createElement('div', {
        onClick: function() { handleToggle('smsNotifications'); },
        style: toggleStyle(settings.smsNotifications)
      },
        React.createElement('div', { style: toggleKnobStyle(settings.smsNotifications) })
      )
    ),

    // Individual Notification Settings
    settings.smsNotifications && React.createElement('div', null,
      React.createElement('p', { style: { fontSize: '0.875rem', color: '#6b7280', marginBottom: 16 } },
        'Customize which notifications you want to receive:'
      ),
      notificationItems.map(function(item) {
        return React.createElement('div', { 
          key: item.key, 
          style: { 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: 12, 
            borderRadius: 8, 
            background: '#f9fafb', 
            marginBottom: 8 
          } 
        },
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12 } },
            React.createElement(item.icon, { size: 18, color: '#6b7280' }),
            React.createElement('div', null,
              React.createElement('span', { style: { fontWeight: 500, color: '#374151' } }, item.label),
              React.createElement('p', { style: { color: '#9ca3af', fontSize: '0.75rem', margin: 0 } }, item.desc)
            )
          ),
          React.createElement('div', {
            onClick: function() { handleToggle(item.key); },
            style: toggleStyle(settings.smsNotificationSettings[item.key])
          },
            React.createElement('div', { style: toggleKnobStyle(settings.smsNotificationSettings[item.key]) })
          )
        );
      })
    ),

    // Success/Error Messages
    success && React.createElement('div', { 
      style: { 
        background: '#d1fae5', 
        color: '#065f46', 
        padding: '12px 16px', 
        borderRadius: 8, 
        marginTop: 16,
        fontSize: '0.875rem',
        display: 'flex',
        alignItems: 'center',
        gap: 8
      } 
    },
      React.createElement(Check, { size: 16 }),
      success
    ),
    error && React.createElement('div', { 
      style: { 
        background: '#fee2e2', 
        color: '#991b1b', 
        padding: '12px 16px', 
        borderRadius: 8, 
        marginTop: 16,
        fontSize: '0.875rem'
      } 
    },
      error
    ),

    // Save Button
    React.createElement('button', {
      onClick: saveSettings,
      disabled: loading,
      style: { 
        width: '100%', 
        padding: 12, 
        background: loading ? '#93c5fd' : '#10b981', 
        color: 'white', 
        border: 'none', 
        borderRadius: 8, 
        fontSize: '1rem', 
        fontWeight: 500, 
        cursor: loading ? 'not-allowed' : 'pointer',
        marginTop: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8
      }
    }, loading ? 'Saving...' : 'Save SMS Settings')
  );
}

export default SMSSettings;

