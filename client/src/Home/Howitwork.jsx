import React, { useEffect, useMemo, useState } from 'react';

const patientSteps = [
  {
    img: 'https://www.cleveroad.com/images/article-previews/create-a-MedConnect-app-patient-profile-3x.webp',
    alt: 'Step 1: Create an Account',
    title: 'Step 1: Create an Account',
    text: 'Sign up using your email or mobile number and complete your profile with basic personal and medical information.',
  },
  {
    img: 'https://assets.humana.com/is/image/humana/AdobeStock_392711674-1',
    alt: 'Step 2: Find the Right Doctor',
    title: 'Step 2: Find the Right Doctor',
    text: 'Search and choose doctors based on specialty, experience, availability, and consultation fees.',
  },
  {
    img: 'https://assets.setmore.com/website/v2/images/common-images/new-24/setmore_mockup-calendar-multidevice.png',
    alt: 'Step 3: Book an Appointment',
    title: 'Step 3: Book an Appointment',
    text: 'Select a convenient date and time and choose video, audio, or chat consultation.',
  },
  {
    img: 'https://healthy-magazines.com/wp-content/uploads/2021/07/shutterstock_1763113577-1-scaled.jpg',
    alt: 'Step 4: Make Secure Payment',
    title: 'Step 4: Make Secure Payment',
    text: 'Complete payment through our secure payment gateway.',
  },
  {
    img: 'https://media.istockphoto.com/id/1856641521/video/video-call-smartphone-screen-and-doctor-talking-to-patient-for-healthcare-support-virtual.jpg?s=640x640&k=20&c=ZneAKVh2r631RhvpoAWEeSZR0pdXI1li0eWOVhbXVeA=',
    alt: 'Step 5: Online Consultation',
    title: 'Step 5: Online Consultation',
    text: 'Join your consultation from anywhere and get professional medical advice.',
  },
  {
    img: 'https://media.licdn.com/dms/image/v2/D4E12AQHVZcFegPCDVw/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1704873300438?e=2147483647&v=beta&t=Oltl7UB8fM9E1XwsbMo8HCMX7KLdioFbnsKaZ0-QP0Q',
    alt: 'Step 6: Receive Digital Prescription',
    title: 'Step 6: Receive Digital Prescription',
    text: 'Download and access your digital prescription anytime.',
  },
];

const doctorSteps = [
  {
    img: 'https://as1.ftcdn.net/jpg/06/86/52/82/1000_F_686528205_UJaEtlon1cWvwIUX0NL13uNOIhPW8Li2.jpg',
    alt: 'Step 1: Register & Verify',
    title: 'Step 1: Register & Verify',
    text: 'Doctors register by submitting credentials for verification.',
  },
  {
    img: 'http://www.customerparadigm.com/images/web-software-appointment-scheduling-system/php-open-source/open-source-appointment-scheduling-php-software/online-appointment-scheduling-system-system-settings-area.jpg',
    alt: 'Step 2: Set Availability',
    title: 'Step 2: Set Availability',
    text: 'Manage schedule, consultation fees, and availability.',
  },
  {
    img: 'https://media.gettyimages.com/id/1248731764/video/online-video-call-via-smart-phone-of-male-doctor-consulting-sick-man-at-home.jpg?s=640x640&k=20&c=GovtePnfpjFueNcHnLvHDPnRw643zUSlSm8aHB-9cyE=',
    alt: 'Step 3: Consult Patients Online',
    title: 'Step 3: Consult Patients Online',
    text: 'Conduct online consultations and provide prescriptions digitally.',
  },
];

const faqItems = [
  {
    question: 'What is MedConnect?',
    answer:
      'MedConnect allows users to consult certified doctors remotely.',
  },
  {
    question: 'Is the platform secure?',
    answer:
      'Yes, we use advanced encryption to keep all user data secure.',
  },
  {
    question: 'Can I get prescriptions online?',
    answer:
      'Yes, doctors provide digital prescriptions after consultation.',
  },
];

