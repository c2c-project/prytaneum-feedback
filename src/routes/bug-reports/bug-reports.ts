import express from 'express';

const router = express.Router();

router.post('/create-report', (req, res) => res.send('test'));

router.get('/get-reports', (req, res) => res.send('test'));

router.get('/get-reports/:submitterId', (req, res) => res.send('test'));

router.post('/update-report', (req, res) => res.send('test'));

router.post('/delete-report', (req, res) => res.send('test'));

export default router;
