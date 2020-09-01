import express, { Request, Response } from 'express';

import log from 'lib/log';
import { BugReport, User } from 'lib/interfaces';
import {
    createReport,
    getReports,
    getReportBySubmitter,
    updateReport,
    getReportById,
    deleteReport,
    getNumberOfBugReports,
    getNumberOfBugReportsBySubmitter,
} from '../../modules/bug-reports';

const router = express.Router();

interface CreateReportRequest extends BugReport {
    user?: User;
}

/**
 * @description Creates a new bug report and inserts it in the bugs-reports collection
 * @param {Object} Request.body
 * @param {string} Request.body.date - Date when report is created
 * @param {string} Request.body.description - Description of the report
 * @param {string} Request.body.townhallId - Id of townhall where bug was encountered
 * @param {Object} Request.body.user - User that submits the report
 * @param {string} Request.body.user._id - Id of the user
 * @returns {Object} Response
 * */
router.post('/create-report', async (req: Request, res: Response) => {
    try {
        const {
            date,
            description,
            townhallId,
            user,
        } = req.body as CreateReportRequest;
        // TODO: ADD MORE VERBOSE VALIDATION
        if (!date) {
            throw Error('Missing date');
        }
        if (!description) {
            throw Error('Missing description');
        }
        if (!townhallId) {
            throw Error('Missing townhall Id');
        }
        if (!user || Object.keys(user).length === 0) {
            throw Error('Missing user');
        }
        if (!user._id) {
            throw Error('Missing user Id');
        }

        await createReport(date, description, townhallId, user);
        res.statusMessage = 'Bug report successfully submitted';
        res.sendStatus(200);
        // TODO: CALL SEND EMAIL MICRO SERVICE TO SEND EMAIL THANKING THE SUBMITTER FOR THE BUG REPORT
    } catch (error) {
        log.error(error);
        res.statusMessage = 'Some error occurred. Please try again';
        res.sendStatus(400);
    }
});

/**
 * @description Retrieves at most 10 reports from the bug-reports collection, depending on the page number provided. Calling user must be have admin permission.
 * @param {Object} Request.query
 * @param {string} Request.query.page - Number of page of reports to retrieve
 * @param {string} Request.query.ascending - Sort by date order. Either 'true' or 'false'
 * @returns {Object} Response
 * @returns {BugReport[]} Response.reports - Array of reports retrieved from the collection
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
        const bugReports: BugReport[] = await getReports(
            parseInt(page, 10),
            ascending
        );
        const countOfReports = await getNumberOfBugReports();
        res.status(200).send({ reports: bugReports, count: countOfReports });
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
 * @description Retrieves all bug reports submitted by a specific user. Calling user must have the same Id as the one provided in the request parameters
 * @param {Object} Request
 * @param {string} Request.params.submitterId - Id of submitter
 * @param {string} Request.query.page - Number of page of reports to retrieve
 * @param {string} Request.query.ascending - Sort by date order. Either 'true' or 'false'
 * @param {Object} Request.body.user - User that submits the report
 * @param {string} Request.body.user._id - Id of the user
 * @returns {Object} Response
 * @returns {BugReport[]} Response.reports - Array of reports submitted by the user retrieved from the collection
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
        const bugReports: BugReport[] = await getReportBySubmitter(
            parseInt(page, 10),
            ascending,
            submitterId
        );
        const countOfReports = await getNumberOfBugReportsBySubmitter(
            submitterId
        );
        res.status(200).send({ reports: bugReports, count: countOfReports });
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
 * @description Updates the description of a specific report from the bug-reports collection.
 * @param {Object} Request.body
 * @param {string} Request.body._id - Id of report to update
 * @param {string} Request.body.newDescription - new description of the report
 * @param {Object} Request.body.user - User that requests the update
 * @param {string} Request.body.user._id - Id of the user
 * @returns {Object} Response
 * */
router.post('/update-report', async (req: Request, res: Response) => {
    try {
        const {
            _id,
            newDescription,
            user,
        } = req.body as UpdateReportRequestBody;

        if (!_id) {
            throw Error('Missing bug report Id');
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

        // Look for bug report that matches the Id provided
        const bugReport: BugReport | null = await getReportById(_id);

        if (bugReport === null) {
            throw Error('Bug report does not exist');
        }
        if (bugReport.submitterId !== user._id) {
            throw Error('Calling user is not owner of the report');
        }
        await updateReport(_id, newDescription);
        res.statusMessage = 'Bug report successfully updated';
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
 * @description Deletes a specific report from the bug-reports collection.
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
            throw Error('Missing bug report Id');
        }
        if (!user || Object.keys(user).length === 0) {
            throw Error('Missing user');
        }
        if (!user._id) {
            throw Error('Missing user Id');
        }
        // Look for bug report that matches the Id provided
        const bugReport: BugReport | null = await getReportById(_id);

        if (bugReport === null) {
            throw Error('Bug report does not exist');
        } else if (bugReport.submitterId !== user._id) {
            throw Error('Calling user is not owner of the report');
        } else {
            await deleteReport(_id);
            res.statusMessage = 'Bug report successfully deleted';
            res.sendStatus(200);
        }
    } catch (error) {
        log.error(error);
        res.statusMessage = 'Some error occurred. Please try again';
        res.sendStatus(400);
    }
});

export default router;
