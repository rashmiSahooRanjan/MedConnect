import React, { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    // Smooth scroll for in-page anchors
    const handler = (e) => {
      const target = e.target;
      if (!target) return;

      const anchor = target.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href || !href.startsWith('#')) return;

      e.preventDefault();

      const el = document.querySelector(href);

      if (el) {
        el.scrollIntoView({
          behavior: 'smooth',
        });
      }
    };

    document.addEventListener('click', handler);

    return () => {
      document.removeEventListener('click', handler);
    };
  }, []);

  return (
    <>
      <style>{`
        :root {
          --primary: #4f46e5;
          --primary-light: #818cf8;
          --secondary: #10b981;
          --accent: #f59e0b;
          --bg: #f8fafc;
          --text: #1e293b;
          --gray: #64748b;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          text-decoration: none;
        }

        body {
          font-family: 'Inter', sans-serif;
          background: var(--bg);
          color: var(--text);
          line-height: 1.6;
        }

        .container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
        }

        header {
          position: fixed;
          top: 0;
          width: 100%;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          z-index: 1000;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }

        nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 0;
        }

        .logo {
          font-size: 32px;
          font-weight: 800;
          color: var(--primary);
        }

        .logo span {
          color: var(--secondary);
        }

        .nav-links {
          display: flex;
          gap: 40px;
        }

        .nav-links a {
          color: var(--text);
          font-weight: 500;
          transition: color 0.3s;
          position: relative;
        }

        .nav-links a:hover {
          color: var(--primary);
        }

        .nav-links a::after {
          content: '';
          position: absolute;
          bottom: -5px;
          left: 0;
          width: 0;
          height: 2px;
          background: var(--primary);
          transition: width 0.3s;
        }

        .nav-links a:hover::after {
          width: 100%;
        }

        .btn {
          padding: 12px 28px;
          border-radius: 999px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-primary {
          background: var(--primary);
          color: white;
        }

        .btn-primary:hover {
          background: #4338ca;
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(79, 70, 229, 0.3);
        }

        .btn-outline {
          border: 2px solid var(--primary);
          color: var(--primary);
          background: transparent;
        }

        .btn-outline:hover {
          background: var(--primary);
          color: white;
        }

        .hero {
          padding-top: 120px;
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white;
          position: relative;
          overflow: hidden;
        }

        .hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: url('https://www.shutterstock.com/image-photo/asia-people-young-woman-video-260nw-2505278537.jpg')
            center/cover;
          opacity: 0.3;
        }

        .hero-content {
          position: relative;
          z-index: 1;
          max-width: 600px;
        }

        .hero h1 {
          font-size: 56px;
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 24px;
        }

        .hero p {
          font-size: 20px;
          margin-bottom: 40px;
          opacity: 0.9;
        }

        .hero-buttons {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
        }

        .hero-img {
          flex: 1;
          display: flex;
          justify-content: center;
        }

        .hero-img img {
          max-width: 100%;
          border-radius: 24px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }

        .features {
          padding: 120px 0;
          background: white;
        }

        .section-title {
          text-align: center;
          font-size: 44px;
          font-weight: 700;
          margin-bottom: 24px;
        }

        .section-subtitle {
          text-align: center;
          font-size: 20px;
          color: var(--gray);
          max-width: 800px;
          margin: 0 auto 80px;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 40px;
        }

        .feature-card {
          background: white;
          padding: 40px;
          border-radius: 24px;
          text-align: center;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          transition: all 0.4s;
          border: 1px solid #e2e8f0;
        }

        .feature-card:hover {
          transform: translateY(-12px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }

        .feature-icon {
          width: 100px;
          height: 100px;
          margin: 0 auto 24px;
          border-radius: 50%;
          background: linear-gradient(
            135deg,
            var(--primary-light),
            var(--primary)
          );
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .feature-icon img {
          width: 60px;
          filter: brightness(0) invert(1);
        }

        .feature-card h3 {
          font-size: 24px;
          margin-bottom: 16px;
        }

        footer {
          background: #1e293b;
          color: #cbd5e1;
          padding: 80px 0 40px;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 40px;
        }

        .footer-links h4 {
          color: white;
          margin-bottom: 24px;
          font-size: 20px;
        }

        .footer-links a {
          display: block;
          color: #cbd5e1;
          margin-bottom: 12px;
        }

        @media (max-width: 768px) {
          .nav-links {
            display: none;
          }

          .hero h1 {
            font-size: 42px;
          }

          .section-title {
            font-size: 36px;
          }

          .hero {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>



      {/* Hero Section */}
      <section
        className="hero container"
        style={{ display: 'flex', gap: 40 }}
      >
        <div className="hero-content">
          <h1>
            MedConnect at Your Fingertips – Anytime, Anywhere
          </h1>

          <p>
            Connect instantly with board-certified doctors
            through secure video, chat, or voice calls.
            Get prescriptions, lab referrals, and
            personalized care without leaving home.
          </p>

          <div className="hero-buttons">
            <a
              href="/signup"
              className="btn btn-primary"
              style={{
                fontSize: 18,
                padding: '16px 36px',
              }}
            >
              Book a Consultation
            </a>

            <a
              href="#features"
              className="btn btn-outline"
              style={{
                fontSize: 18,
                padding: '16px 36px',
              }}
            >
              Learn More
            </a>
          </div>
        </div>

        <div className="hero-img">
          <img
            src="https://img.freepik.com/premium-vector/online-doctor-consultation-concept-flat-illustration_720185-3956.jpg"
            alt="Doctor video consultation illustration"
          />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="features">
        <div className="container">
          <h2 className="section-title">
            Why Choose MedConnect?
          </h2>

          <p className="section-subtitle">
            Experience modern healthcare designed for your
            busy life with cutting-edge features.
          </p>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <img
                  src="https://static.vecteezy.com/system/resources/previews/002/104/556/non_2x/medical-and-science-flat-style-icon-set-design-vector.jpg"
                  alt="Video Icon"
                />
              </div>

              <h3>Instant Video Consults</h3>

              <p>
                High-quality video calls with specialists
                in under 10 minutes – no waiting rooms.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <img
                  src="https://static.vecteezy.com/system/resources/previews/002/104/556/non_2x/medical-and-science-flat-style-icon-set-design-vector.jpg"
                  alt="Prescription Icon"
                />
              </div>

              <h3>Digital Prescriptions</h3>

              <p>
                Receive e-prescriptions sent directly to
                your preferred pharmacy instantly.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <img
                  src="https://static.vecteezy.com/system/resources/previews/002/104/556/non_2x/medical-and-science-flat-style-icon-set-design-vector.jpg"
                  alt="Secure Icon"
                />
              </div>

              <h3>Secure & Private</h3>

              <p>
                HIPAA-compliant platform with end-to-end
                encryption for complete peace of mind.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="container footer-grid">
          <div>
            <div
              className="logo"
              style={{
                color: 'white',
                fontSize: 36,
              }}
            >
              Med<span>Connect</span>
            </div>

            <p>
              Delivering quality healthcare virtually
              since 2025.
            </p>
          </div>

          <div className="footer-links">
            <h4>Company</h4>
            <a href="/about">About</a>
            <a href="/careers">Careers</a>
            <a href="/blog">Blog</a>
          </div>

          <div className="footer-links">
            <h4>Support</h4>
            <a href="/help">Help Center</a>
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms</a>
          </div>

          <div className="footer-links">
            <h4>Contact</h4>
            <a href="/contact">
              support@medconnect.com
            </a>

            <a href="/contact">
              +91 99999 99999
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}