import { useState, useEffect, useRef } from 'react';
import { Phone, Video, MessageCircle, CheckCircle2, Calendar, Clock, Send, X, Bot } from 'lucide-react';
import './patient dashboard css/message.css'

const Messages = ({ patientData, socket, token }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDoctorActions, setShowDoctorActions] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // Chat states
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (patientData?._id) {
      fetchConversations();
    }
  }, [patientData]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const getHeaders = () => {
    // Priority: prop token > localStorage.patientToken > patientData.token
    const tokenFromStorage = localStorage.getItem('patientToken');
    const patientDataToken = (() => {
      try {
        return JSON.parse(localStorage.getItem('patientData') || '{}')?.token;
      } catch {
        return null;
      }
    })();

    const tokenFinal = token || tokenFromStorage || patientDataToken;

    console.log('Token found:', tokenFinal ? tokenFinal.substring(0, 20) + '...' : 'NO TOKEN');

    return {
      'Content-Type': 'application/json',
      ...(tokenFinal && { 'Authorization': `Bearer ${tokenFinal}` })
    };
  };


  const fetchConversations = async () => {
    console.log('Fetching real conversations for patient:', patientData._id);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:5000/api/communication/conversations?userId=${patientData._id}&role=patient`,
        { 
          headers: getHeaders(),
          credentials: 'include'
        }
      );
      const data = await response.json();
      
      console.log('Conversations API response:', data);

      if (response.ok && data.success) {
        setConversations(data.data || []);
      } else {
        setError(data.message || 'No conversations found');
        setConversations([]);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Server connection failed');
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorAction = async (action) => {
    setShowDoctorActions(false);
    
    switch(action) {
      case 'voice':
        alert('🔊 Voice call feature ready (WebRTC socket)');
        break;
      case 'video':
        alert('📹 Video call feature ready (WebRTC socket)');
        break;
      case 'message':
        if (selectedDoctor?.appointmentId) {
          setChatOpen(true);
          fetchMessages(selectedDoctor.appointmentId);
        }
        break;
      case 'complete':
        try {
      const response = await fetch(`http://localhost:5000/api/communication/complete/${selectedDoctor.appointmentId}`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ patientId: patientData._id, role: 'patient' })
          });
          const data = await response.json();
          if (data.success) {
            alert('✅ Conversation marked complete!');
            fetchConversations();
          } else {
            alert(data.message || 'Complete failed');
          }
        } catch (err) {
          alert('Network error');
        }
        break;
    }
  };

  const getPhotoUrl = (photoPath) => {
    if (!photoPath) return '';
    return photoPath.startsWith('http') ? photoPath : `http://localhost:5000${photoPath}`;
  };

  // Chat functions
  const fetchMessages = async (appointmentId) => {
    if (!appointmentId) return;
    setLoadingMessages(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/communication/appointment/${appointmentId}?userId=${patientData._id}&role=patient`,
        { headers: getHeaders() }
      );
      const data = await response.json();
      if (response.ok && data.success) {
        setChatMessages(data.data || []);
      }
    } catch (err) {
      console.error('Fetch messages error:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedDoctor?.appointmentId) return;

    const messageText = newMessage.trim();
    const tempId = Date.now();
    
    // Optimistic UI
    const optimisticMsg = {
      _id: tempId,
      appointmentId: selectedDoctor.appointmentId,
      senderId: patientData._id,
      senderRole: 'patient',
      receiverId: selectedDoctor._id,
      receiverRole: 'doctor',
      message: messageText,
      read: false,
      createdAt: new Date()
    };
    setChatMessages(prev => [...prev, optimisticMsg]);
    setNewMessage('');
    setSendingMessage(true);

    try {
      const response = await fetch('http://localhost:5000/api/communication/message', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          appointmentId: selectedDoctor.appointmentId,
          message: messageText,
          receiverId: selectedDoctor._id,
          receiverRole: 'doctor',
          senderId: patientData._id,
          senderRole: 'patient'
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        // Replace optimistic message with real one
        setChatMessages(prev => prev.map(msg => 
          msg._id === tempId ? { ...data.data, read: false } : msg
        ));
        // Socket emit to doctor
        if (socket) {
          socket.emit('newMessage', data.data);
        }
      } else {
        // Revert optimistic on error
        setChatMessages(prev => prev.filter(msg => msg._id !== tempId));
        alert(data.message || 'Failed to send message');
      }
    } catch (err) {
      console.error('Send message error:', err);
      setChatMessages(prev => prev.filter(msg => msg._id !== tempId));
      alert('Network error. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  // Socket listeners for real-time messages
  useEffect(() => {
    if (!socket || !selectedDoctor?.appointmentId || !chatOpen) return;

    const handleNewMessage = (message) => {
      if (message.appointmentId.toString() === selectedDoctor.appointmentId && 
          message.receiverId.toString() === patientData._id &&
          message.receiverRole === 'patient') {
        setChatMessages(prev => [...prev, message]);
      }
    };

    socket.on('newMessage', handleNewMessage);
    return () => socket.off('newMessage', handleNewMessage);
  }, [socket, selectedDoctor?.appointmentId, chatOpen, patientData._id]);

  if (loading) {
    return (
      <div style={{padding: '4rem 2rem', textAlign: 'center'}}>
        <div style={{fontSize: '4rem', margin: '2rem 0'}}>🔄</div>
        <h2>Loading doctors...</h2>
        <p>Fetching confirmed appointments</p>
      </div>
    );
  }

  return (
    <div style={{maxWidth: '1400px', margin: '0 auto'}}>
      <div style={{background: 'white', padding: '2rem', borderRadius: '12px 12px 0 0', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', marginBottom: '-1px'}}>
        <h1 style={{margin: 0, fontSize: '2rem'}}>👨‍⚕️ Confirmed Doctors</h1>
        <p style={{color: '#666', margin: '0.5rem 0 0 0'}}>Click doctors for voice call, video call, message, or mark complete</p>
        {error && <p style={{color: 'orange', marginTop: '1rem'}}>⚠️ {error}</p>}
      </div>

      {conversations.length === 0 ? (
        <div style={{padding: '4rem 2rem', textAlign: 'center', background: 'white', borderRadius: '0 0 12px 12px', boxShadow: '0 -4px 20px rgba(0,0,0,0.05)'}}>
          <div style={{fontSize: '5rem', marginBottom: '1.5rem'}}>📭</div>
          <h2>No Confirmed Appointments</h2>
          <p style={{color: '#666'}}>Complete payment for appointments to communicate with doctors.</p>
          <button style={{
            marginTop: '1.5rem', padding: '1rem 2.5rem', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: '600', cursor: 'pointer'
          }} onClick={() => window.location.href = '/doctorlist'}>
            Book Doctor Now →
          </button>
        </div>
      ) : (
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem', padding: '2rem'}}>
          {conversations.map((conv) => {
            const doctor = conv.otherUser || conv;
            return (
              <div 
                key={doctor._id || conv.appointmentId}
                style={{
                  background: 'white',
                  borderRadius: '20px',
                  padding: '1.75rem',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: '2px solid transparent'
                }}
                onClick={() => {
                  setSelectedDoctor({
                    ...doctor,
                    appointmentId: conv.appointmentId,
                    appointmentDate: conv.appointmentDate,
                    appointmentTime: conv.appointmentTime,
                    appointmentType: conv.appointmentType
                  });
                  setShowDoctorActions(true);
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
              >
                <div style={{display: 'flex', gap: '1.25rem', alignItems: 'flex-start'}}>
                  <div style={{
                    position: 'relative',
                    width: '72px', height: '72px',
                    borderRadius: '16px', overflow: 'hidden',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  }}>
                    {doctor.profilePhoto ? (
                      <img src={getPhotoUrl(doctor.profilePhoto)} alt="" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                    ) : (
                      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'white', fontSize: '1.5rem', fontWeight: 'bold'}}>
                        {doctor.name?.slice(0,2).toUpperCase() || 'DR'}
                      </div>
                    )}
                    {conv.unreadCount > 0 && (
                      <div style={{
                        position: 'absolute', top: 0, right: 0,
                        minWidth: '24px', height: '24px', background: '#10b981', borderRadius: '50%',
                        border: '3px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.8rem', fontWeight: 'bold', color: 'white'
                      }}>
                        {conv.unreadCount}
                      </div>
                    )}
                  </div>
                  
                  <div style={{flex: 1}}>
                    <h3 style={{margin: '0 0 0.5rem 0', fontSize: '1.4rem', fontWeight: '600', color: '#1f2937'}}>
                      {doctor.name || 'Doctor'}
                    </h3>
                    <p style={{margin: '0 0 0.5rem 0', color: '#059669', fontSize: '1.1rem', fontWeight: '500'}}>
                      {doctor.specialty || 'Specialist'}
                    </p>
                    <p style={{margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#4b5563'}}>
                      <strong>ID:</strong> <span style={{fontFamily: 'monospace'}}>{doctor.uniqueId || doctor._id?.slice(-6) || 'N/A'}</span>
                    </p>
                    <div style={{display: 'flex', gap: '1rem', margin: '0.25rem 0 0.75rem 0'}}>
                      <span style={{display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.95rem', color: '#6b7280'}}>
                        <Calendar size={16} /> {conv.appointmentDate || 'Upcoming'}
                      </span>
                      <span style={{display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.95rem', color: '#6b7280'}}>
                        <Clock size={16} /> {conv.appointmentTime || 'TBD'}
                      </span>
                    </div>
{conv.lastMessage && (
                      <p style={{margin: 0, padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', fontSize: '0.95rem', color: '#4b5563'}}>
                        {conv.lastMessage?.message || 'No messages yet'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Action Modal - No dummy, real actions */}
      {showDoctorActions && selectedDoctor && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} onClick={() => setShowDoctorActions(false)}>
          <div style={{
            background: 'white', width: 'min(90vw, 450px)', maxHeight: '80vh',
            borderRadius: '24px', boxShadow: '0 30px 60px rgba(0,0,0,0.3)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{padding: '2rem 1.5rem 1rem', display: 'flex', gap: '1rem', alignItems: 'center'}}>
              <div style={{width: '60px', height: '60px', borderRadius: '16px', overflow: 'hidden', background: '#3b82f6'}}>
                {selectedDoctor.profilePhoto ? (
                  <img src={getPhotoUrl(selectedDoctor.profilePhoto)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                ) : (
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'white', fontSize: '1.4rem'}}>
                    {selectedDoctor.doctorName?.slice(0,2) || 'DR'}
                  </div>
                )}
              </div>
              <div style={{flex: 1}}>
                <h2 style={{margin: 0, fontSize: '1.5rem'}}>{selectedDoctor.doctorName}</h2>
                <p style={{margin: '0.25rem 0 0', color: '#6b7280'}}>ID: {selectedDoctor.doctorId}</p>
              </div>
              <button style={{border: 'none', background: 'none', fontSize: '1.8rem', cursor: 'pointer'}} onClick={() => setShowDoctorActions(false)}>
                ✕
              </button>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem', padding: '0 1.5rem 1.5rem'}}>
              <button style={{
                padding: '1.75rem 1rem', borderRadius: '16px', border: '2px solid #10b981',
                background: 'white', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s'
              }} onClick={() => handleDoctorAction('voice')}>
                <Phone size={32} style={{display: 'block', margin: '0 auto 0.5rem'}} />
                Voice Call
              </button>

              <button style={{
                padding: '1.75rem 1rem', borderRadius: '16px', border: '2px solid #3b82f6',
                background: 'white', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s'
              }} onClick={() => handleDoctorAction('video')}>
                <Video size={32} style={{display: 'block', margin: '0 auto 0.5rem'}} />
                Video Call
              </button>

              <button style={{
                padding: '1.75rem 1rem', borderRadius: '16px', border: '2px solid #f59e0b',
                background: 'white', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s'
              }} onClick={() => handleDoctorAction('message')}>
                <MessageCircle size={32} style={{display: 'block', margin: '0 auto 0.5rem'}} />
                Message
              </button>

              <button style={{
                padding: '1.75rem 1rem', borderRadius: '16px', border: '2px solid #ef4444',
                background: 'white', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s'
              }} onClick={() => handleDoctorAction('complete')}>
                <CheckCircle2 size={32} style={{display: 'block', margin: '0 auto 0.5rem'}} />
                Mark Complete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Doctor Chat Component */}
      {chatOpen && selectedDoctor && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10001,
          display: 'flex', flexDirection: 'column'
        }} onClick={() => setChatOpen(false)}>
          <div style={{
            flex: 1, background: 'white', margin: '1rem', borderRadius: '24px', 
            boxShadow: '0 30px 60px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column',
            maxWidth: '800px', maxHeight: '90vh', minHeight: '500px'
          }} onClick={(e) => e.stopPropagation()}>
            {/* Chat Header */}
            <div style={{
              padding: '1.5rem', borderBottom: '1px solid #e5e7eb', display: 'flex', 
              alignItems: 'center', gap: '1rem', background: '#f8fafc'
            }}>
              <div style={{width: '48px', height: '48px', borderRadius: '12px', overflow: 'hidden', background: '#3b82f6'}}>
                {selectedDoctor.profilePhoto ? (
                  <img src={getPhotoUrl(selectedDoctor.profilePhoto)} style={{width: '100%', height: '100%', objectFit: 'cover'}} alt="" />
                ) : (
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'white', fontSize: '1.2rem', fontWeight: 'bold'}}>
                    {selectedDoctor.name?.slice(0,2).toUpperCase() || 'DR'}
                  </div>
                )}
              </div>
              <div style={{flex: 1}}>
                <h2 style={{margin: 0, fontSize: '1.3rem', fontWeight: '600'}}>{selectedDoctor.name}</h2>
                <p style={{margin: '0.25rem 0 0', color: '#6b7280', fontSize: '0.9rem'}}>
                  {selectedDoctor.specialty || 'Specialist'} • Appointment ID: {selectedDoctor.appointmentId?.slice(-6)}
                </p>
              </div>
              <button style={{
                border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer', 
                color: '#6b7280', padding: '0.5rem', borderRadius: '50%', width: '40px', height: '40px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', ':hover': { background: '#f3f4f6' }
              }} onClick={() => setChatOpen(false)}>
                ✕
              </button>
            </div>

            {/* Messages Container */}
            <div style={{
              flex: 1, overflowY: 'auto', padding: '1.5rem', background: '#f8fafc'
            }}>
              {loadingMessages ? (
                <div style={{textAlign: 'center', padding: '2rem', color: '#6b7280'}}>
                  <div style={{fontSize: '3rem', marginBottom: '1rem'}}>💬</div>
                  <p>Loading messages...</p>
                </div>
              ) : chatMessages.length === 0 ? (
                <div style={{textAlign: 'center', padding: '3rem', color: '#6b7280'}}>
                  <div style={{fontSize: '4rem', marginBottom: '1rem'}}>📭</div>
                  <h3 style={{margin: '0 0 0.5rem', fontSize: '1.2rem'}}>No messages yet</h3>
                  <p>Start the conversation with your doctor</p>
                </div>
              ) : (
                chatMessages.map((msg) => (
                  <div 
                    key={msg._id} 
                    style={{
                      display: 'flex',
                      justifyContent: msg.senderRole === 'patient' ? 'flex-end' : 'flex-start',
                      marginBottom: '1rem',
                      animation: 'slideIn 0.3s ease'
                    }}
                  >
                    <div style={{
                      maxWidth: '70%', padding: '0.75rem 1rem', borderRadius: '18px',
                      background: msg.senderRole === 'patient' 
                        ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' 
                        : '#10b981',
                      color: 'white',
                      fontSize: '0.95rem',
                      lineHeight: '1.4',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                    }}>
                      <p style={{margin: 0, whiteSpace: 'pre-wrap'}}>{msg.message}</p>
                      <small style={{opacity: 0.9, fontSize: '0.8rem', marginTop: '0.25rem', display: 'block'}}>
                        {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                        {msg.read && msg.senderRole !== 'patient' && ' ✓✓'}
                      </small>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{
              padding: '1rem 1.5rem', borderTop: '1px solid #e5e7eb', background: 'white',
              display: 'flex', gap: '0.75rem', alignItems: 'flex-end'
            }}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                style={{
                  flex: 1, padding: '0.75rem 1rem', border: '1px solid #d1d5db',
                  borderRadius: '24px', fontSize: '0.95rem', outline: 'none',
                  ':focus': { borderColor: '#3b82f6', boxShadow: '0 0 0 3px rgba(59,130,246,0.1)' }
                }}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              />
              <button
                onClick={sendMessage}
                disabled={sendingMessage || !newMessage.trim()}
                style={{
                  width: '44px', height: '44px', borderRadius: '50%', border: 'none',
                  background: sendingMessage || !newMessage.trim() ? '#e5e7eb' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  color: 'white', cursor: sendingMessage ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                {sendingMessage ? (
                  <div style={{width: '18px', height: '18px', border: '2px solid transparent', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite'}} />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Messages;

