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
    getNumberOfFeedbackReports,
    getNumberOfFeedbackReportsBySubmitter,
} from 'modules/feedback-reports';

const router = express.Router();

interface CreateReportRequest extends FeedbackReport {
    user?: User;
}

/**
 * @description Creates a new feedback report and inserts it in the feedback-reports collection.
 * @param {Object} Request.body
 * @param {string} Request.body.date - Date when report is created
 * @param {string} Request.body.description - Description of the report
 * @param {Object} Request.body.user - User that submits the report
 * @param {string} Request.body.user._id - Id of the user
 * @returns {Object} Response
 */
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
 * @description Retrieves at most 10 reports from the feedback-reports collection, depending on the page number provided. Calling user must have admin permission.
 * @param {Object} Request.query
 * @param {string} Request.query.page - Number of page of reports to retrieve
 * @param {string} Request.query.ascending - Sort by date order. Either 'true' or 'false'
 * @returns {Object} Response
 * @returns {FeedbackReport[]} Response.reports - Array of reports retrieved from the collection
 * @returns {number} Response.count - Total count of reports in the collection
 */
router.get('/get-reports', async (req: Request, res: Response) => {
    // TODO: ADD VALIDATION. THIS API ENDPOINT CAN ONLY BE CALLED FROM THE ADMIN MICRO SERVICE
    try {
        const { page, ascending } = req.query as {
            page?: string;
            ascending?: string;
        };

        if (!page) {
            throw Error('Missing page number');
        }
        if (!ascending) {
            throw Error('Missing ascending');
        }
        const feedbackReports: FeedbackReport[] = await getReports(
            parseInt(page, 10),
            ascending
        );

        const countOfReports = await getNumberOfFeedbackReports();

        res.status(200).send({
            reports: feedbackReports,
            count: countOfReports,
        });
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
 * @description Retrieves all feedback reports submitted by a specific user. Calling user must have the same Id as the one provided in the request parameters
 * @param {Object} Request
 * @param {string} Request.params.submitterId - Id of submitter
 * @param {string} Request.query.page - Number of page of reports to retrieve
 * @param {string} Request.query.ascending - Sort by date order. Either 'true' or 'false'
 * @param {Object} Request.body.user - User that submits the report
 * @param {string} Request.body.user._id - Id of the user
 * @returns {Object} Response
 * @returns {FeedbackReport[]} Response.reports - Array of reports submitted by the user retrieved from the collection
 * @returns {number} Response.count -  Total count of reports submitted by the user in the collection
 */
router.get('/get-reports/:submitterId', async (req: Request, res: Response) => {
    try {
        const { submitterId } = req.params as { submitterId: string };
        const { user } = req.body as UserRequestBody;
        const { page, ascending } = req.query as {
            page?: string;
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
            parseInt(page, 10),
            ascending,
            submitterId
        );

        const countOfReports = await getNumberOfFeedbackReportsBySubmitter(
            submitterId
        );

        res.status(200).send({
            reports: feedbackReports,
            count: countOfReports,
        });
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
 * @param {Object} Request.body
 * @param {string} Request.body._id - Id of report to update
 * @param {string} Request.body.newDescription - new description of the report
 * @param {Object} Request.body.user - User that requests the update
 * @param {string} Request.body.user._id - Id of the user
 * @returns {Object} Response
 */

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
 * @param {Object} Request.body
 * @param {string} Request.body._id - Id of the report to delete
 * @param {Object} Request.body.user - User that requests the delete
 * @param {string} Request.body.user._id - Id of the user
 * @returns {Object} Response
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
