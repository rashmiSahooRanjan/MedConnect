import express from 'express';
import { 
  processCustomPayment,
  getDoctorPayments 
} from '../controllers/paymentController.js';

const router = express.Router();

router.post('/process-custom', processCustomPayment);
router.get('/doctor/:doctorId', getDoctorPayments);

export default router;
