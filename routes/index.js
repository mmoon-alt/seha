import express from 'express';
import apiRoutes from './apiRoutes.js';

const router = express.Router();

// تعريف المسارات هنا
router.get('/', (req, res) => {
  res.send('Welcome to the API!');
});

// استخدام apiRoutes
router.use('/api', apiRoutes);

export default router;

