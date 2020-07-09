import express, { Request, Response } from 'express';

import log from 'lib/log';
import { FeedbackReport, User } from 'lib/Interfaces';
import {
    createReport,
    getReports,
    getReportBySubmitter,
    updateReport,
    getReportById,
    deleteReport,
} from '../modules/feedback-reports';

const router = express.Router();

router.post('/create-report', async (req: Request, res: Response) => {
    try {
        const feedbackReport = req.body as FeedbackReport;
        // TODO: ADD MORE VERBOSE VALIDATION
        if (
            !feedbackReport.date ||
            !feedbackReport.description ||
            !feedbackReport.submitter
        ) {
            throw Error('Missing fields in body of request');
        } else {
            await createReport(feedbackReport);
            res.statusMessage = 'Feedback successfully submitted';
            res.sendStatus(200);
        }
    } catch (error) {
        log.error(error);
        res.statusMessage = 'Some error occurred. Please try again';
        res.sendStatus(400);
    }
});

router.get('/get-reports', async (req: Request, res: Response) => {
    // TODO: ADD VALIDATION. THIS API ENDPOINT CAN ONLY BE CALLED FROM THE ADMIN MICRO SERVICE
    try {
        const feedbackReports: FeedbackReport[] = await getReports();
        res.status(200).send({ reports: feedbackReports });
    } catch (error) {
        log.error(error);
        res.statusMessage = 'Some error occurred. Please try again';
        res.sendStatus(400);
    }
});

interface GetReportsRequestBody {
    user: User;
}
router.get('/get-reports/:submitterId', async (req: Request, res: Response) => {
    try {
        // TODO: Find a way to give types to descructured objects
        const { submitterId } = req.params;
        const { user } = req.body as GetReportsRequestBody;
        // If the id of the submitter does not match the id of the calling user then access to reports is denied
        if (submitterId !== user._id) {
            throw Error('Calling user is not owner of the report');
        } else {
            const feedbackReports: FeedbackReport[] = await getReportBySubmitter(
                submitterId
            );
            res.status(200).send({ reports: feedbackReports });
        }
    } catch (error) {
        log.error(error);
        res.statusMessage = 'Some error occurred. Please try again';
        res.sendStatus(400);
    }
});

interface UpdateReportRequestBody {
    Id: string;
    newDescription: string;
    user: User;
}
router.post('/update-report', async (req: Request, res: Response) => {
    try {
        const {
            Id,
            newDescription,
            user,
        } = req.body as UpdateReportRequestBody;
        const feedbackReport: FeedbackReport | null = await getReportById(Id);
        if (feedbackReport === null) {
            throw Error('Feedback report does not exist');
        } else if (feedbackReport?.submitter._id !== user._id) {
            throw Error('Calling user is not owner of the report');
        } else {
            await updateReport(Id, newDescription);
            res.statusMessage = 'Feedback report successfully updated';
            res.sendStatus(200);
        }
    } catch (error) {
        log.error(error);
        res.statusMessage = 'Some error occurred. Please try again';
        res.sendStatus(400);
    }
});

interface DeleteReportRequestBody {
    Id: string;
    user: User;
}

router.post('/delete-report', async (req: Request, res: Response) => {
    try {
        const { Id, user } = req.body as DeleteReportRequestBody;
        const feedbackReport: FeedbackReport | null = await getReportById(Id);
        if (feedbackReport === null) {
            throw Error('Feedback report does not exist');
        } else if (feedbackReport?.submitter._id !== user._id) {
            throw Error('Calling user is not owner of the report');
        } else {
            await deleteReport(Id);
            res.statusMessage = 'Feedback report successfully deleted';
            res.sendStatus(200);
        }
    } catch (error) {
        log.error(error);
        res.statusMessage = 'Some error occurred. Please try again';
        res.sendStatus(400);
    }
});

export default router;
