import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageSquare, Send, X, Video, Phone, Calendar, Clock, User, MapPin, List, CheckCircle } from 'lucide-react';

// CSS removed: call-styles.css for dashboard task\nimport '../../call-styles.css';

const Communication = ({ doctorData, socket }) => {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showConversations, setShowConversations] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const messagesEndRef = useRef(null);


  // Call related states (matching patient side)
  const [incomingCall, setIncomingCall] = useState(null);
  const [outgoingCall, setOutgoingCall] = useState(null);
  const [callStatus, setCallStatus] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const peerConnectionRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const isVideoCallRef = useRef(false);
  const localStreamRef = useRef(null);

  useEffect(() => {
    if (doctorData?._id) {
      fetchConversations();
    }
  }, [doctorData]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.appointmentId);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Socket listeners for calls (matching patient side, doctor role)
  useEffect(() => {
    if (!socket || !doctorData) return;

    socket.emit('register', doctorData._id);

    const handleIncomingCall = (data) => {
      console.log('Doctor incoming call:', data);
      setIncomingCall(data);
      setCallStatus('ringing');
      setIsVideoCall(data.callType === 'video');
      isVideoCallRef.current = data.callType === 'video';
    };

    const handleCallAccepted = async (data) => {
      console.log('Call accepted by patient:', data);
      setCallStatus('connected');
      setOutgoingCall(prev => ({ ...prev, socketId: data.socketId }));

      let pc = peerConnectionRef.current;
      if (!pc) pc = initializePeerConnection();

      const stream = localStreamRef.current;
      if (stream && pc.getSenders().length === 0) {
        stream.getTracks().forEach(track => pc.addTrack(track, stream));
      }

      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: isVideoCallRef.current
      });
      await pc.setLocalDescription(offer);
      
      socket.emit('sdp-offer', {
        sdp: offer,
        targetSocketId: data.socketId
      });
    };

    const handleCallRejected = () => {
      alert('Call was rejected');
      endCall();
    };

    const handleCallEnded = () => endCall();

    const handleUserNotOnline = (data) => {
      alert(`${data.receiverId} is not online.`);
      endCall();
    };

    const handleSdpOffer = async (data) => {
      let pc = peerConnectionRef.current;
      if (!pc) {
        pc = initializePeerConnection();
        const stream = localStreamRef.current;
        if (stream) stream.getTracks().forEach(track => pc.addTrack(track, stream));
      }

      await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
      const answer = await pc.createAnswer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: isVideoCallRef.current
      });
      await pc.setLocalDescription(answer);

      socket.emit('sdp-answer', {
        sdp: answer,
        targetSocketId: data.fromSocketId
      });
      setCallStatus('connected');
    };

    const handleSdpAnswer = async (data) => {
      if (peerConnectionRef.current && peerConnectionRef.current.signalingState === 'have-local-offer') {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
      }
    };

    const handleIceCandidate = async (data) => {
      if (peerConnectionRef.current && data.candidate) {
        await peerConnectionRef.current.addIceCandidate(data.candidate);
      }
    };

    socket.on('incoming-call', handleIncomingCall);
    socket.on('call-accepted', handleCallAccepted);
    socket.on('call-rejected', handleCallRejected);
    socket.on('call-ended', handleCallEnded);
    socket.on('user-not-online', handleUserNotOnline);
    socket.on('sdp-offer', handleSdpOffer);
    socket.on('sdp-answer', handleSdpAnswer);
    socket.on('ice-candidate', handleIceCandidate);

    return () => {
      socket.off('incoming-call', handleIncomingCall);
      socket.off('call-accepted', handleCallAccepted);
      socket.off('call-rejected', handleCallRejected);
      socket.off('call-ended', handleCallEnded);
      socket.off('user-not-online', handleUserNotOnline);
      socket.off('sdp-offer', handleSdpOffer);
      socket.off('sdp-answer', handleSdpAnswer);
      socket.off('ice-candidate', handleIceCandidate);
    };
  }, [socket, doctorData]);

  useEffect(() => {
    if (remoteStream && remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = remoteStream;
      remoteAudioRef.current.play().catch(err => console.error('Error playing remote audio:', err));
    }
  }, [remoteStream]);

  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  const initializePeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });
    
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        const targetSocketId = outgoingCall?.socketId || incomingCall?.socketId;
        if (targetSocketId && socket) {
          socket.emit('ice-candidate', { candidate: event.candidate, targetSocketId });
        }
      }
    };
    
    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = event.streams[0];
        remoteAudioRef.current.volume = 1;
        remoteAudioRef.current.muted = false;
        remoteAudioRef.current.play().catch(err => console.error('Error playing remote audio:', err));
      }
    };
    
    peerConnectionRef.current = pc;
    return pc;
  }, [socket]);

  const handleVoiceCall = async () => {
    if (!selectedConversation) return;
    
    setIsVideoCall(false);
    isVideoCallRef.current = false;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      setLocalStream(stream);
      localStreamRef.current = stream;
      
      setOutgoingCall({
        appointmentId: selectedConversation.appointmentId,
        callerId: doctorData._id,
        callerName: doctorData.name,
        callerRole: 'doctor',
        receiverId: selectedConversation.otherUser._id,
        callType: 'audio'
      });
      setCallStatus('calling');
      socket.emit('call-user', {
        callerId: doctorData._id,
        callerName: doctorData.name,
        callerRole: 'doctor',
        receiverId: selectedConversation.otherUser._id,
        callType: 'audio',
        appointmentId: selectedConversation.appointmentId
      });
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone.');
      setCallStatus(null);
      setOutgoingCall(null);
    }
  };

  const handleVideoCall = async () => {
    if (!selectedConversation) return;
    
    setIsVideoCall(true);
    isVideoCallRef.current = true;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      setLocalStream(stream);
      localStreamRef.current = stream;
      
      setOutgoingCall({
        appointmentId: selectedConversation.appointmentId,
        callerId: doctorData._id,
        callerName: doctorData.name,
        callerRole: 'doctor',
        receiverId: selectedConversation.otherUser._id,
        callType: 'video'
      });
      setCallStatus('calling');
      socket.emit('call-user', {
        callerId: doctorData._id,
        callerName: doctorData.name,
        callerRole: 'doctor',
        receiverId: selectedConversation.otherUser._id,
        callType: 'video',
        appointmentId: selectedConversation.appointmentId
      });
    } catch (error) {
      console.error('Error accessing camera/microphone:', error);
      alert('Could not access camera/microphone.');
      setCallStatus(null);
      setOutgoingCall(null);
    }
  };

  const acceptCall = async () => {
    if (!incomingCall) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: incomingCall.callType === 'video' 
      });
      setLocalStream(stream);
      localStreamRef.current = stream;
      setIsVideoCall(incomingCall.callType === 'video');
      isVideoCallRef.current = incomingCall.callType === 'video';
      
      const pc = initializePeerConnection();
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
      
      socket.emit('accept-call', { 
        callerSocketId: incomingCall.socketId, 
        receiverId: doctorData._id, 
        appointmentId: incomingCall.appointmentId 
      });
      
      setCallStatus('connecting');
    } catch (error) {
      console.error('Error accepting call:', error);
      rejectCall();
    }
  };

  const rejectCall = () => {
    if (incomingCall) {
      socket.emit('reject-call', { 
        callerSocketId: incomingCall.socketId, 
        receiverId: doctorData._id 
      });
    }
    setIncomingCall(null);
    setCallStatus(null);
  };

  const toggleMute = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      audioTracks.forEach(track => track.enabled = isMuted);
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      videoTracks.forEach(track => track.enabled = !isVideoEnabled);
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  const endCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
      localStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    setRemoteStream(null);
    setCallStatus(null);
    setIncomingCall(null);
    setOutgoingCall(null);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('doctorToken');
    if (!token) {
      alert('Doctor token missing. Please login again.');
      return { 'Content-Type': 'application/json' };
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const handleComplete = async () => {
    if (!selectedConversation) return;

    if (!confirm(`Complete consultation with ${selectedConversation.otherUser?.name}? This will mark the appointment as completed and remove it from your list.`)) {
      return;
    }

    setCompleting(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/communication/complete/${selectedConversation.appointmentId}`,
        {
          method: 'POST',
          headers: getAuthHeaders()
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccessMessage('Consultation completed successfully!');
        setSelectedConversation(null);
        fetchConversations(); // Refresh list
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        alert(data.message || 'Failed to complete consultation');
      }
    } catch (error) {
      console.error('Error completing consultation:', error);
      alert('Error completing consultation. Please try again.');
    } finally {
      setCompleting(false);
    }
  };


  const fetchConversations = async () => {
    try {
      setLoading(true);
      console.log('Fetching conversations for doctor:', doctorData._id);
      const response = await fetch(
        `http://localhost:5000/api/communication/conversations?userId=${doctorData._id}&role=doctor`,
        { headers: getAuthHeaders() }
      );
      const data = await response.json();
      console.log('Conversations response:', data);

      if (response.ok && data.success) {
        setConversations(data.data || []);
      } else if (!response.ok) {
        console.error('Conversations API failed:', data.message || response.statusText);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (appointmentId) => {
    try {
      console.log('Fetching messages for appointment:', appointmentId);
      const response = await fetch(
        `http://localhost:5000/api/communication/appointment/${appointmentId}?userId=${doctorData._id}&role=doctor`,
        { headers: getAuthHeaders() }
      );
      const data = await response.json();
      console.log('Messages response:', data);

      if (response.ok && data.success) {
        setMessages(data.data || []);
      } else {
        console.error('Messages API failed:', data.message || response.statusText);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    setSending(true);
    try {
      const response = await fetch('http://localhost:5000/api/communication/message', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          appointmentId: selectedConversation.appointmentId,
          message: newMessage,
          senderId: doctorData._id,
          senderRole: 'doctor',
          receiverId: selectedConversation.otherUser._id,
          receiverRole: 'patient',
        }),
      });

      const data = await response.json();
      console.log('Send message response:', data);

      if (response.ok && data.success) {
        setMessages([...messages, data.data]);
        setNewMessage('');
        fetchConversations();
      } else {
        const errMsg = data?.message || response.statusText || 'Failed to send message';
        console.error('Send message failed:', errMsg, data);
        alert(`Send failed: ${errMsg}`);
        console.log('Server error payload:', data);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getPatientInitials = (name) => {
    if (!name) return 'Pt';
    const parts = name.split(' ');
    return parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : parts[0][0];
  };

  if (loading) {
    return (
      <div className="dashboard-home">
        <div className="communication-container">
          <div className="loading-container">Loading conversations...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-home">
      <div className="communication-container">
        <div className="section-header">
          <h2>Communication</h2>
          <p>Connect with patients - Chat, Voice Call, Video Call</p>
        </div>

        {conversations.length === 0 ? (
          <div className="no-messages">
            <div className="no-messages-icon">💬</div>
            <h3>No Conversations</h3>
            <p>Confirmed appointments will appear here for communication</p>
          </div>
        ) : (
          <div className="communication-layout">
            <div className="conversations-list">
              <div className="conversations-list-header">
                <h3>Conversations ({conversations.length})</h3>
              </div>
              <div className="conversations-scroll">
                {conversations.map((conv) => (
                  <div
                    key={conv.appointmentId}
                    className={`conversation-item ${selectedConversation?.appointmentId === conv.appointmentId ? 'active' : ''} ${conv.unreadCount > 0 ? 'unread' : ''}`}
                    onClick={() => setSelectedConversation(conv)}
                  >
                    <div className="conversation-avatar">
                      {conv.otherUser?.profilePhoto ? (
                        <img 
                          src={conv.otherUser.profilePhoto.startsWith('http') 
                            ? conv.otherUser.profilePhoto 
                            : `http://localhost:5000${conv.otherUser.profilePhoto}`} 
                          alt={conv.otherUser?.name} 
                        />
                      ) : (
                        <span>{getPatientInitials(conv.otherUser?.name)}</span>
                      )}
                      {conv.unreadCount > 0 && <span className="unread-badge"></span>}
                    </div>
                      <div className="conversation-info">
                        <div className="conversation-header-row">
                          <h4>{conv.otherUser?.name || 'Patient'}</h4>
                          <small>ID: {conv.otherUser?._id?.slice(-6) || 'N/A'}</small>
                          {conv.lastMessage && <span className="conversation-time">{formatDate(conv.lastMessage.time)}</span>}
                        </div>
                        <p className="conversation-specialty">
                          {conv.otherUser?.email || 'Patient'} • {conv.appointmentDate}
                        </p>

                      {conv.lastMessage && (
                        <p className="conversation-preview">
                          {conv.lastMessage.senderRole === 'doctor' ? 'You: ' : ''}
                          {conv.lastMessage.message.substring(0, 30)}{conv.lastMessage.message.length > 30 ? '...' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="chat-area">
              {selectedConversation ? (
                <>
                  <div className="chat-header">
                    <button 
                      className="header-action-btn toggle-conversations-btn" 
                      onClick={() => setShowConversations(!showConversations)}
                      title={showConversations ? "Hide Conversations" : "Show Conversations"}
                    >
                      <List size={18} />
                    </button>
                    <div className="chat-doctor-info">
                      <div className="chat-avatar-small">
                        {selectedConversation.otherUser?.profilePhoto ? (
                          <img 
                            src={selectedConversation.otherUser.profilePhoto.startsWith('http') 
                              ? selectedConversation.otherUser.profilePhoto 
                              : `http://localhost:5000${selectedConversation.otherUser.profilePhoto}`} 
                            alt={selectedConversation.otherUser?.name} 
                          />
                        ) : (
                          <span>{getPatientInitials(selectedConversation.otherUser?.name)}</span>
                        )}
                      </div>
                      <div>
                        <h3>{selectedConversation.otherUser?.name || 'Patient'}</h3>
                        <p>ID: {selectedConversation.otherUser?._id?.slice(-6) || 'N/A'}</p>
                        <p>{selectedConversation.otherUser?.email || 'Patient'}</p>
                      </div>

                    </div>
                    <div className="chat-actions-header">
                      <button className="header-action-btn" onClick={handleVoiceCall} title="Voice Call">
                        <Phone size={18} />
                      </button>
                      <button className="header-action-btn" onClick={handleVideoCall} title="Video Call">
                        <Video size={18} />
                      </button>
                      <button className="header-action-btn complete-btn" onClick={handleComplete} title="Complete Consultation">
                        <CheckCircle size={18} />
                      </button>
                      <button className="header-action-btn" onClick={() => setSelectedConversation(null)}>
                        <X size={18} />
                      </button>
                    </div>

                  </div>

                  <div className="appointment-details-bar">
                    <div className="appointment-type-badge">
                      {selectedConversation.appointmentType === 'online' ? (
                        <span className="type-badge video"><Video size={14} /> Video Consultation</span>
                      ) : (
                        <span className="type-badge clinic"><MapPin size={14} /> Clinic Visit</span>
                      )}
                    </div>
                    <div className="appointment-datetime">
                      <span className="appointment-date"><Calendar size={14} /> {selectedConversation.appointmentDate}</span>
                      <span className="appointment-time"><Clock size={14} /> {selectedConversation.appointmentTime}</span>
                    </div>
                  </div>

                  <div className="chat-messages">
                    {messages.length === 0 ? (
                      <div className="no-chat-messages">
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      messages.map((msg, index) => (
                        <div
                          key={msg._id || index}
                          className={`message-bubble ${msg.senderRole === 'doctor' ? 'sent' : 'received'}`}
                        >
                          <div className="message-content">
                            <p>{msg.message}</p>
                            <span className="message-time">{formatTime(msg.createdAt)}</span>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <form className="chat-input-area" onSubmit={sendMessage}>
                    <textarea
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      rows="1"
                    />
                    <button type="submit" className="btn-send" disabled={sending || !newMessage.trim()}>
                      <Send size={20} />
                    </button>
                  </form>
                </>
              ) : (
                <div className="no-chat-selected">
                  <div className="no-chat-icon">💬</div>
                  <h3>Select a conversation</h3>
                  <p>Choose a conversation from the list to start messaging</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Call UI Components (matching patient side) */}
        {incomingCall && callStatus === 'ringing' && (
          <div className="incoming-call-overlay">
            <div className="incoming-call-popup">
              <div className="incoming-call-icon">{isVideoCall ? '📹' : '📞'}</div>
              <h3>Incoming {isVideoCall ? 'Video ' : ''}Call</h3>
              <p>{incomingCall.callerName} is calling you</p>
              <div className="incoming-call-actions">
                <button className="accept-call-btn" onClick={acceptCall}>Accept</button>
                <button className="reject-call-btn" onClick={rejectCall}>Reject</button>
              </div>
            </div>
          </div>
        )}

        {outgoingCall && callStatus === 'calling' && (
          <div className="call-screen-overlay">
            <div className="call-screen">
              <div className="call-screen-info">
                <div className="call-screen-avatar">{outgoingCall.callType === 'video' ? '📹' : '📞'}</div>
                <h3>Calling...</h3>
                <p>Connecting to {outgoingCall.receiverId}</p>
              </div>
              <button className="end-call-btn" onClick={endCall}>End Call</button>
            </div>
          </div>
        )}

        {callStatus === 'connected' && (
          <div className="call-screen-overlay">
            <div className="call-screen active-call">
              <div className="call-screen-header">
                <h3>{incomingCall ? incomingCall.callerName : outgoingCall?.receiverId}</h3>
                <p>{isVideoCall ? 'Video Call' : 'Voice Call'} - Connected</p>
              </div>
              {isVideoCall && (
                <div className="video-call-container">
                  <video ref={remoteVideoRef} autoPlay playsInline className="remote-video" />
                  <video ref={localVideoRef} autoPlay muted playsInline className="local-video" />
                </div>
              )}
              {!isVideoCall && (
                <>
                  <audio ref={remoteAudioRef} autoPlay playsInline style={{ display: 'none' }} />
                  <div className="audio-call-visual">
                    <div className="audio-avatar-large">
                      {incomingCall ? incomingCall.callerName?.charAt(0) : outgoingCall?.receiverId?.charAt(0) || 'P'}
                    </div>
                    <p>{outgoingCall?.receiverId || incomingCall?.callerId}</p>
                  </div>
                </>
              )}
              <div className="call-controls">
                <button
                  className={`call-control-btn mute-btn ${isMuted ? 'muted' : ''}`}
                  onClick={toggleMute}
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? '🔇' : '🎤'}
                </button>
                {isVideoCall && (
                  <button
                    className={`call-control-btn video-toggle-btn ${!isVideoEnabled ? 'disabled' : ''}`}
                    onClick={toggleVideo}
                    title={isVideoEnabled ? 'Turn off video' : 'Turn on video'}
                  >
                    {isVideoEnabled ? '📹' : '📷'}
                  </button>
                )}
                <button className="call-control-btn end-call-large-btn" onClick={endCall} title="End Call">
                  📞
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Communication;