export default function HowItWorks() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
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

  const styles = useMemo(
    () => `
    body {
      font-family: 'Segoe UI', sans-serif;
      background-color: #f4f7fc;
      margin: 0;
      padding: 0;
      color: #333;
      padding-top: 80px;
    }

    nav {
      position: fixed;
      top: 0;
      width: 100%;
      height: 60px;
      background: linear-gradient(135deg, #007bff, #00c6ff);
      padding: 15px 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 1000;
    }

    .logo {
      color: white;
      font-size: 1.8rem;
      font-weight: bold;
    }

    nav ul {
      list-style: none;
      display: flex;
      gap: 20px;
    }

    nav ul li a {
      text-decoration: none;
      color: white;
      font-weight: 500;
    }

    header {
      background: linear-gradient(135deg, #007bff, #00c6ff);
      color: white;
      text-align: center;
      padding: 80px 20px;
    }

    header h1 {
      font-size: 3rem;
    }

    header p {
      font-size: 1.2rem;
      max-width: 800px;
      margin: auto;
    }

    .container {
      max-width: 1200px;
      margin: auto;
      padding: 20px;
    }

    section {
      background: white;
      padding: 40px;
      margin-bottom: 40px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }

    h2 {
      color: #007bff;
      text-align: center;
      margin-bottom: 30px;
    }

    .steps {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 30px;
    }

    .step {
      text-align: center;
      padding: 20px;
      border-radius: 10px;
      transition: 0.3s;
    }

    .step:hover {
      transform: translateY(-10px);
    }

    .step img {
      width: 100%;
      height: 220px;
      object-fit: cover;
      border-radius: 10px;
    }

    .step h3 {
      color: #007bff;
      margin-top: 20px;
    }

    .faq-item {
      border: 1px solid #ddd;
      margin-bottom: 15px;
      border-radius: 8px;
      overflow: hidden;
    }

    .faq-question {
      padding: 20px;
      background: #f8f9fa;
      cursor: pointer;
      font-weight: bold;
    }

    .faq-answer {
      overflow: hidden;
      transition: all 0.3s ease;
      padding: 0 20px;
    }

    footer {
      background: #007bff;
      color: white;
      text-align: center;
      padding: 20px;
    }

    @media(max-width:768px){
      nav{
        flex-direction:column;
      }

      nav ul{
        margin-top:10px;
      }

      header h1{
        font-size:2rem;
      }
    }
    `,
    []
  );

  return (
    <>
      <style>{styles}</style>


      <header>
        <h1>🩺 How It Works</h1>

        <p>
          Connect with certified doctors online through our secure telemedicine platform.
        </p>
      </header>

      <div className="container">

        <section id="patients">
          <h2>👤 For Patients</h2>

          <div className="steps">
            {patientSteps.map((step) => (
              <div key={step.title} className="step">
                <img src={step.img} alt={step.alt} />

                <h3>{step.title}</h3>

                <p>{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="doctors">
          <h2>👨‍⚕️ For Doctors</h2>

          <div className="steps">
            {doctorSteps.map((step) => (
              <div key={step.title} className="step">
                <img src={step.img} alt={step.alt} />

                <h3>{step.title}</h3>

                <p>{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="faq">
          <h2>❓ Frequently Asked Questions</h2>

          {faqItems.map((item, idx) => {
            const isActive = activeIndex === idx;

            return (
              <div key={item.question} className="faq-item">

                <div
                  className="faq-question"
                  onClick={() =>
                    setActiveIndex(isActive ? null : idx)
                  }
                >
                  {item.question}
                </div>

                <div
                  className="faq-answer"
                  style={{
                    maxHeight: isActive ? '200px' : '0px',
                    padding: isActive ? '20px' : '0 20px',
                  }}
                >
                  <p>{item.answer}</p>
                </div>

              </div>
            );
          })}
        </section>

      </div>

      <footer>
        <p>© 2026 MedConnect. All rights reserved.</p>
      </footer>
    </>
  );
}