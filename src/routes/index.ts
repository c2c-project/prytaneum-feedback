import express from 'express';
import feedbackReportsRoutes from './feedback-reports/feedback-reports';
import bugReportsRoutes from './bug-reports/bug-reports';

const router = express.Router();
router.get('/hello-world', (req, res) => res.send('Hello world!'));

router.use('/feedback', feedbackReportsRoutes);
router.use('/bugs', bugReportsRoutes);

export default router;
