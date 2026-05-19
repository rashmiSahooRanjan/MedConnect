import{r as a,j as e}from"./index-BUuOeuof.js";const s=[{key:"patient",label:"Patient Dashboard"},{key:"doctor",label:"Doctor Dashboard"},{key:"consultation",label:"Video Consultation"},{key:"appointment",label:"Appointment Booking"},{key:"prescription",label:"E-Prescription"},{key:"ai",label:"AI Symptom Checker"}],l=[{key:"patient",images:[{src:"https://cdn.dribbble.com/userupload/42911857/file/original-4788ae2ebc604984b82262c597d0373b.jpg?resize=400x0",alt:"Patient Dashboard"},{src:"https://cdn.prod.website-files.com/6291f71a0e1832d37758e47d/6388b24016cbde477e3027c2_RPM%20with%20integrations.jpg",alt:"Patient Dashboard"}]},{key:"doctor",images:[{src:"https://cdn.dribbble.com/userupload/27702970/file/original-d77ba07e0fbcceb392657f8f8ea307fd.png",alt:"Doctor Dashboard"},{src:"https://www.slideteam.net/wp/wp-content/uploads/2025/07/telemedicine-platform-utilization-analysis-dashboard-1.png",alt:"Doctor Dashboard"}]},{key:"consultation",images:[{src:"https://cdn.dribbble.com/userupload/44438656/file/f243dcb0e665ad20e4fb2e1632884014.png?resize=752x&vertical=center",alt:"Video Consultation"},{src:"https://cdn.dribbble.com/userupload/45876473/file/e85c99353649ef221f11bd397a8b563a.png?resize=752x&vertical=center",alt:"Video Consultation"}]},{key:"appointment",images:[{src:"https://cdn.dribbble.com/userupload/44479019/file/891cc47dd44fcbb321bcc182aa6a54fc.jpg?resize=752x&vertical=center",alt:"Appointment Booking"}]},{key:"prescription",images:[{src:"https://ideausher.com/wp-content/uploads/2022/03/Telemedicine-App.webp",alt:"E-Prescription"}]},{key:"ai",images:[{src:"https://cdn.dribbble.com/userupload/45448190/file/f0be2d59e381373505c1048e30fa6b50.png?resize=752x&vertical=center",alt:"AI Symptom Checker"}]}];function d(){const[t,r]=a.useState("patient"),n=a.useMemo(()=>l.find(i=>i.key===t),[t]);return a.useEffect(()=>{r("patient")},[]),e.jsxs("div",{children:[e.jsx("style",{children:`
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f4f7fc;
          color: #333;
          line-height: 1.6;
        }

        nav {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          background: linear-gradient(135deg, #007bff, #00c6ff);
          padding: 15px 50px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        nav .logo {
          font-size: 1.8rem;
          font-weight: bold;
          color: white;
        }

        nav ul {
          list-style: none;
          display: flex;
          gap: 25px;
          align-items: center;
        }

        nav ul li a {
          color: white;
          text-decoration: none;
          font-size: 1rem;
        }

        header {
          background: linear-gradient(135deg, #007bff, #00c6ff);
          color: white;
          padding: 120px 20px 80px;
          text-align: center;
        }

        header h1 {
          font-size: 3rem;
          margin-bottom: 20px;
        }

        .container {
          max-width: 1300px;
          margin: auto;
          padding: 40px 20px;
        }

        h2 {
          text-align: center;
          color: #007bff;
          margin-bottom: 30px;
        }

        .tab-buttons {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 40px;
        }

        .tab-btn {
          padding: 12px 25px;
          border: none;
          border-radius: 40px;
          cursor: pointer;
          background: #e9ecef;
          transition: 0.3s;
          font-size: 1rem;
        }

        .tab-btn.active,
        .tab-btn:hover {
          background: #007bff;
          color: white;
        }

        .demo-gallery {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 25px;
        }

        .demo-img {
          width: 100%;
          border-radius: 16px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
          transition: transform 0.3s ease;
        }

        .demo-img:hover {
          transform: scale(1.03);
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
          margin-top: 30px;
        }

        .feature-card {
          background: white;
          padding: 30px;
          border-radius: 16px;
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
        }

        .feature-card h3 {
          color: #007bff;
          margin-bottom: 15px;
        }

        .feature-card ul {
          list-style: none;
          padding: 0;
        }

        .feature-card li {
          padding: 10px 0;
          padding-left: 25px;
          position: relative;
        }

        .feature-card li::before {
          content: "✓";
          position: absolute;
          left: 0;
          color: #00c6ff;
          font-weight: bold;
        }

        footer {
          background: #333;
          color: white;
          text-align: center;
          padding: 30px;
          margin-top: 60px;
        }

        @media(max-width:768px) {
          nav {
            flex-direction: column;
            padding: 15px;
          }

          nav ul {
            flex-wrap: wrap;
            justify-content: center;
            padding: 0;
          }

          header h1 {
            font-size: 2rem;
          }
        }
      `}),e.jsxs("nav",{children:[e.jsxs("div",{className:"logo",children:["Med",e.jsx("span",{children:"Connect"})]}),e.jsxs("ul",{children:[e.jsx("li",{children:e.jsx("a",{href:"/",children:"Home"})}),e.jsx("li",{children:e.jsx("a",{href:"/features",children:"Features"})}),e.jsx("li",{children:e.jsx("a",{href:"/how-it-works",children:"How It Works"})}),e.jsx("li",{children:e.jsx("a",{href:"/reviews",children:"Reviews"})}),e.jsx("li",{children:e.jsx("a",{href:"/contact",children:"Contact"})})]})]}),e.jsxs("header",{children:[e.jsx("h1",{children:"Med Connect Features"}),e.jsx("p",{children:"Experience a modern, secure, and intuitive telemedicine platform designed for doctors and patients."})]}),e.jsxs("div",{className:"container",children:[e.jsxs("section",{children:[e.jsx("h2",{children:"Interactive App Demo Gallery"}),e.jsx("div",{className:"tab-buttons",children:s.map(i=>e.jsx("button",{className:`tab-btn ${t===i.key?"active":""}`,onClick:()=>r(i.key),children:i.label},i.key))}),e.jsx("div",{className:"demo-gallery",children:n&&n.images.map(i=>e.jsx("img",{src:i.src,alt:i.alt,className:"demo-img"},i.src))})]}),e.jsxs("section",{children:[e.jsx("h2",{children:"User Management"}),e.jsxs("div",{className:"features-grid",children:[e.jsxs("div",{className:"feature-card",children:[e.jsx("h3",{children:"Patient & Doctor Onboarding"}),e.jsxs("ul",{children:[e.jsx("li",{children:"Patient Registration & Login"}),e.jsx("li",{children:"Doctor Registration & Verification"})]})]}),e.jsxs("div",{className:"feature-card",children:[e.jsx("h3",{children:"Profile Management"}),e.jsxs("ul",{children:[e.jsx("li",{children:"Personal Information"}),e.jsx("li",{children:"Medical History"})]})]})]})]}),e.jsxs("section",{children:[e.jsx("h2",{children:"Online Consultation"}),e.jsxs("div",{className:"features-grid",children:[e.jsxs("div",{className:"feature-card",children:[e.jsx("h3",{children:"Consultation Features"}),e.jsxs("ul",{children:[e.jsx("li",{children:"Video Consultation"}),e.jsx("li",{children:"Audio Consultation"}),e.jsx("li",{children:"Chat Consultation"}),e.jsx("li",{children:"Consultation History"})]})]}),e.jsxs("div",{className:"feature-card",children:[e.jsx("h3",{children:"Scheduling"}),e.jsxs("ul",{children:[e.jsx("li",{children:"Appointment Scheduling"}),e.jsx("li",{children:"Doctor Availability Calendar"})]})]})]})]}),e.jsxs("section",{children:[e.jsx("h2",{children:"Medical Records"}),e.jsx("div",{className:"features-grid",children:e.jsx("div",{className:"feature-card",children:e.jsxs("ul",{children:[e.jsx("li",{children:"Upload Medical Reports"}),e.jsx("li",{children:"View Prescriptions"}),e.jsx("li",{children:"Download Reports"}),e.jsx("li",{children:"Secure Record Storage"})]})})})]}),e.jsxs("section",{children:[e.jsx("h2",{children:"Advanced Features"}),e.jsx("div",{className:"features-grid",children:e.jsx("div",{className:"feature-card",children:e.jsxs("ul",{children:[e.jsx("li",{children:"AI Symptom Checker"}),e.jsx("li",{children:"Health Chatbot"}),e.jsx("li",{children:"Appointment Notifications"}),e.jsx("li",{children:"Payment Integration"}),e.jsx("li",{children:"Mobile Responsive Design"})]})})})]})]}),e.jsx("footer",{children:e.jsx("p",{children:"© 2026 Med Connect. All rights reserved."})})]})}export{d as default};
