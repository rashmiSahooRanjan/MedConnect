import{r,u as L,j as e,L as P}from"./index-BUuOeuof.js";const f=[{id:1,stars:5,title:"Excellent Consultation",text:"Dr. Sharma was very attentive and explained everything clearly. Highly recommend!",reviewer:"Rahul S.",reviewerId:"PAT-1024",reviewerImg:"https://media.istockphoto.com/id/1402125957/photo/portrait-of-handsome-smart-indian-professional-therapist-in-medical-uniform-and-stethoscope.jpg?s=612x612&w=0&k=20&c=7_Jk-OXSUvy0ki4W3QQJyS_AxTtAdNJlrDaueDXQu84=",target:"Dr. Anjali Sharma (DOC-784512)",date:"15 Dec 2025",type:"patient"},{id:2,stars:4,title:"Good Experience",text:"Quick response and helpful advice. Video quality was great.",reviewer:"Priya M.",reviewerId:"PAT-2048",reviewerImg:"https://media.istockphoto.com/id/1175131167/photo/portrait-of-an-indian-woman-with-cancer-and-her-doctor.jpg?s=612x612&w=0&k=20&c=15FJDj5X4hla5DjAuK3WWLFJ1FfTd0zn-OkaCG2e6Eg=",target:"Dr. Vikram Singh (DOC-563214)",date:"20 Dec 2025",type:"patient"},{id:3,stars:5,title:"Best Doctor",text:"Very professional and caring. Solved my issue immediately.",reviewer:"Amit K.",reviewerId:"PAT-3096",reviewerImg:"https://c8.alamy.com/comp/2HBAKGX/portrait-of-positive-young-indian-male-doctor-doing-thumbs-up-while-sitting-at-desk-outdoor-village-hospital-with-lots-of-medicine-around-looking-at-2HBAKGX.jpg",target:"Dr. Anjali Sharma (DOC-784512)",date:"25 Dec 2025",type:"patient"},{id:4,stars:3,title:"Average Service",text:"Doctor was okay, but wait time was long.",reviewer:"Neha R.",reviewerId:"PAT-4152",reviewerImg:"https://as2.ftcdn.net/jpg/03/66/06/71/1000_F_366067105_VQPjB0tBIU3pu7H2Cbt7HcPXX74Ve79z.jpg",target:"Dr. Vikram Singh (DOC-563214)",date:"10 Dec 2025",type:"patient"},{id:5,stars:1,title:"Not Satisfied",text:"Doctor seemed rushed and didn’t listen properly.",reviewer:"Rohan P.",reviewerId:"PAT-5201",reviewerImg:"https://www.shutterstock.com/image-photo/indian-asian-senior-male-patient-260nw-2596976387.jpg",target:"Dr. Anjali Sharma (DOC-784512)",date:"05 Dec 2025",type:"patient"}];function F(){const[i,g]=r.useState("patient"),[o,b]=r.useState(0),[d,j]=r.useState(""),[p,y]=r.useState(""),[N,m]=r.useState(0),[k,h]=r.useState(""),[S,u]=r.useState(""),[D,v]=r.useState(""),C=L(),l=r.useMemo(()=>f.filter(t=>t.type===i),[i]),w=r.useMemo(()=>{const t=l.length,c=l.reduce((a,x)=>a+x.stars,0),s=t===0?0:Number((c/t).toFixed(1)),n=[0,0,0,0,0];return l.forEach(a=>{n[a.stars-1]+=1}),{avg:s,total:t,dist:n}},[l]),I=r.useMemo(()=>f.filter(t=>{const c=t.type===i,s=o===0||t.stars===o,n=d.trim().toLowerCase(),a=p.trim().toLowerCase(),x=!n||t.reviewer.toLowerCase().includes(n)||t.target.toLowerCase().includes(n),z=!a||t.reviewerId.toLowerCase().includes(a)||t.target.toLowerCase().includes(a);return c&&s&&x&&z}),[i,o,d,p]),R=[0,5,4,3,2,1],A=t=>{t.preventDefault(),m(0),h(""),u(""),v(""),alert("Thank you for your review!")},T=t=>Array.from({length:5},(c,s)=>e.jsx("i",{className:s<t?"fas fa-star":"far fa-star"},s));return e.jsxs("div",{className:"container",children:[e.jsx("style",{children:`
        body {
          font-family: Arial, sans-serif;
          background: #f4f7fa;
          margin: 0;
          padding: 0;
        }

        .container {
          max-width: 1200px;
          margin: auto;
          padding: 20px;
        }

        .page-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 0;
        }

        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #3498db;
        }

        .nav-links {
          display: flex;
          gap: 20px;
        }

        .nav-link {
          text-decoration: none;
          color: #333;
          font-weight: 600;
        }

        .nav-link.active {
          color: #3498db;
        }

        .page-header {
          text-align: center;
          margin: 40px 0;
        }

        .page-header h1 {
          font-size: 42px;
        }

        .user-toggle {
          text-align: center;
          margin-bottom: 30px;
        }

        .user-toggle button {
          padding: 12px 25px;
          margin: 0 10px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
        }

        .user-toggle button.active {
          background: #3498db;
          color: white;
        }

        .analytics {
          background: white;
          padding: 25px;
          border-radius: 12px;
          margin-bottom: 30px;
          text-align: center;
        }

        .avg-rating {
          font-size: 50px;
          color: #f39c12;
        }

        .filters {
          display: flex;
          gap: 20px;
          margin-bottom: 30px;
        }

        .filter-group {
          flex: 1;
        }

        .filter-group input {
          width: 100%;
          padding: 10px;
          border-radius: 8px;
          border: 1px solid #ccc;
        }

        .star-filter {
          text-align: center;
          margin-bottom: 30px;
        }

        .star-filter button {
          margin: 5px;
          padding: 10px 20px;
          border: none;
          border-radius: 30px;
          cursor: pointer;
        }

        .star-filter .active {
          background: #f39c12;
          color: white;
        }

        .reviews-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 25px;
        }

        .review-card {
          background: white;
          padding: 25px;
          border-radius: 14px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .review-header {
          display: flex;
          align-items: center;
          margin-bottom: 15px;
        }

        .review-header img {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          object-fit: cover;
          margin-right: 15px;
        }

        .reviewer-name {
          font-size: 20px;
          font-weight: bold;
        }

        .stars {
          color: #f39c12;
          margin: 10px 0;
        }

        .review-title {
          font-size: 22px;
        }

        .review-text {
          color: #555;
          line-height: 1.6;
        }

        .write-review {
          margin-top: 50px;
          background: linear-gradient(
            135deg,
            #667eea,
            #764ba2
          );
          padding: 40px;
          border-radius: 14px;
          color: white;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 12px;
          border-radius: 8px;
          border: none;
          margin-top: 8px;
        }

        .star-rating i {
          font-size: 32px;
          margin-right: 10px;
          cursor: pointer;
          color: #ddd;
        }

        .star-rating i.active {
          color: #f39c12;
        }

        .submit-btn {
          padding: 14px 30px;
          border: none;
          border-radius: 30px;
          background: #f39c12;
          color: white;
          cursor: pointer;
          font-size: 18px;
        }
      `}),e.jsxs("header",{className:"page-nav",children:[e.jsx("div",{className:"logo",children:"Medconnect"}),e.jsx("div",{className:"nav-links",children:[{to:"/",label:"Home"},{to:"/features",label:"Feature"},{to:"/how-it-works",label:"How It Work"},{to:"/reviews",label:"Review"},{to:"/contact",label:"Contact"}].map(t=>e.jsx(P,{to:t.to,className:`nav-link ${C.pathname===t.to?"active":""}`,children:t.label},t.to))})]}),e.jsxs("header",{className:"page-header",children:[e.jsx("h1",{children:"⭐ Reviews & Ratings"}),e.jsx("p",{children:"Transparent feedback from both patients and doctors"})]}),e.jsxs("div",{className:"user-toggle",children:[e.jsx("button",{className:i==="patient"?"active":"",onClick:()=>g("patient"),children:"I am a Patient"}),e.jsx("button",{className:i==="doctor"?"active":"",onClick:()=>g("doctor"),children:"I am a Doctor"})]}),e.jsxs("section",{className:"analytics",children:[e.jsx("h3",{children:"Review Analytics"}),e.jsxs("div",{className:"avg-rating",children:[w.avg," / 5"]}),e.jsxs("div",{children:["Based on ",w.total," reviews"]})]}),e.jsxs("section",{className:"filters",children:[e.jsxs("div",{className:"filter-group",children:[e.jsx("label",{children:"Search Name"}),e.jsx("input",{type:"text",placeholder:"Enter name",value:d,onChange:t=>j(t.target.value)})]}),e.jsxs("div",{className:"filter-group",children:[e.jsx("label",{children:"Search ID"}),e.jsx("input",{type:"text",placeholder:"Enter ID",value:p,onChange:t=>y(t.target.value)})]})]}),e.jsx("div",{className:"star-filter",children:R.map(t=>e.jsx("button",{className:o===t?"active":"",onClick:()=>b(t),children:t===0?"All Reviews":`${t} Stars`},t))}),e.jsx("section",{className:"reviews-grid",children:I.map(t=>e.jsxs("div",{className:"review-card",children:[e.jsxs("div",{className:"review-header",children:[e.jsx("img",{src:t.reviewerImg,alt:t.reviewer}),e.jsxs("div",{children:[e.jsx("div",{className:"reviewer-name",children:t.reviewer}),e.jsx("div",{children:t.reviewerId})]})]}),e.jsx("div",{className:"stars",children:T(t.stars)}),e.jsx("h3",{className:"review-title",children:t.title}),e.jsx("p",{className:"review-text",children:t.text}),e.jsxs("div",{children:["Reviewed"," ",e.jsx("strong",{children:t.target}),e.jsx("br",{}),t.date]})]},t.id))}),e.jsxs("section",{className:"write-review",children:[e.jsx("h2",{children:"Leave a Review"}),e.jsxs("form",{onSubmit:A,children:[e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"Doctor Name & ID"}),e.jsx("input",{type:"text",value:k,onChange:t=>h(t.target.value),required:!0})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"Rate Experience"}),e.jsx("div",{className:"star-rating",children:[1,2,3,4,5].map(t=>e.jsx("i",{className:`fas fa-star ${N>=t?"active":""}`,onClick:()=>m(t)},t))})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"Review Title"}),e.jsx("input",{type:"text",value:S,onChange:t=>u(t.target.value),required:!0})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"Your Feedback"}),e.jsx("textarea",{rows:"5",value:D,onChange:t=>v(t.target.value),required:!0})]}),e.jsx("button",{className:"submit-btn",type:"submit",children:"Submit Review"})]})]})]})}export{F as default};
