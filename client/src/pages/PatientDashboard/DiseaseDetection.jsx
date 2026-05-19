import { useState } from 'react';

const DiseaseDetection = () => {
  const [symptoms, setSymptoms] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

const handleAnalyze = async () => {
    if (!symptoms.trim()) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const token = localStorage.getItem('patientToken') || localStorage.getItem('token');
      if (!token) {
        setError('Please log in to analyze symptoms');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/diseases/analyzeSymptoms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ symptoms: symptoms.trim() })
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('patientData');
          localStorage.removeItem('patientToken');
          window.location.href = '/patient/signin';
          return;
        }
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      setResult({
        condition: data.condition || 'Analysis Complete',
        confidence: `${Math.round(data.confidence * 100)}%`,
        description: data.description || 'Please consult with a healthcare professional for accurate diagnosis.',
        precautions: data.precautions || ['Consult a doctor for professional advice'],
        recommendedDoctor: data.recommendedDoctor || 'General Physician'
      });
    } catch (error) {
      console.error('Analysis error:', error);
      setError('Failed to analyze symptoms. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-home">
      <div className="disease-detection-container">
        <div className="disease-header">
          <h2>AI-Powered Disease Detection</h2>
          <p>Enter your symptoms for an instant health analysis</p>
        </div>

        <div className="disease-input-section">
          <div className="symptom-tags">
            {['Fever', 'Cough', 'Headache', 'Fatigue', 'Body Ache', 'Sore Throat', 'Nausea'].map((tag) => (
              <button 
                key={tag} 
                className="symptom-tag"
                onClick={() => setSymptoms(prev => prev ? `${prev}, ${tag}` : tag)}
              >
                {tag}
              </button>
            ))}
          </div>

          <textarea
            className="symptom-textarea"
            placeholder="Describe your symptoms in detail..."
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            rows={4}
          />

          <button 
            className="btn-analyze"
            onClick={handleAnalyze}
            disabled={loading || !symptoms.trim()}
          >
            {loading ? 'Analyzing...' : 'Analyze Symptoms'}
          </button>
        </div>

        {error && (
          <div className="disease-error">
            <div className="error-icon">⚠️</div>
            <p>{error}</p>
            <button className="btn-secondary" onClick={() => {setError(null); setResult(null);}}>
              Try Again
            </button>
          </div>
        )}

        {result && !error && (
          <div className="disease-result">
            <div className="result-header">
              <h3>Analysis Result</h3>
              <span className="confidence-badge">{result.confidence} Confidence</span>
            </div>
            
            <div className="result-condition">
              <h4>{result.condition}</h4>
              <p>{result.description}</p>
            </div>

            <div className="result-precautions">
              <h4>Recommended Precautions</h4>
              <ul>
                {result.precautions.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="result-doctor">
              <p>Consult: <strong>{result.recommendedDoctor}</strong></p>
              <button className="btn-book">Book Appointment</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiseaseDetection;

