import { useEffect, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';

const DoctorAuthGuard = () => {
  const navigate = useNavigate();
  const [doctorData, setDoctorData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedData = localStorage.getItem('doctorData');
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        setDoctorData(parsed);
      } catch (e) {
        localStorage.removeItem('doctorData');
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div style={{padding: '4rem', textAlign: 'center'}}>Checking authentication...</div>;
  }

  if (!doctorData) {
    navigate('/doctor/signin');
    return null;
  }

  return <Outlet context={{ doctorData }} />;
};

export default DoctorAuthGuard;

