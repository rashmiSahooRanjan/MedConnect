import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import '././PatientDashboard/patient dashboard css/doctorlist.css';
import './payment-custom.css';


const BookingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [patientData, setPatientData] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [appointmentType, setAppointmentType] = useState('online');
  const [notes, setNotes] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('credit'); // credit, netbanking, wallet, upi, cod
  const [formData, setFormData] = useState({
    cardNumber: '',
    holderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    upiId: ''
  });
const [paymentError, setPaymentError] = useState('');
  const [appointmentId, setAppointmentId] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const searchParams = new URLSearchParams(location.search);
  const doctorId = searchParams.get('doctorId');

  useEffect(() => {
    const storedData = localStorage.getItem('patientData');
    if (storedData) {
      setPatientData(JSON.parse(storedData));
    } else {
      navigate('/patient/signin');
    }

    if (doctorId) {
      fetchDoctorDetails();
    }

  }, [doctorId, navigate]);



  const fetchDoctorDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/doctors/${doctorId}`);
      const data = await response.json();
      
      if (response.ok) {
        setDoctor(data);
      }
    } catch (error) {
      console.error('Error fetching doctor:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPhotoUrl = (photoPath) => {
    if (!photoPath) return null;
    if (photoPath.startsWith('http')) return photoPath;
    return `http://localhost:5000${photoPath}`;
  };

  const getOnlineFee = () => {
    if (!doctor?.consultationFee) return 300;
    const baseFee = parseInt(doctor.consultationFee.replace(/[^0-9]/g, '')) || 500;
    return Math.floor(baseFee * 0.7);
  };

  const getOfflineFee = () => {
    if (!doctor?.consultationFee) return 500;
    return parseInt(doctor.consultationFee.replace(/[^0-9]/g, '')) || 500;
  };

  const getDiscount = () => {
    const offline = getOfflineFee();
    const online = getOnlineFee();
    return Math.round(((offline - online) / offline) * 100);
  };

  const getCalendarDays = () => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const isDateDisabled = (day) => {
    if (!day) return true;
    const date = new Date(currentYear, currentMonth, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handleDateClick = (day) => {
    if (isDateDisabled(day)) return;
    const date = new Date(currentYear, currentMonth, day);
    setSelectedDate(date.toLocaleDateString('en-GB'));
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const morningSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'
  ];

  const afternoonSlots = [
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
  ];

const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTime) {
      alert('Please select both date and time');
      return;
    }

    try {
      setBookingLoading(true);
      const amount = appointmentType === 'online' ? getOnlineFee() : getOfflineFee();
      const token = localStorage.getItem('patientToken');

      // 1. Create appointment (pending)
      const appointmentResponse = await fetch('http://localhost:5000/api/appointments/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          patientId: patientData._id,
          doctorId: doctorId,
          patientName: patientData.name,
          patientEmail: patientData.email,
          patientPhone: patientData.phone || patientData.contactNumber,
          doctorName: doctor.name,
          doctorSpecialty: doctor.specialist,
          appointmentType: appointmentType,
          appointmentDate: selectedDate,
          appointmentTime: selectedTime,
          consultationFee: amount,
          notes: notes
        }),
      });

      const appointmentData = await appointmentResponse.json();
      if (!appointmentData.success) throw new Error(appointmentData.message);

      const appointmentId = appointmentData.data._id;
      setAppointmentId(appointmentId);

      // Show custom payment modal instead of Stripe
      setShowPaymentModal(true);
    } catch (error) {
      setPaymentError(error.message || 'Booking failed');
      console.error('Book appointment error:', error);
    } finally {
      setBookingLoading(false);
    }
  };




  const handlePaymentSubmit = async () => {
    if (!appointmentId) {
      setPaymentError('No appointment selected');
      return;
    }

    setPaymentError('');

    // Frontend validation
    if (paymentMethod === 'credit') {
      if (formData.cardNumber.length !== 16 || !formData.holderName || formData.cvv.length !== 3) {
        setPaymentError('Enter valid card number (16 digits), name, and CVV (3 digits)');
        return;
      }
    } else if (paymentMethod === 'upi' && !formData.upiId.includes('@')) {
      setPaymentError('Enter valid UPI ID (e.g. user@paytm)');
      return;
    }

    setPaymentLoading(true);
    try {
      const token = localStorage.getItem('patientToken');
      const amount = appointmentType === 'online' ? getOnlineFee() : getOfflineFee();

      const response = await fetch('http://localhost:5000/api/payments/process-custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          appointmentId,
          paymentMethod,
          amount,
          details: formData
        })
      });

      const data = await response.json();
      if (data.success) {
        setShowSuccess(true);
        setTimeout(() => {
          alert('Payment successful! Appointment booked!');
          navigate('/patient/dashboard');
        }, 1500);
      } else {
        setPaymentError(data.message || 'Payment failed. Try again.');
      }
    } catch (error) {
      setPaymentError('Network error. Please check if server is running.');
      console.error('Payment submit error:', error);
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowPaymentModal(false);
    setPaymentError('');
    setShowSuccess(false);
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const renderStars = () => {
    return (
      <div className="doctor-rating">
        {[...Array(5)].map((_, i) => (
          <span key={i} className="star">★</span>
        ))}
        <span className="rating-text">4.8 (120+ patients)</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="booking-page">
        <div className="booking-loading">
          <div className="loading-spinner"></div>
          <p>Loading doctor details...</p>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="booking-page">
        <div className="booking-error">
          <h2>Doctor Not Found</h2>
          <p>The doctor you're looking for doesn't exist.</p>
          <button onClick={() => navigate('/patient/dashboard')}>Go to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <div className="booking-container">
        {/* Header */}
        <div className="booking-header-modern">
          <button className="back-btn" onClick={() => navigate('/patient/dashboard')}>
            ← Back to Dashboard
          </button>
          <h1>Book Your Appointment</h1>
          <p>Schedule a consultation with Dr. {doctor.name}</p>
        </div>

        {/* Progress Steps */}
        <div className="booking-progress">
          <div className={`progress-step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
            <div className="step-circle">1</div>
            <span>Select Type</span>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
            <div className="step-circle">2</div>
            <span>Date & Time</span>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${currentStep >= 3 ? 'active' : ''}`}>
            <div className="step-circle">3</div>
            <span>Payment</span>
          </div>
        </div>

        <div className="booking-content-modern">
          {/* Left Column - Doctor Info */}
          <div className="doctor-info-column">
            <div className="doctor-card-modern">
              <div className="doctor-photo-wrapper">
                {doctor.profilePhoto ? (
                  <img src={getPhotoUrl(doctor.profilePhoto)} alt={doctor.name} className="doctor-photo-modern" />
                ) : (
                  <div className="doctor-photo-placeholder-modern">👨‍⚕️</div>
                )}
                <div className="doctor-status-badge">
                  <span className="status-dot"></span>
                  Available
                </div>
              </div>
              
              <div className="doctor-info-content">
                <h2>Dr. {doctor.name}</h2>
                <p className="specialty-modern">{doctor.specialist}</p>
                {renderStars()}
                
                <div className="doctor-badges">
                  <div className="badge-item">
                    <span className="badge-icon">💼</span>
                    <div className="badge-text">
                      <strong>{doctor.yearOfExperience || doctor.experience || 5}+</strong>
                      <small>Years Exp.</small>
                    </div>
                  </div>
                  <div className="badge-item">
                    <span className="badge-icon">🏥</span>
                    <div className="badge-text">
                      <strong>{doctor.hospital || 'MediCare'}</strong>
                      <small>Hospital</small>
                    </div>
                  </div>
                </div>

                <div className="doctor-timing-modern">
                  <span className="timing-icon">🕐</span>
                  <span>{doctor.timing || '9:00 AM - 5:00 PM'}</span>
                </div>

                <div className="doctor-fee-card">
                  <div className="fee-option">
                    <div className="fee-header">
                      <span className="fee-type">📹 Online</span>
                      <span className="fee-amount">₹{getOnlineFee()}</span>
                    </div>
                    <div className="fee-original">₹{getOfflineFee()}</div>
                    <span className="fee-discount">{getDiscount()}% OFF</span>
                  </div>
                  <div className="fee-option">
                    <div className="fee-header">
                      <span className="fee-type">🏥 Offline</span>
                      <span className="fee-amount">₹{getOfflineFee()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* About Doctor */}
            <div className="about-doctor-card">
              <h3>About Doctor</h3>
              <p>{doctor.about || `Dr. ${doctor.name} is a highly experienced ${doctor.specialist} with ${doctor.yearOfExperience || doctor.experience || 5}+ years of expertise in treating patients with compassion and care.`}</p>
              <div className="doctor-services">
                <h4>Services</h4>
                <div className="service-tags">
                  <span className="service-tag">General Consultation</span>
                  <span className="service-tag">Follow-up Visits</span>
                  <span className="service-tag">Health Checkup</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Form */}
          <div className="booking-form-column">
            {/* Step 1: Appointment Type */}
            <div className="booking-section">
              <h3 className="section-title">
                <span className="step-number">1</span>
                Select Appointment Type
              </h3>
              <div className="appointment-type-cards">
                <div 
                  className={`type-card ${appointmentType === 'online' ? 'selected' : ''}`}
                  onClick={() => {
                    setAppointmentType('online');
                    setCurrentStep(2);
                  }}
                >
                  <div className="type-card-icon">📹</div>
                  <div className="type-card-content">
                    <h4>Video Consultation</h4>
                    <p>Connect via video call from anywhere</p>
                    <div className="type-card-price">
                      <span className="current-price">₹{getOnlineFee()}</span>
                      <span className="original-price">₹{getOfflineFee()}</span>
                      <span className="discount-tag">{getDiscount()}% OFF</span>
                    </div>
                  </div>
                  {appointmentType === 'online' && <div className="check-icon">✓</div>}
                </div>
                <div 
                  className={`type-card ${appointmentType === 'offline' ? 'selected' : ''}`}
                  onClick={() => {
                    setAppointmentType('offline');
                    setCurrentStep(2);
                  }}
                >
                  <div className="type-card-icon">🏥</div>
                  <div className="type-card-content">
                    <h4>Clinic Visit</h4>
                    <p>Visit the doctor at their clinic</p>
                    <div className="type-card-price">
                      <span className="current-price">₹{getOfflineFee()}</span>
                    </div>
                  </div>
                  {appointmentType === 'offline' && <div className="check-icon">✓</div>}
                </div>
              </div>
            </div>

            {/* Step 2: Date & Time */}
            <div className="booking-section">
              <h3 className="section-title">
                <span className="step-number">2</span>
                Select Date & Time
              </h3>
              
              {/* Calendar */}
              <div className="calendar-modern">
                <div className="calendar-header-modern">
                  <button className="calendar-nav-btn" onClick={handlePrevMonth}>❮</button>
                  <h4>{monthNames[currentMonth]} {currentYear}</h4>
                  <button className="calendar-nav-btn" onClick={handleNextMonth}>❯</button>
                </div>
                <div className="calendar-weekdays-modern">
                  <span>Sun</span>
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                </div>
                <div className="calendar-days-modern">
                  {getCalendarDays().map((day, index) => (
                    <button
                      key={index}
                      className={`calendar-day-modern ${day ? '' : 'empty'} ${day && isDateDisabled(day) ? 'disabled' : ''} ${day && selectedDate === new Date(currentYear, currentMonth, day).toLocaleDateString('en-GB') ? 'selected' : ''} ${day && !isDateDisabled(day) && new Date(currentYear, currentMonth, day).toLocaleDateString('en-GB') === new Date().toLocaleDateString('en-GB') ? 'today' : ''}`}
                      onClick={() => handleDateClick(day)}
                      disabled={isDateDisabled(day)}
                    >
                      {day}
                    </button>
                  ))}
                </div>
                {selectedDate && (
                  <div className="selected-date-badge">
                    📅 {selectedDate}
                  </div>
                )}
              </div>

              {/* Time Slots */}
              <div className="time-slots-section">
                <h4>Morning Slots</h4>
                <div className="time-slots-grid">
                  {morningSlots.map((time) => (
                    <button
                      key={time}
                      className={`time-slot-modern ${selectedTime === time ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedTime(time);
                        setCurrentStep(3);
                      }}
                    >
                      {time}
                    </button>
                  ))}
                </div>
                
                <h4>Afternoon Slots</h4>
                <div className="time-slots-grid">
                  {afternoonSlots.map((time) => (
                    <button
                      key={time}
                      className={`time-slot-modern ${selectedTime === time ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedTime(time);
                        setCurrentStep(3);
                      }}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="booking-section">
              <h3 className="section-title">
                <span className="step-number">📝</span>
                Additional Notes (Optional)
              </h3>
              <textarea
                className="notes-textarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe your symptoms or concerns for the doctor..."
                rows={3}
              />
            </div>

            {/* Summary & Book Button */}
            {selectedDate && selectedTime && (
              <div className="booking-summary">
                <div className="summary-header">
                  <h3>Booking Summary</h3>
                </div>
                <div className="summary-content">
                  <div className="summary-row">
                    <span>Doctor</span>
                    <span>Dr. {doctor.name}</span>
                  </div>
                  <div className="summary-row">
                    <span>Type</span>
                    <span>{appointmentType === 'online' ? 'Video Consultation' : 'Clinic Visit'}</span>
                  </div>
                  <div className="summary-row">
                    <span>Date</span>
                    <span>{selectedDate}</span>
                  </div>
                  <div className="summary-row">
                    <span>Time</span>
                    <span>{selectedTime}</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total</span>
                    <span>₹{appointmentType === 'online' ? getOnlineFee() : getOfflineFee()}</span>
                  </div>
                </div>
                <button className="btn-book-now" onClick={handleBookAppointment}>
                  <span>💳 Proceed to Payment</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
{showPaymentModal && (
        <div className="payment-modal-overlay" style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div className="payment-modal-modern" style={{background: 'white', borderRadius: '10px', maxWidth: '90vw', maxHeight: '90vh', overflow: 'auto'}}>
            {showSuccess ? (
              <div className="payment-success-modern">
                <div className="success-animation">
                  <div className="success-circle">
                    <span>✓</span>
                  </div>
                </div>
                <h2>🎉 Payment Successful!</h2>
                <p>Your appointment has been confirmed</p>
                
                <div className="success-receipt">
                  <div className="receipt-item">
                    <span>Doctor</span>
                    <span>Dr. {doctor.name}</span>
                  </div>
                  <div className="receipt-item">
                    <span>Date</span>
                    <span>{selectedDate}</span>
                  </div>
                  <div className="receipt-item">
                    <span>Time</span>
                    <span>{selectedTime}</span>
                  </div>
                  <div className="receipt-item">
                    <span>Type</span>
                    <span>{appointmentType === 'online' ? 'Video Consultation' : 'Clinic Visit'}</span>
                  </div>
                  <div className="receipt-item highlight">
                    <span>Amount Paid</span>
                    <span>₹{appointmentType === 'online' ? getOnlineFee() : getOfflineFee()}</span>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="payment-modal-header-modern">
                  <h2>Select Payment Method</h2>
                  <button className="close-modal-btn" onClick={handleCloseModal}>✕</button>
                </div>
                
                <div className="payment-modal-body-modern">
                  {paymentError && (
                    <div className="payment-error-custom">
                      ⚠️ {paymentError}
                    </div>
                  )}
                  
                  <div className="payment-amount-display">
                    <span className="payment-label">Amount</span>
                    <span className="payment-amount-modern">₹{appointmentType === 'online' ? getOnlineFee() : getOfflineFee()}</span>
                  </div>

                  <div className="payment-container" style={{display: 'flex'}}>
                    {/* Payment Tabs */}
                    <div className="payment-tabs">
                      <div className={`payment-tab ${paymentMethod === 'credit' ? 'selected' : ''}`} onClick={() => setPaymentMethod('credit')} >
                        Credit/Debit Card
                      </div>
                      <div className={`payment-tab ${paymentMethod === 'netbanking' ? 'selected' : ''}`} onClick={() => setPaymentMethod('netbanking')} >
                        Net Banking
                      </div>
                      <div className={`payment-tab ${paymentMethod === 'wallet' ? 'selected' : ''}`} onClick={() => setPaymentMethod('wallet')} >
                        Wallet
                      </div>
                      <div className={`payment-tab ${paymentMethod === 'upi' ? 'selected' : ''}`} onClick={() => setPaymentMethod('upi')} >
                        UPI
                      </div>
                      <div className={`payment-tab ${paymentMethod === 'cod' ? 'selected' : ''}`} onClick={() => setPaymentMethod('cod')} >
                        Cash on Delivery
                      </div>
                    </div>

                    {/* Payment Forms */}
                    <div className="payment-form-container">
                      {paymentMethod === 'credit' && (
                        <>
                          <div className="pay-head">Add New Card</div>
                          <input 
                            className="payment-box-input" 
                            placeholder="Card Number" 
                            value={formData.cardNumber}
                            onChange={(e) => setFormData({...formData, cardNumber: e.target.value})}
                          />
                          <input 
                            className="payment-box-input" 
                            placeholder="Name on Card" 
                            value={formData.holderName}
                            onChange={(e) => setFormData({...formData, holderName: e.target.value})}
                          />
                          <div style={{display: 'flex', gap: '10px'}}>
                            <select 
                              className="payment-box-input" 
                              style={{flex: 1}}
                              value={formData.expiryMonth}
                              onChange={(e) => setFormData({...formData, expiryMonth: e.target.value})}
                            >
                              <option>Month</option>
                              <option>01</option>
                              <option>02</option>
                              <option>03</option>
                              <option>04</option>
                              <option>05</option>
                              <option>06</option>
                              <option>07</option>
                              <option>08</option>
                              <option>09</option>
                              <option>10</option>
                              <option>11</option>
                              <option>12</option>
                            </select>
                            <select 
                              className="payment-box-input" 
                              style={{flex: 1}}
                              value={formData.expiryYear}
                              onChange={(e) => setFormData({...formData, expiryYear: e.target.value})}
                            >
                              <option>Year</option>
                              <option>2024</option>
                              <option>2025</option>
                              <option>2026</option>
                              <option>2027</option>
                              <option>2028</option>
                              <option>2029</option>
                              <option>2030</option>
                            </select>
                            <input 
                              className="payment-box-input" 
                              type="password"
                              placeholder="CVV" 
                              style={{flex: 1}}
                              value={formData.cvv}
                              onChange={(e) => setFormData({...formData, cvv: e.target.value})}
                            />
                          </div>
                          <label className="credit-checkbox-input">
                            <input type="checkbox" />
                            Save these details for faster checkout
                          </label>
                          <button className="btn-pay-now-modern" onClick={() => handlePaymentSubmit()}>
                            PAY SECURELY
                          </button>
                        </>
                      )}
                      {paymentMethod === 'upi' && (
                        <>
                          <div className="pay-head">Enter your UPI ID</div>
                          <input 
                            className="payment-box-input" 
                            placeholder="yourupi@bank" 
                            value={formData.upiId}
                            onChange={(e) => setFormData({...formData, upiId: e.target.value})}
                          />
                          <label className="credit-checkbox-input">
                            <input type="checkbox" />
                            Save this UPI ID for faster checkout
                          </label>
                          <button className="btn-pay-now-modern" onClick={() => handlePaymentSubmit()}>
                            PAY SECURELY
                          </button>
                        </>
                      )}
                      {paymentMethod === 'cod' && (
                        <>
                          <div className="pay-head">Cash on Delivery</div>
                          <p>For safe, contactless delivery, pay using card/wallet/netbanking</p>
                          <button className="btn-pay-now-modern" onClick={() => handlePaymentSubmit()}>
                            PLACE ORDER
                          </button>
                        </>
                      )}
                      {paymentMethod === 'netbanking' && (
                        <>
                          <div className="pay-head">Select Bank</div>
                          <div className="bank-grid">
                            <div className="bank-option">
                              <img src="https://assets.ajio.com/static/peImages/HDFC.png" alt="HDFC" />
                              <span>HDFC</span>
                            </div>
                            <div className="bank-option">
                              <img src="https://assets.ajio.com/static/peImages/SBI.png" alt="SBI" />
                              <span>SBI</span>
                            </div>
                            <div className="bank-option">
                              <img src="https://assets.ajio.com/static/peImages/ICICI.png" alt="ICICI" />
                              <span>ICICI</span>
                            </div>
                          </div>
                          <button className="btn-pay-now-modern">
                            PAY SECURELY
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <p className="payment-security-note">
                    🔒 Secure payment - Your information is protected
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;

