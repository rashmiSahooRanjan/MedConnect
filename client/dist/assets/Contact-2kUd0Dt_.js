import{r as t,j as e,L as i}from"./index-BUuOeuof.js";function w(){const[n,c]=t.useState("patient"),[d,u]=t.useState([]),[m,x]=t.useState([]),[a,p]=t.useState(!1),[o,g]=t.useState("patient");t.useEffect(()=>{const r=window.location.search,l=window.location.hash.replace("#","");if(r.includes("success=true")){const s=l==="doctor"?"doctor":"patient";g(s),c(s),p(!0),window.history.replaceState(null,"",`${window.location.pathname}#${s}`)}},[]);const j=t.useMemo(()=>d.length?e.jsx("ul",{children:d.map(r=>e.jsx("li",{children:r},r))}):e.jsx("em",{children:"No files selected"}),[d]),v=t.useMemo(()=>m.length?e.jsx("ul",{children:m.map(r=>e.jsx("li",{children:r},r))}):e.jsx("em",{children:"No files selected"}),[m]),h=(r,l)=>{const s=r.target.files;if(!s){l==="patient"?u([]):x([]);return}const b=Array.from(s).map(f=>`${f.name} (${(f.size/1024).toFixed(1)} KB)`);l==="patient"?u(b):x(b)};return e.jsxs("div",{children:[e.jsx("style",{children:`
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
      `}),e.jsxs("div",{className:"container",children:[e.jsxs("div",{className:"page-nav",children:[e.jsx(i,{className:"brand",to:"/",children:"MedConnect"}),e.jsxs("div",{className:"page-nav-links",children:[e.jsx(i,{className:"nav-link",to:"/",children:"Home"}),e.jsx(i,{className:"nav-link",to:"/features",children:"Feature"}),e.jsx(i,{className:"nav-link",to:"/how-it-works",children:"How It Work"}),e.jsx(i,{className:"nav-link",to:"/reviews",children:"Review"}),e.jsx(i,{className:"nav-link active",to:"/contact",children:"Contact"})]})]}),e.jsxs("header",{children:[e.jsx("h1",{children:"📞 Contact Us"}),e.jsx("p",{children:"We’re here to help patients and doctors with any questions or support needs."})]}),e.jsxs("div",{className:"tabs",children:[e.jsx("button",{type:"button",className:`tab-btn ${n==="patient"?"active":""}`,onClick:()=>{p(!1),c("patient")},children:"Patient Support"}),e.jsx("button",{type:"button",className:`tab-btn ${n==="doctor"?"active":""}`,onClick:()=>{p(!1),c("doctor")},children:"Doctor Support"})]}),n==="patient"&&e.jsxs("div",{className:"form-card",children:[e.jsx("p",{className:"form-intro",children:"Contact our patient support team and we’ll get back to you shortly."}),!a||o!=="patient"?e.jsxs("form",{action:"https://formspree.io/f/mkobogyl?success=true#patient",method:"POST",children:[e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"Full Name"}),e.jsx("input",{type:"text",name:"Full Name",required:!0})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"Email Address"}),e.jsx("input",{type:"email",name:"Email",required:!0})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"Mobile Number"}),e.jsx("input",{type:"tel",name:"Mobile Number",required:!0})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"Subject"}),e.jsxs("select",{required:!0,children:[e.jsx("option",{value:"",children:"Select subject"}),e.jsx("option",{children:"Appointment Issue"}),e.jsx("option",{children:"Payment Problem"}),e.jsx("option",{children:"Technical Support"}),e.jsx("option",{children:"General Inquiry"})]})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"Message"}),e.jsx("textarea",{required:!0})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"Attach Files"}),e.jsx("input",{type:"file",multiple:!0,onChange:r=>h(r,"patient")}),e.jsx("small",{children:"Max ~1MB total on free plan"}),e.jsx("div",{className:"file-list",children:j})]}),e.jsx("button",{type:"submit",className:"submit-btn",children:"Send Message"})]}):null,a&&o==="patient"?e.jsxs("div",{className:"success-msg",children:[e.jsx("strong",{children:"Thank you!"}),e.jsx("br",{}),"Your query has been sent."]}):null]}),n==="doctor"&&e.jsxs("div",{className:"form-card",children:[e.jsx("p",{className:"form-intro",children:"Doctors can reach out for profile verification, payments, or technical assistance."}),!a||o!=="doctor"?e.jsxs("form",{action:"https://formspree.io/f/mkobogyl?success=true#doctor",method:"POST",children:[e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"Doctor Name"}),e.jsx("input",{type:"text",required:!0})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"Registered Email"}),e.jsx("input",{type:"email",required:!0})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"Doctor ID"}),e.jsx("input",{type:"text",required:!0})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"Subject"}),e.jsxs("select",{required:!0,children:[e.jsx("option",{value:"",children:"Select subject"}),e.jsx("option",{children:"Profile Verification"}),e.jsx("option",{children:"Payment & Payout"}),e.jsx("option",{children:"Technical Issue"}),e.jsx("option",{children:"Schedule Management"})]})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"Message"}),e.jsx("textarea",{required:!0})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"Attach Files"}),e.jsx("input",{type:"file",multiple:!0,onChange:r=>h(r,"doctor")}),e.jsx("small",{children:"Max ~1MB total on free plan"}),e.jsx("div",{className:"file-list",children:v})]}),e.jsx("button",{type:"submit",className:"submit-btn",children:"Contact Support"})]}):null,a&&o==="doctor"?e.jsxs("div",{className:"success-msg",children:[e.jsx("strong",{children:"Thank you!"}),e.jsx("br",{}),"Your query has been sent."]}):null]}),e.jsxs("div",{className:"contact-info",children:[e.jsxs("p",{children:["Email:",e.jsx("strong",{children:"support@onlinemedcare.com"})]}),e.jsxs("p",{children:["Phone:",e.jsx("strong",{children:"+91 98765 43210"})]}),e.jsxs("p",{children:["Support Hours:",e.jsx("strong",{children:"9:00 AM – 6:00 PM (Mon–Sat)"})]})]}),e.jsx("div",{className:"emergency",children:"🚨 This platform is not for medical emergencies. Please contact your nearest hospital in case of emergency."})]})]})}export{w as default};
