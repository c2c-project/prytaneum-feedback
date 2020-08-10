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
    user?: User;
}

/**
 * @description Creates a feedback report and inserts it in the feedback-reports collection.
 * */
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
        if (!user._id) {
            throw Error('Missing user Id');
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

/**
 * @description Retrieves at most 10 reports from the feedback-reports collection, depending on the page number provided. Calling user must be an Admin.
 * */
router.get('/get-reports', async (req: Request, res: Response) => {
    // TODO: ADD VALIDATION. THIS API ENDPOINT CAN ONLY BE CALLED FROM THE ADMIN MICRO SERVICE
    try {
        const { page, ascending } = req.query as {
            page?: number;
            ascending?: string;
        };
        if (!page) {
            throw Error('Missing page number');
        }
        if (!ascending) {
            throw Error('Missing ascending');
        }
        const feedbackReports: FeedbackReport[] = await getReports(
            page,
            ascending
        );
        res.status(200).send({ reports: feedbackReports });
    } catch (error) {
        log.error(error);
        res.statusMessage = 'Some error occurred. Please try again';
        res.sendStatus(400);
    }
});

interface UserRequestBody {
    user?: User;
}

/**
 * @description Retrieves all feedback reports submitted by a specific user. Calling user must posses the same Id as the one provided in the request parameters.
 * */
router.get('/get-reports/:submitterId', async (req: Request, res: Response) => {
    try {
        const { submitterId } = req.params as { submitterId: string };
        const { user } = req.body as UserRequestBody;
        const { page, ascending } = req.query as {
            page?: number;
            ascending?: string;
        };

        if (!user) {
            throw Error('Missing user object');
        }
        if (!user._id) {
            throw Error('Missing user Id');
        }
        if (submitterId !== user._id) {
            throw Error('Calling user is not owner of the report');
        }
        if (!page) {
            throw Error('Missing page number');
        }
        if (!ascending) {
            throw Error('Missing ascending');
        }
        const feedbackReports: FeedbackReport[] = await getReportBySubmitter(
            page,
            ascending,
            submitterId
        );
        res.status(200).send({ reports: feedbackReports });
    } catch (error) {
        log.error(error);
        res.statusMessage = 'Some error occurred. Please try again';
        res.sendStatus(400);
    }
});

interface UpdateReportRequestBody {
    _id: string;
    newDescription: string;
    user?: User;
}

/**
 * @description Updates the description of a specific report from the feedback-reports collection.
 * */
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
        if (!user._id) {
            throw Error('Missing user Id');
        }

        // Look for feedback report that matches the Id provided
        const feedbackReport: FeedbackReport | null = await getReportById(_id);

        if (feedbackReport === null) {
            throw Error('Feedback report does not exist');
        }
        if (feedbackReport.submitterId !== user._id) {
            throw Error('Calling user is not owner of the report');
        }
        await updateReport(_id, newDescription);
        res.statusMessage = 'Feedback report successfully updated';
        res.sendStatus(200);
    } catch (error) {
        log.error(error);
        res.statusMessage = 'Some error occurred. Please try again';
        res.sendStatus(400);
    }
});

interface DeleteReportRequestBody {
    _id: string;
    user?: User;
}

/**
 * @description Deletes a specific report from the feedback-reports collection.
 * */
router.post('/delete-report', async (req: Request, res: Response) => {
    try {
        const { _id, user } = req.body as DeleteReportRequestBody;

        if (!_id) {
            throw Error('Missing feedback report Id');
        }
        if (!user || Object.keys(user).length === 0) {
            throw Error('Missing user');
        }
        if (!user._id) {
            throw Error('Missing user Id');
        }
        // Look for feedback report that matches the Id provided
        const feedbackReport: FeedbackReport | null = await getReportById(_id);

        if (feedbackReport === null) {
            throw Error('Feedback report does not exist');
        }
        if (feedbackReport.submitterId !== user._id) {
            throw Error('Calling user is not owner of the report');
        }
        await deleteReport(_id);
        res.statusMessage = 'Feedback report successfully deleted';
        res.sendStatus(200);
    } catch (error) {
        log.error(error);
        res.statusMessage = 'Some error occurred. Please try again';
        res.sendStatus(400);
    }
});

export default router;
