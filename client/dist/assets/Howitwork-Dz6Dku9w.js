import{r as a,j as e}from"./index-BUuOeuof.js";const p=[{img:"https://www.cleveroad.com/images/article-previews/create-a-MedConnect-app-patient-profile-3x.webp",alt:"Step 1: Create an Account",title:"Step 1: Create an Account",text:"Sign up using your email or mobile number and complete your profile with basic personal and medical information."},{img:"https://assets.humana.com/is/image/humana/AdobeStock_392711674-1",alt:"Step 2: Find the Right Doctor",title:"Step 2: Find the Right Doctor",text:"Search and choose doctors based on specialty, experience, availability, and consultation fees."},{img:"https://assets.setmore.com/website/v2/images/common-images/new-24/setmore_mockup-calendar-multidevice.png",alt:"Step 3: Book an Appointment",title:"Step 3: Book an Appointment",text:"Select a convenient date and time and choose video, audio, or chat consultation."},{img:"https://healthy-magazines.com/wp-content/uploads/2021/07/shutterstock_1763113577-1-scaled.jpg",alt:"Step 4: Make Secure Payment",title:"Step 4: Make Secure Payment",text:"Complete payment through our secure payment gateway."},{img:"https://media.istockphoto.com/id/1856641521/video/video-call-smartphone-screen-and-doctor-talking-to-patient-for-healthcare-support-virtual.jpg?s=640x640&k=20&c=ZneAKVh2r631RhvpoAWEeSZR0pdXI1li0eWOVhbXVeA=",alt:"Step 5: Online Consultation",title:"Step 5: Online Consultation",text:"Join your consultation from anywhere and get professional medical advice."},{img:"https://media.licdn.com/dms/image/v2/D4E12AQHVZcFegPCDVw/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1704873300438?e=2147483647&v=beta&t=Oltl7UB8fM9E1XwsbMo8HCMX7KLdioFbnsKaZ0-QP0Q",alt:"Step 6: Receive Digital Prescription",title:"Step 6: Receive Digital Prescription",text:"Download and access your digital prescription anytime."}],h=[{img:"https://as1.ftcdn.net/jpg/06/86/52/82/1000_F_686528205_UJaEtlon1cWvwIUX0NL13uNOIhPW8Li2.jpg",alt:"Step 1: Register & Verify",title:"Step 1: Register & Verify",text:"Doctors register by submitting credentials for verification."},{img:"http://www.customerparadigm.com/images/web-software-appointment-scheduling-system/php-open-source/open-source-appointment-scheduling-php-software/online-appointment-scheduling-system-system-settings-area.jpg",alt:"Step 2: Set Availability",title:"Step 2: Set Availability",text:"Manage schedule, consultation fees, and availability."},{img:"https://media.gettyimages.com/id/1248731764/video/online-video-call-via-smart-phone-of-male-doctor-consulting-sick-man-at-home.jpg?s=640x640&k=20&c=GovtePnfpjFueNcHnLvHDPnRw643zUSlSm8aHB-9cyE=",alt:"Step 3: Consult Patients Online",title:"Step 3: Consult Patients Online",text:"Conduct online consultations and provide prescriptions digitally."}],m=[{question:"What is MedConnect?",answer:"MedConnect allows users to consult certified doctors remotely."},{question:"Is the platform secure?",answer:"Yes, we use advanced encryption to keep all user data secure."},{question:"Can I get prescriptions online?",answer:"Yes, doctors provide digital prescriptions after consultation."}];function x(){const[c,l]=a.useState(0);a.useEffect(()=>{const t=n=>{const i=n.target;if(!i)return;const s=i.closest("a");if(!s)return;const o=s.getAttribute("href");if(!o||!o.startsWith("#"))return;n.preventDefault();const r=document.querySelector(o);r&&r.scrollIntoView({behavior:"smooth"})};return document.addEventListener("click",t),()=>{document.removeEventListener("click",t)}},[]);const d=a.useMemo(()=>`
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
    `,[]);return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:d}),e.jsxs("nav",{children:[e.jsx("div",{className:"logo",children:"MedConnect"}),e.jsxs("ul",{children:[e.jsx("li",{children:e.jsx("a",{href:"/",children:"Home"})}),e.jsx("li",{children:e.jsx("a",{href:"/features",children:"Features"})}),e.jsx("li",{children:e.jsx("a",{href:"/how-it-works",children:"How It Works"})}),e.jsx("li",{children:e.jsx("a",{href:"/contact",children:"Contact"})})]})]}),e.jsxs("header",{children:[e.jsx("h1",{children:"🩺 How It Works"}),e.jsx("p",{children:"Connect with certified doctors online through our secure telemedicine platform."})]}),e.jsxs("div",{className:"container",children:[e.jsxs("section",{id:"patients",children:[e.jsx("h2",{children:"👤 For Patients"}),e.jsx("div",{className:"steps",children:p.map(t=>e.jsxs("div",{className:"step",children:[e.jsx("img",{src:t.img,alt:t.alt}),e.jsx("h3",{children:t.title}),e.jsx("p",{children:t.text})]},t.title))})]}),e.jsxs("section",{id:"doctors",children:[e.jsx("h2",{children:"👨‍⚕️ For Doctors"}),e.jsx("div",{className:"steps",children:h.map(t=>e.jsxs("div",{className:"step",children:[e.jsx("img",{src:t.img,alt:t.alt}),e.jsx("h3",{children:t.title}),e.jsx("p",{children:t.text})]},t.title))})]}),e.jsxs("section",{id:"faq",children:[e.jsx("h2",{children:"❓ Frequently Asked Questions"}),m.map((t,n)=>{const i=c===n;return e.jsxs("div",{className:"faq-item",children:[e.jsx("div",{className:"faq-question",onClick:()=>l(i?null:n),children:t.question}),e.jsx("div",{className:"faq-answer",style:{maxHeight:i?"200px":"0px",padding:i?"20px":"0 20px"},children:e.jsx("p",{children:t.answer})})]},t.question)})]})]}),e.jsx("footer",{children:e.jsx("p",{children:"© 2026 MedConnect. All rights reserved."})})]})}export{x as default};
