import { protect } from '../middleware/auth.js';


const PYTHON_SERVICE_URL = 'http://localhost:5001';

// @desc    Analyze symptoms and predict disease
// @route   POST /api/disease/analyzeSymptoms
// @access  Private
export const analyzeSymptoms = async (req, res) => {
  try {
    const { symptoms = [], description = '' } = req.body;

    if (!symptoms || symptoms.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one symptom'
      });
    }

    // Combine symptoms and description
    const allSymptoms = [...symptoms];
    if (description.trim()) {
      allSymptoms.push(description.trim());
    }

    // Proxy to Python ML service
    const pythonPayload = {
      mode: 'symptoms',
      symptoms: allSymptoms
    };

    const pythonResponse = await fetch(`${PYTHON_SERVICE_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pythonPayload)
    });

    let predictionResult;
    if (pythonResponse.ok) {
      const pythonData = await pythonResponse.json();
      // Format Python response to match frontend expectations
      if (pythonData.predictions && pythonData.predictions.length > 0) {
        const topPrediction = pythonData.predictions[0];
        predictionResult = {
          condition: topPrediction.disease || 'Possible condition detected',
          confidence: (topPrediction.confidence || 85) / 100,
          description: topPrediction.info?.description || 'Please consult a doctor for confirmation.',
          precautions: topPrediction.info?.precautions || topPrediction.info?.foods || ['Consult doctor', 'Rest', 'Stay hydrated'],
          recommendedDoctor: topPrediction.info?.recommendedDoctor || 'General Physician'
        };
      } else {
        // Fallback mock
        const { predictDisease } = await import('../utils/medicalDataBackend.js');
        const mockResult = predictDisease(allSymptoms);
        predictionResult = {
          condition: mockResult.primaryPrediction?.disease || 'Unknown',
          confidence: mockResult.primaryPrediction?.confidence / 100 || 0.5,
          description: mockResult.primaryPrediction?.description || 'Using backup analysis.',
          precautions: ['Consult a doctor'],
          recommendedDoctor: 'General Physician'
        };
      }
    } else {
      // Python service down - fallback to mock
      console.warn('Python ML service unavailable at', PYTHON_SERVICE_URL, '- using mock predictions');
      const { predictDisease } = await import('../utils/medicalDataBackend.js');
      const mockResult = predictDisease(allSymptoms);
      predictionResult = {
        condition: mockResult.primaryPrediction?.disease || 'Analysis unavailable',
        confidence: mockResult.primaryPrediction?.confidence / 100 || 0.5,
        description: 'ML service temporarily unavailable. Using backup analysis.',
        precautions: ['Consult a doctor'],
        recommendedDoctor: 'General Physician'
      };
    }

    // Log prediction for audit (optional)
    console.log(`ML Disease prediction for symptoms [${allSymptoms.join(', ')}]: ${predictionResult.condition} (${Math.round(predictionResult.confidence * 100)}%)`);

    // Frontend expects flat response {condition, confidence, description, precautions, recommendedDoctor}
    res.status(200).json(predictionResult);
  } catch (error) {
    console.error('Error in disease analysis:', error);
    res.status(500).json({
      condition: 'Service Error',
      confidence: 0,
      description: 'Disease analysis service temporarily unavailable.',
      precautions: ['Consult a doctor immediately'],
      recommendedDoctor: 'Emergency Physician'
    });
  }
};


