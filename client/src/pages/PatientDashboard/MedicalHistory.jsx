import { useState, useEffect } from 'react';
import ActivityHistory from './ActivityHistory';
import './patient dashboard css/medicalhistory.css';

const MedicalHistory = ({ patientData }) => (
  <div className="medical-history">
    <ActivityHistory patientData={patientData} />
  </div>
);

export default MedicalHistory;

