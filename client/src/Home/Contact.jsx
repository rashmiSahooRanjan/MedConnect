import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

export default function Contact() {
  const [activeTab, setActiveTab] = useState("patient");

  const [patientFiles, setPatientFiles] = useState([]);

  const [doctorFiles, setDoctorFiles] = useState([]);

  const [showSuccess, setShowSuccess] = useState(false);

  const [successTab, setSuccessTab] = useState("patient");

  useEffect(() => {
    const search = window.location.search;

    const hash = window.location.hash.replace("#", "");

    if (search.includes("success=true")) {
      const nextTab =
        hash === "doctor" ? "doctor" : "patient";

      setSuccessTab(nextTab);

      setActiveTab(nextTab);

      setShowSuccess(true);

      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}#${nextTab}`
      );
    }
  }, []);

  const patientFileList = useMemo(() => {
    if (!patientFiles.length) {
      return <em>No files selected</em>;
    }

    return (
      <ul>
        {patientFiles.map((file) => (
          <li key={file}>{file}</li>
        ))}
      </ul>
    );
  }, [patientFiles]);

  const doctorFileList = useMemo(() => {
    if (!doctorFiles.length) {
      return <em>No files selected</em>;
    }

    return (
      <ul>
        {doctorFiles.map((file) => (
          <li key={file}>{file}</li>
        ))}
      </ul>
    );
  }, [doctorFiles]);

  const handleFileChange = (event, type) => {
    const files = event.target.files;

    if (!files) {
      if (type === "patient") {
        setPatientFiles([]);
      } else {
        setDoctorFiles([]);
      }

      return;
    }

    const fileNames = Array.from(files).map(
      (file) =>
        `${file.name} (${(
          file.size / 1024
        ).toFixed(1)} KB)`
    );

    if (type === "patient") {
      setPatientFiles(fileNames);
    } else {
      setDoctorFiles(fileNames);
    }
  };

  return (
    <div>
      <style>{`
        :root {
          --primary: #2563eb;
          --primary-dark: #1d4ed8;
          --gray: #f3f4f6;
          --text: #1f2937;
          --success: #10b981;
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: 'Roboto', sans-serif;
          background-color: #f9fafb;
          color: var(--text);
          line-height: 1.6;
        }

        .container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }

        .page-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .brand {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--primary);
          text-decoration: none;
        }

        .page-nav-links {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          align-items: center;
        }

        .nav-link {
          color: #4b5563;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.25s;
        }

        .nav-link:hover,
        .nav-link.active {
          color: var(--primary);
        }

        header {
          text-align: center;
          margin-bottom: 3rem;
        }

        header h1 {
          font-size: 2.5rem;
          color: var(--primary);
          margin-bottom: 0.5rem;
        }

        header p {
          font-size: 1.1rem;
          color: #4b5563;
          max-width: 700px;
          margin: 0 auto;
        }

        .tabs {
          display: flex;
          justify-content: center;
          margin-bottom: 2rem;
          border-bottom: 2px solid #e5e7eb;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .tab-btn {
          padding: 1rem 2rem;
          background: none;
          border: none;
          font-size: 1.1rem;
          cursor: pointer;
          color: #6b7280;
          position: relative;
          transition: color 0.3s;
        }

        .tab-btn.active {
          color: var(--primary);
          font-weight: 500;
        }

        .tab-btn.active::after {
          content: "";
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 100%;
          height: 3px;
          background: var(--primary);
        }

        .form-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          padding: 2rem;
          max-width: 700px;
          margin: 0 auto 3rem;
        }

        .form-intro {
          text-align: center;
          margin-bottom: 2rem;
          color: #4b5563;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #374151;
        }

        input,
        select,
        textarea {
          width: 100%;
          padding: 0.85rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 1rem;
        }

        input:focus,
        select:focus,
        textarea:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        textarea {
          min-height: 120px;
          resize: vertical;
        }

        input[type="file"] {
          padding: 0.5rem 0;
          border: none;
          background: none;
        }

        .file-list {
          margin-top: 0.5rem;
          font-size: 0.9rem;
          color: #4b5563;
        }

        .file-list ul {
          margin-top: 0.5rem;
          padding-left: 1.2rem;
        }

        small {
          display: block;
          margin-top: 0.4rem;
          color: #6b7280;
          font-size: 0.9rem;
        }

        .submit-btn {
          background: var(--primary);
          color: white;
          padding: 0.9rem 2rem;
          border: none;
          border-radius: 8px;
          font-size: 1.1rem;
          cursor: pointer;
          margin-top: 1rem;
          transition: background 0.3s;
        }

        .submit-btn:hover {
          background: var(--primary-dark);
        }

        .success-msg {
          background: var(--success);
          color: white;
          padding: 2rem;
          border-radius: 12px;
          margin-top: 2rem;
          font-size: 1.2rem;
          text-align: center;
        }

        .contact-info {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          padding: 2rem;
          max-width: 700px;
          margin: 3rem auto;
          text-align: center;
        }

        .contact-info p {
          margin-bottom: 1rem;
          font-size: 1.1rem;
        }

        .emergency {
          background: #fee2e2;
          border: 1px solid #fecaca;
          color: #991b1b;
          padding: 1.5rem;
          border-radius: 12px;
          text-align: center;
          max-width: 800px;
          margin: 3rem auto;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .tabs {
            flex-direction: column;
          }

          .tab-btn {
            width: 100%;
          }

          .form-card,
          .contact-info {
            padding: 1.5rem;
          }

          header h1 {
            font-size: 2rem;
          }
        }
      `}</style>



        <header>
          <h1>📞 Contact Us</h1>

          <p>
            We’re here to help patients and
            doctors with any questions or
            support needs.
          </p>
        </header>

        <div className="tabs">
          <button
            type="button"
            className={`tab-btn ${
              activeTab === "patient"
                ? "active"
                : ""
            }`}
            onClick={() => {
              setShowSuccess(false);
              setActiveTab("patient");
            }}
          >
            Patient Support
          </button>

          <button
            type="button"
            className={`tab-btn ${
              activeTab === "doctor"
                ? "active"
                : ""
            }`}
            onClick={() => {
              setShowSuccess(false);
              setActiveTab("doctor");
            }}
          >
            Doctor Support
          </button>
        </div>

        {activeTab === "patient" && (
          <div className="form-card">
            <p className="form-intro">
              Contact our patient support
              team and we’ll get back to you
              shortly.
            </p>

            {!showSuccess ||
            successTab !== "patient" ? (
              <form
                action="https://formspree.io/f/mkobogyl?success=true#patient"
                method="POST"
              >
                <div className="form-group">
                  <label>Full Name</label>

                  <input
                    type="text"
                    name="Full Name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email Address</label>

                  <input
                    type="email"
                    name="Email"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Mobile Number</label>

                  <input
                    type="tel"
                    name="Mobile Number"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Subject</label>

                  <select required>
                    <option value="">
                      Select subject
                    </option>

                    <option>
                      Appointment Issue
                    </option>

                    <option>
                      Payment Problem
                    </option>

                    <option>
                      Technical Support
                    </option>

                    <option>
                      General Inquiry
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Message</label>

                  <textarea required />
                </div>

                <div className="form-group">
                  <label>
                    Attach Files
                  </label>

                  <input
                    type="file"
                    multiple
                    onChange={(event) =>
                      handleFileChange(
                        event,
                        "patient"
                      )
                    }
                  />

                  <small>
                    Max ~1MB total on free
                    plan
                  </small>

                  <div className="file-list">
                    {patientFileList}
                  </div>
                </div>

                <button
                  type="submit"
                  className="submit-btn"
                >
                  Send Message
                </button>
              </form>
            ) : null}

            {showSuccess &&
            successTab === "patient" ? (
              <div className="success-msg">
                <strong>Thank you!</strong>
                <br />
                Your query has been sent.
              </div>
            ) : null}
          </div>
        )}

        {activeTab === "doctor" && (
          <div className="form-card">
            <p className="form-intro">
              Doctors can reach out for
              profile verification, payments,
              or technical assistance.
            </p>

            {!showSuccess ||
            successTab !== "doctor" ? (
              <form
                action="https://formspree.io/f/mkobogyl?success=true#doctor"
                method="POST"
              >
                <div className="form-group">
                  <label>Doctor Name</label>

                  <input
                    type="text"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Registered Email
                  </label>

                  <input
                    type="email"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Doctor ID
                  </label>

                  <input
                    type="text"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Subject</label>

                  <select required>
                    <option value="">
                      Select subject
                    </option>

                    <option>
                      Profile Verification
                    </option>

                    <option>
                      Payment & Payout
                    </option>

                    <option>
                      Technical Issue
                    </option>

                    <option>
                      Schedule Management
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Message</label>

                  <textarea required />
                </div>

                <div className="form-group">
                  <label>
                    Attach Files
                  </label>

                  <input
                    type="file"
                    multiple
                    onChange={(event) =>
                      handleFileChange(
                        event,
                        "doctor"
                      )
                    }
                  />

                  <small>
                    Max ~1MB total on free
                    plan
                  </small>

                  <div className="file-list">
                    {doctorFileList}
                  </div>
                </div>

                <button
                  type="submit"
                  className="submit-btn"
                >
                  Contact Support
                </button>
              </form>
            ) : null}

            {showSuccess &&
            successTab === "doctor" ? (
              <div className="success-msg">
                <strong>Thank you!</strong>
                <br />
                Your query has been sent.
              </div>
            ) : null}
          </div>
        )}

        <div className="contact-info">
          <p>
            Email:
            <strong>
              support@onlinemedcare.com
            </strong>
          </p>

          <p>
            Phone:
            <strong>
              +91 98765 43210
            </strong>
          </p>

          <p>
            Support Hours:
            <strong>
              9:00 AM – 6:00 PM (Mon–Sat)
            </strong>
          </p>
        </div>

        <div className="emergency">
          🚨 This platform is not for
          medical emergencies. Please
          contact your nearest hospital in
          case of emergency.
        </div>
      </div>
    
  );
};