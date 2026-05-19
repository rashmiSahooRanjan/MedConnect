import { useState, useEffect } from 'react';

const Captcha = ({ onVerify }) => {
  const [captcha, setCaptcha] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isValid, setIsValid] = useState(null);

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptcha(result);
    setUserInput('');
    setIsValid(null);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleRefresh = () => {
    generateCaptcha();
  };

  const handleChange = (e) => {
    const value = e.target.value.toUpperCase();
    setUserInput(value);
    
    if (value.length === 5) {
      if (value === captcha) {
        setIsValid(true);
        onVerify(true);
      } else {
        setIsValid(false);
        onVerify(false);
      }
    } else {
      setIsValid(null);
      onVerify(false);
    }
  };

  return (
    <div className="captcha-container">
      <div className="captcha-display">
        <span className="captcha-text">{captcha}</span>
        <button type="button" className="captcha-refresh" onClick={handleRefresh}>
          ↻
        </button>
      </div>
      <input
        type="text"
        className={`captcha-input ${isValid === false ? 'error' : ''}`}
        placeholder="Enter captcha"
        value={userInput}
        onChange={handleChange}
        maxLength={5}
      />
      {isValid === false && (
        <span className="error-message">Invalid captcha. Please try again.</span>
      )}
    </div>
  );
};

export default Captcha;
