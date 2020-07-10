import express, { Request, Response } from 'express';

import log from 'lib/log';
import { FeedbackReport, User } from 'lib/interfaces';
import {
    createReport,
    getReports,
    getReportBySubmitter,
    updateReport,
    getReportById,
    deleteReport,
} from '../../modules/feedback-reports';

const router = express.Router();

interface CreateReportRequest extends FeedbackReport {
    user: User;
}
// TODO: When creating a report, instead of getting a submitter object, couldn't we use the user object that will come from the Authorization service
router.post('/create-report', async (req: Request, res: Response) => {
    try {
        const { date, description, user } = req.body as CreateReportRequest;
        // TODO: ADD MORE VERBOSE VALIDATION
        if (!date) {
            throw Error('Missing date');
        }
        if (!description) {
            throw Error('Missing description');
        }
        if (!user || Object.keys(user).length === 0) {
            throw Error('Missing user');
        }

        await createReport(date, description, user);
        res.statusMessage = 'Feedback successfully submitted';
        res.sendStatus(200);
        // TODO: CALL SEND EMAIL MICRO SERVICE TO SEND EMAIL THANKING THE SUBMITTER FOR THE FEEDBACK
    } catch (error) {
        log.error(error);
        res.statusMessage = 'Some error occurred. Please try again';
        res.sendStatus(400);
    }
});

// TODO: Add limit and pagination
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

interface UserRequestBody {
    user: User;
}

router.get('/get-reports/:submitterId', async (req: Request, res: Response) => {
    try {
        const { submitterId } = req.params;
        const { user } = req.body as UserRequestBody;
        // If the id of the submitter does not match the id of the calling user then access to reports is denied
        if (!submitterId) {
            throw Error('Missing submitterId');
        } else if (submitterId !== user._id) {
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
    _id: string;
    newDescription: string;
    user: User;
}
router.post('/update-report', async (req: Request, res: Response) => {
    try {
        const {
            _id,
            newDescription,
            user,
        } = req.body as UpdateReportRequestBody;

        if (!_id) {
            throw Error('Missing feedback report Id');
        }
        if (!newDescription) {
            throw Error('Missing new description');
        }
        if (!user || Object.keys(user).length === 0) {
            throw Error('Missing user');
        }

        // Look for feedback report that matches the Id provided
        const feedbackReport: FeedbackReport | null = await getReportById(_id);

        if (feedbackReport === null) {
            throw Error('Feedback report does not exist');
        } else if (feedbackReport.submitterId !== user._id) {
            throw Error('Calling user is not owner of the report');
        } else {
            await updateReport(_id, newDescription);
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
    _id: string;
    user: User;
}

router.post('/delete-report', async (req: Request, res: Response) => {
    try {
        const { _id, user } = req.body as DeleteReportRequestBody;

        if (!_id) {
            throw Error('Missing feedback report Id');
        }
        if (!user || Object.keys(user).length === 0) {
            throw Error('Missing user');
        }
        // Look for feedback report that matches the Id provided
        const feedbackReport: FeedbackReport | null = await getReportById(_id);

        if (feedbackReport === null) {
            throw Error('Feedback report does not exist');
        } else if (feedbackReport.submitterId !== user._id) {
            throw Error('Calling user is not owner of the report');
        } else {
            await deleteReport(_id);
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
