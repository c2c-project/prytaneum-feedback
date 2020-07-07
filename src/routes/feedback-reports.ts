import express from 'express';
import { FeedbackReport } from '../db/feedback-reports';
import { createReport, getReports } from '../modules/feedback-reports';

const router = express.Router();

router.post('/create-report', async (req, res) => {
    try {
        const feedbackReport = req.body as Partial<FeedbackReport>;
        await createReport(feedbackReport);
        res.statusMessage = 'Feedback successfully submitted';
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.statusMessage = 'Some error occurred. Please try again';
        res.sendStatus(400);
    }
});

router.get('/get-reports', async (req, res) => {
    // TO OD: THIS API CAN ONLY BE CALLED FROM THE ADMIN MICRO SERVICE
    try {
        const feedbackReports = await getReports();
        res.statusCode = 200;
        res.send({ reports: feedbackReports });
    } catch (error) {
        console.log(error);
        res.statusMessage = 'Some error occurred. Please try again';
        res.sendStatus(400);
    }
});

router.get('/get-reports/:submitterId', (req, res) => res.send('test'));

router.post('/update-report', (req, res) => res.send('test'));

router.post('/delete-report', (req, res) => res.send('test'));

export default router;
