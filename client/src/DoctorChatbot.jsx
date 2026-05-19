import { useState, useEffect, useRef } from 'react';
import { Send, X, Bot, Sparkles } from 'lucide-react';

const featureDetails = {
  dashboard: {
    name: 'Dashboard',
    fullDetails: "DASHBOARD - Your Practice Overview\n\nWhat is it?\nThe Dashboard is your main homepage on the MediConnect doctor portal. It provides a comprehensive overview of your practice activities and upcoming appointments.\n\nHow it works:\n1. Shows appointment statistics (total, completed, cancelled, pending)\n2. Displays upcoming appointments for the next 7 days\n3. Provides quick stats: total patients, today's appointments, pending confirmations, total earnings\n4. Visual charts showing appointment trends over time\n5. Practice analysis with monthly trends and status distribution\n\nHow to access:\nClick on 'Dashboard' in the left sidebar menu."
  },
  profile: {
    name: 'User Profile',
    fullDetails: "USER PROFILE - Manage Your Information\n\nWhat is it?\nThe User Profile section allows you to view and manage all your personal information, professional details, and account settings.\n\nHow it works:\n1. View your account details\n2. Edit personal information (name, contact)\n3. Update professional information (specialty, experience, consultation fee, timing)\n4. Change profile photo\n5. Update clinic address\n\nHow to access:\nClick on 'User Profile' in the left sidebar menu."
  },
  patients: {
    name: 'Patients',
    fullDetails: "PATIENTS - View Your Patients\n\nWhat is it?\nThe Patients section lets you view all patients who have booked and completed appointments with you.\n\nHow it works:\n1. View list of all confirmed and completed patients\n2. See patient basic information\n3. Click 'Full Details' to view complete patient profile\n4. Access patient contact information\n5. View patient's medical history and lab reports\n\nHow to access:\nClick on 'Patients' in the left sidebar menu."
  },
  appointments: {
    name: 'Appointments',
    fullDetails: "APPOINTMENTS - Manage Patient Bookings\n\nWhat is it?\nThe Appointments section lets you view, manage, and track all patient consultations and appointments in one place.\n\nHow it works:\n1. View all appointments (past and upcoming)\n2. Filter by status: All, Paid, Confirmed, Completed, Cancelled\n3. Search patients by name or email\n4. Confirm pending appointments\n5. Cancel appointments (with automatic refund)\n6. Complete appointments after consultation\n7. Process refunds for cancelled appointments\n8. View payment status and refund information\n\nHow to access:\nClick on 'Appointment' in the left sidebar menu."
  },
  communication: {
    name: 'Communication',
    fullDetails: "COMMUNICATION - Connect With Patients\n\nWhat is it?\nThe Communication feature allows you to interact with your patients through chat, voice calls, and video consultations.\n\nHow it works:\n1. View all patients with confirmed/paid appointments\n2. Chat with patients in real-time\n3. Make voice calls to patients\n4. Start video consultations\n5. Complete appointments after consultation\n6. Track conversation history\n7. Share images and documents\n\nHow to access:\nClick on 'Communication' in the left sidebar menu."
  },
  prescription: {
    name: 'Prescription',
    fullDetails: "PRESCRIPTIONS - Manage Patient Medicines\n\nWhat is it?\nThe Prescriptions section allows you to view and manage prescriptions for your patients.\n\nHow it works:\n1. View list of patients with appointments\n2. Write new prescriptions using the Prescription Pad\n3. View existing prescriptions\n4. Download prescriptions for records\n5. Send prescriptions to patients via email\n6. Track prescription history\n\nHow to access:\nClick on 'Prescription' in the left sidebar menu."
  },
  labreports: {
    name: 'Patient Lab Reports',
    fullDetails: "PATIENT LAB REPORTS - View Medical Documents\n\nWhat is it?\nThe Patient Lab Reports section lets you view all medical test reports and lab documents uploaded by your patients.\n\nHow it works:\n1. View patients with completed appointments\n2. Access lab reports uploaded by patients\n3. View reports online\n4. Download reports for your reference\n5. Organize by date and type\n\nHow to access:\nClick on 'Patient Lab Reports' in the left sidebar menu."
  },
  payments: {
    name: 'Payment History',
    fullDetails: "PAYMENT HISTORY - Track Your Earnings\n\nWhat is it?\nThe Payment History section displays all your payment transactions, including consultation fees received and total earnings.\n\nHow it works:\n1. View complete payment history\n2. See total earnings\n3. Interactive calendar view of payment dates\n4. Filter payments by specific dates\n5. View patient payment details\n6. Track transaction IDs\n\nHow to access:\nClick on 'Payment History' in the left sidebar menu."
  },
  settings: {
    name: 'Settings',
    fullDetails: "SETTINGS - Account Configuration\n\nWhat is it?\nThe Settings section lets you manage your account preferences, security settings, and notification options.\n\nHow it works:\n1. Configure notification preferences (email, SMS, appointment reminders)\n2. Change your password\n3. Enable/disable Two-Factor Authentication\n4. Manage privacy settings\n5. Delete account (permanent)\n\nHow to access:\nClick on 'Setting' in the left sidebar menu."
  }
};

