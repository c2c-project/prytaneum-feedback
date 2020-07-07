import express from 'express';
import feedbackReportsRoutes from './feedback-reports';
import bugReportsRoutes from './bug-reports';

const router = express.Router();

router.use('/feedback', feedbackReportsRoutes);
router.use('/bugs', bugReportsRoutes);

export default router;
