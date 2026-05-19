import { Link, useLocation } from 'react-router-dom';
import './header-styles.css';



const Header = () => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <header className="medcare-header">
      <div className="header-content medcare-container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 var(--spacing-xl)' }}>
        <Link to="/" className="medcare-logo">
          <div className="medcare-logo-icon">🩺</div>
          <span className="logo-text">MediConnect</span>
        </Link>
        
        <nav className="nav-links" style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
          <Link to="/home" className={`nav-btn medcare-btn medcare-btn-secondary ${isActive('/home')}`}>
            Home
          </Link>
<Link to="/features" className={`nav-btn medcare-btn medcare-btn-secondary ${isActive('/features')}`}>
            Feature
          </Link>
          <Link to="/how-it-works" className={`nav-btn medcare-btn medcare-btn-secondary ${isActive('/how-it-works')}`}>
            How it work
          </Link>
          <Link to="/reviews" className={`nav-btn medcare-btn medcare-btn-secondary ${isActive('/reviews')}`}>
            Review
          </Link>
          <Link to="/contact" className={`nav-btn medcare-btn medcare-btn-secondary ${isActive('/contact')}`}>
            Contact
          </Link>

          <Link to="/patient/signup" className={`nav-btn medcare-btn medcare-btn-secondary ${isActive('/patient/signup')}`}>
            Patient Signup
          </Link>
          <Link to="/patient/signin" className={`nav-btn medcare-btn medcare-btn-secondary ${isActive('/patient/signin')}`}>
            Patient Login
          </Link>
          <Link to="/doctor/signup" className={`nav-btn medcare-btn medcare-btn-secondary ${isActive('/doctor/signup')}`}>
            Doctor Signup
          </Link>
          <Link to="/doctor/signin" className={`nav-btn medcare-btn medcare-btn-secondary ${isActive('/doctor/signin')}`}>
            Doctor Login
          </Link>
        </nav>

      </div>
    </header>
  );
};


export default Header;