// Map keywords to feature IDs for text queries
const keywordMap = {
  dashboard: 'dashboard',
  'user profile': 'profile',
  profile: 'profile',
  'my profile': 'profile',
  patients: 'patients',
  patient: 'patients',
  'view patients': 'patients',
  appointments: 'appointments',
  appointment: 'appointments',
  'manage appointment': 'appointments',
  'book appointment': 'appointments',
  'booking': 'appointments',
  communication: 'communication',
  chat: 'communication',
  'video call': 'communication',
  'voice call': 'communication',
  'call patient': 'communication',
  prescriptions: 'prescription',
  prescription: 'prescription',
  medicines: 'prescription',
  medicine: 'prescription',
  'write prescription': 'prescription',
  'lab reports': 'labreports',
  'lab': 'labreports',
  reports: 'labreports',
  'test results': 'labreports',
  'patient lab': 'labreports',
  payments: 'payments',
  payment: 'payments',
  earnings: 'payments',
  income: 'payments',
  fees: 'payments',
  'payment history': 'payments',
  settings: 'settings',
  setting: 'settings',
  account: 'settings'
};

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { id: 'profile', label: 'User Profile', icon: '👤' },
  { id: 'patients', label: 'Patients', icon: '🧑‍🤝‍🧑' },
  { id: 'appointments', label: 'Appointments', icon: '📅' },
  { id: 'communication', label: 'Communication', icon: '💬' },
  { id: 'prescription', label: 'Prescription', icon: '💊' },
  { id: 'labreports', label: 'Lab Reports', icon: '📋' },
  { id: 'payments', label: 'Payment History', icon: '💳' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

const DoctorChatbot = ({ onNavigate, userProfilePhoto }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', text: "Hello! I'm MediBot, your healthcare assistant for doctors. You can ask me anything about the MediConnect doctor portal - like 'what is dashboard', 'how to manage appointments', or click a menu button to learn about any section!", time: new Date() }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const messagesEndRef = useRef(null);

  // Function to get the full profile photo URL
  const getProfilePhotoUrl = (photo) => {
    if (!photo) return null;
    if (photo.startsWith('http')) return photo;
    return `http://localhost:5000${photo}`;
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Function to find feature from text query
  const findFeatureFromQuery = (userInput) => {
    const input = userInput.toLowerCase();
    
    // First check exact keyword matches
    for (const [keyword, featureId] of Object.entries(keywordMap)) {
      if (input.includes(keyword)) {
        return featureId;
      }
    }
    
    // Then check feature names
    for (const [key, feature] of Object.entries(featureDetails)) {
      const nameLower = feature.name.toLowerCase();
      if (input.includes(nameLower)) {
        return key;
      }
    }
    
    return null;
  };

  // Function to get response for general questions
  const getGeneralResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    // Greetings
    if (input.includes('hello') || input.includes('hi') || input.includes('hey') || input.includes('greetings')) {
      return "Hello! I'm MediBot, your healthcare assistant for doctors. You can:\n\n1. Ask me questions like 'what is dashboard', 'how to manage appointments'\n2. Click any menu button to learn about a section\n3. Type 'yes' to open any section\n\nHow can I help you today?";
    }
    
    // Thanks
    if (input.includes('thank') || input.includes('thanks')) {
      return "You're welcome! Is there anything else you'd like to know about MediConnect?";
    }
    
    // Bye
    if (input.includes('bye') || input.includes('goodbye') || input.includes('see you')) {
      return "Goodbye! Take care. Feel free to come back anytime!";
    }
    
    // Help
    if (input.includes('help') || input.includes('what can you do')) {
      return "I can help you with:\n\n1. Any question about the portal sections\n2. How to use various features\n3. General platform questions\n\nJust ask me anything! For example:\n- 'What is dashboard'\n- 'How to manage appointments'\n- 'How to write prescription'\n- 'How to view patient lab reports'\n\nOr click any menu button above!";
    }
    
    // About
    if (input.includes('about') || input.includes('mediconnect')) {
      return "MediConnect is a comprehensive healthcare platform that allows doctors to:\n\n1. Manage patient appointments\n2. View and manage patient records\n3. Write and send prescriptions\n4. Communicate with patients via chat/call/video\n5. View payment history and earnings\n6. Access patient lab reports\n\nI'm MediBot, your virtual assistant to help you navigate all these features!";
    }
    
    // How questions
    if (input.includes('how') && (input.includes('work') || input.includes('use'))) {
      return "The MediConnect doctor portal works as follows:\n\n1. Login to your doctor account\n2. View and manage patient appointments\n3. Confirm or cancel appointments\n4. Chat/Call/Video with patients\n5. Write and send prescriptions\n6. View patient lab reports\n7. Track your earnings\n\nClick on any menu button above to learn more!";
    }
    
    // Emergency
    if (input.includes('emergency') || input.includes('urgent')) {
      return "FOR MEDICAL EMERGENCIES:\n\nPatients should contact emergency services immediately:\n\n- Ambulance: 102 or 108\n- Police: 100\n- Fire: 101\n\nFor platform-related assistance, you can use the MediConnect messaging system.";
    }
    
    return null;
  };

  const handleMenuClick = (menuId) => {
    const feature = featureDetails[menuId];
    if (!feature) {
      const featureNames = {
        profile: 'User Profile',
        patients: 'Patients',
        appointments: 'Appointments',
        communication: 'Communication',
        prescription: 'Prescriptions',
        labreports: 'Patient Lab Reports',
        payments: 'Payment History',
        settings: 'Settings'
      };
      const detailMessage = {
        id: Date.now(),
        type: 'bot',
        text: (featureNames[menuId] || menuId) + " section. Would you like me to open this section? Type 'yes' or 'no'",
        time: new Date()
      };
      setMessages(prev => [...prev, detailMessage]);
      setPendingNavigation(menuId);
      return;
    }

    const detailMessage = {
      id: Date.now(),
      type: 'bot',
      text: feature.fullDetails + "\n\nWould you like me to open this section? Type 'yes' or 'no'",
      time: new Date()
    };
    
    setMessages(prev => [...prev, detailMessage]);
    setPendingNavigation(menuId);
  };

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputText,
      time: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    
    const userInput = inputText.trim().toLowerCase();
    setInputText('');
    setIsTyping(true);
    
    setTimeout(() => {
      let response = '';
      
      // Check if waiting for yes/no response
      if (pendingNavigation) {
        if (userInput === 'yes' || userInput === 'y' || userInput === 'open' || userInput === 'sure') {
          if (onNavigate) {
            onNavigate(pendingNavigation);
          }
          const feature = featureDetails[pendingNavigation];
          response = "Opening " + (feature?.name || pendingNavigation) + " for you!";
          setPendingNavigation(null);
          setTimeout(() => setIsOpen(false), 1500);
        } else if (userInput === 'no' || userInput === 'n' || userInput === 'not now') {
          response = "No problem! Let me know if you'd like to explore other sections or ask any other question.";
          setPendingNavigation(null);
        } else {
          response = "Please type 'yes' to open this section or 'no' to stay here. You can also ask me any other question!";
        }
      } else {
        // First check if it's a feature-related question
        const featureId = findFeatureFromQuery(userInput);
        
        if (featureId && featureDetails[featureId]) {
          // Show the same detailed info as menu click
          const feature = featureDetails[featureId];
          response = feature.fullDetails + "\n\nWould you like me to open this section? Type 'yes' or 'no'";
          setPendingNavigation(featureId);
        } else {
          // Check for general questions
          const generalResponse = getGeneralResponse(userInput);
          
          if (generalResponse) {
            response = generalResponse;
          } else {
            response = "I understand you're asking about: '" + inputText + "'\n\nHere's what I can help with:\n\n1. Click any menu button above to learn about a section\n2. Ask questions like 'what is dashboard', 'how to manage appointments'\n3. Ask 'help' to see all available commands\n\nWhat would you like to know?";
          }
        }
      }
      
      if (response) {
        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          text: response,
          time: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      }
      
      setIsTyping(false);
    }, 800);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      <button 
        className="chatbot-float-btn"
        onClick={() => setIsOpen(true)}
        aria-label="Open chatbot"
      >
        <div className="chatbot-float-icon">
          {userProfilePhoto ? (
            <img 
              src={getProfilePhotoUrl(userProfilePhoto)} 
              alt="Profile" 
              className="chatbot-profile-photo"
            />
          ) : (
            <Bot size={24} />
          )}
        </div>
        <div className="chatbot-float-pulse"></div>
      </button>

      {isOpen && (
        <div className="chatbot-overlay" onClick={() => setIsOpen(false)}>
          <div className="chatbot-container" onClick={(e) => e.stopPropagation()}>
            <div className="chatbot-header">
              <div className="chatbot-header-left">
                <div className="chatbot-avatar">
                  <Bot size={20} />
                </div>
                <div className="chatbot-title">
                  <h3>MediBot</h3>
                  <span><Sparkles size={12} /> AI Assistant</span>
                </div>
              </div>
              <button className="chatbot-close" onClick={() => setIsOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="chatbot-menu-bar">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  className="chatbot-menu-item"
                  onClick={() => handleMenuClick(item.id)}
                >
                  <span className="menu-icon">{item.icon}</span>
                  <span className="menu-label">{item.label}</span>
                </button>
              ))}
            </div>

            <div className="chatbot-messages">
              {messages.map((msg) => (
                <div key={msg.id} className={`chatbot-message ${msg.type}`}>
                  {msg.type === 'bot' && (
                    <div className="message-avatar">
                      <Bot size={16} />
                    </div>
                  )}
                  <div className="message-content">
                    <p style={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem' }}>{msg.text}</p>
                    <span className="message-time">{formatTime(msg.time)}</span>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="chatbot-message bot">
                  <div className="message-avatar">
                    <Bot size={16} />
                  </div>
                  <div className="message-content typing">
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="chatbot-input">
              <input
                type="text"
                placeholder={pendingNavigation ? "Type 'yes' or 'no'..." : "Ask me anything..."}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button 
                className="send-btn"
                onClick={handleSend}
                disabled={!inputText.trim()}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorChatbot;

