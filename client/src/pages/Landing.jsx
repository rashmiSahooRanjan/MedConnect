import { useNavigate } from 'react-router-dom';
import '../medcare-ui.css';
import { User, Stethoscope, ArrowRight } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-hero medcare-container">
      <header className="landing-header">
        <div className="header-welcome">
          <h1 className="header-welcome-h1">
            Welcome to <span>MediConnect</span>
          </h1>
          <p className="header-welcome-p">
            Your trusted healthcare platform. Connect with doctors or manage your health records seamlessly.
          </p>
        </div>
      </header>

      <main className="landing-main medcare-content">
        <div className="dashboard-grid">
          <div className="dashboard-card full-width medical-card card-primary medcare-card">
            <div className="card-header">
              <div>
                <h2>Patient Portal</h2>
                <p>Book appointments, view lab reports, manage prescriptions and medical history</p>
              </div>
              <div className="card-icon">
                <User size={48} />
              </div>
            </div>
            <div className="card-footer">
              <button 
                className="btn btn-primary full-width medcare-btn medcare-btn-primary" 
                onClick={() => navigate('/patient/signup')}
              >
                Get Started as Patient <ArrowRight size={20} />
              </button>
            </div>
          </div>

          <div className="dashboard-card full-width medical-card card-success medcare-card">
            <div className="card-header">
              <div>
                <h2>Doctor Portal</h2>
                <p>Manage patients, create prescriptions, view lab reports and grow your practice</p>
              </div>
              <div className="card-icon">
                <Stethoscope size={48} />
              </div>
            </div>
            <div className="card-footer">
              <button 
                className="btn btn-primary full-width medcare-btn medcare-btn-primary" 
                onClick={() => navigate('/doctor/signup')}
              >
                Join Doctor Network <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );

};

export default Landing;
