import express from 'express';
import feedbackReportsRoutes from './feedback-reports';
import bugReportsRoutes from './bug-reports';

const router = express.Router();

router.use('/api/feedback', feedbackReportsRoutes);
router.use('/api/bugs', bugReportsRoutes);

export default router;
