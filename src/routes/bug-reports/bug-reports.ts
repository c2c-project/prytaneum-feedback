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
    updateResolvedStatus,
    replyToBugReport,
} from 'modules/bug-reports';

const router = express.Router();

interface CreateReportRequest extends BugReport {
    user?: User;
}

/**
 * @description Creates a new bug report and inserts it in the bugs-reports collection
 * @param {Object} Request.body
 * @param {string} Request.body.description - Description of the report
 * @param {string} Request.body.townhallId - Id of townhall where bug was encountered
 * @param {Object} Request.body.user - User that submits the report
 * @param {string} Request.body.user._id - Id of the user
 * @returns {Object} Response
 * */
router.post('/create-report', async (req: Request, res: Response) => {
    try {
        const {
            description,
            townhallId,
            user,
        } = req.body as CreateReportRequest;
        // TODO: ADD MORE VERBOSE VALIDATION
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

        await createReport(description, townhallId, user);
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
 * @description Retrieves at most 10 bug reports from the database, depending on the page number and resolved status provided. Calling user must be have admin permission.
 * @param {Object} Request.query
 * @param {string} Request.query.page - Page number of reports to retrieve
 * @param {string} Request.query.sortByDate - Sort by date order. True for ascending. False for descending.
 * @param {string} Request.query.resolved - Returns reports with this resolved status. If not provided, all reports are returned
 * @returns {Object} Response
 * @returns {BugReport[]} Response.reports - Array of bug reports retrieved from the database
 * @returns {number} Response.count - Total count of bug reports in the database
 */
router.get('/get-reports', async (req: Request, res: Response) => {
    // TODO: ADD VALIDATION. THIS API ENDPOINT CAN ONLY BE CALLED FROM THE ADMIN MICRO SERVICE
    try {
        const { page, sortByDate, resolved } = req.query as {
            page?: string;
            sortByDate?: string;
            resolved?: string;
        };

        if (!page) {
            throw Error('Invalid page number');
        }
        if (Number.isNaN(parseInt(page, 10))) {
            throw Error('Invalid page number');
        }
        if (sortByDate !== 'true' && sortByDate !== 'false') {
            throw Error('Invalid sortByDate');
        }

        let resolvedParameter: boolean | undefined;

        if (resolved) {
            if (resolved !== 'true' && resolved !== 'false') {
                throw Error('Invalid resolved');
            } else {
                resolvedParameter = resolved === 'true';
            }
        }

        const bugReports: BugReport[] = await getReports(
            parseInt(page, 10),
            sortByDate === 'true',
            resolvedParameter
        );

        // TODO: Fix. So that it returns the count of report per the resolved query
        const countOfReports = await getNumberOfBugReports();
        res.status(200).send({ reports: bugReports, count: countOfReports });
    } catch (error) {
        log.error(error);
        res.statusMessage = 'Some error occurred. Please try again';
        res.sendStatus(400);
    }
});

/**
 * @description Retrieves at most 10 bug reports submitted by a specific user, depending on the page number provided. Calling user must have the same Id as the one provided in the request parameters
 * @param {Object} Request
 * @param {string} Request.params.submitterId - Id of submitter
 * @param {string} Request.query.page - Page number of reports to retrieve
 * @param {string} Request.query.sortByDate - Sort by date order. True for ascending. False for descending.
 * @param {Object} Request.body.user - User that submits the report
 * @param {string} Request.body.user._id - Id of the user
 * @returns {Object} Response
 * @returns {BugReport[]} Response.reports - Array of bug reports retrieved from the database
 * @returns {number} Response.count -  Total count of reports submitted by the a user in the database
 */
router.get('/get-reports/:submitterId', async (req: Request, res: Response) => {
    try {
        const { submitterId } = req.params;
        const { page, sortByDate } = req.query as {
            page?: string;
            sortByDate?: string;
        };
        const { user } = req.body as { user: User };

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
            throw Error('Invalid page number');
        }
        if (Number.isNaN(parseInt(page, 10))) {
            throw Error('Invalid page number');
        }
        if (sortByDate !== 'true' && sortByDate !== 'false') {
            throw Error('Invalid sortByDate');
        }
        const bugReports: BugReport[] = await getReportBySubmitter(
            parseInt(page, 10),
            sortByDate === 'true',
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
    _id?: string;
    newDescription?: string;
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

/**
 * @description Marks a bug report as resolved or unresolved
 * @param {Object} Request.params
 * @param {string} Request.params._id - Id of the report to mark as resolved
 * @param {Object} Request.body.user - User that requests the update
 * @param {boolean} Request.body.resolvedStatus - Value used to set the resolvedStatus of the report. true for resolved. false for unresolved
 * @returns {Object} Response
 * */

// TODO: This endpoint should only work for admin users
router.post(
    '/update-resolved-status/:_id',
    async (req: Request, res: Response) => {
        try {
            // TODO: If calling user does not have admin permissions, throw error
            const { _id } = req.params as { _id: string };
            const { resolvedStatus } = req.body as { resolvedStatus?: boolean };
            if (!_id) {
                throw Error('Missing report Id');
            }
            if (typeof resolvedStatus !== 'boolean') {
                throw Error('Invalid resolved status');
            }
            await updateResolvedStatus(_id, resolvedStatus);
            res.statusMessage = 'Resolved status successfully updated';
            res.sendStatus(200);
        } catch (error) {
            log.error(error);
            res.statusMessage = 'Some error occurred. Please try again';
            res.sendStatus(400);
        }
    }
);

/**
 * @description Adds a reply to a bug report. Caller must have admin permission.
 * @param {Object} Request.params
 * @param {string} Request.params._id - Id of the report
 * @param {Object} Request.body.user - User that replies to the report
 * @param {string} Request.body.user._id - Id of replier
 * @param {string} Request.body.replyContent - Content of the reply
 * @returns {Object} Response
 * */

// TODO: This endpoint should only works for admin users
router.post('/reply-to/:_id', async (req: Request, res: Response) => {
    try {
        // TODO: If calling user does not have admin permissions, throw error
        const { _id } = req.params as { _id: string };
        const { user, replyContent } = req.body as {
            user?: User;
            replyContent?: string;
        };
        if (!_id) {
            throw Error('Missing bug report Id');
        }
        if (!user || Object.keys(user).length === 0) {
            throw Error('Missing user');
        }
        if (!user._id) {
            throw Error('Missing user Id');
        }
        if (!replyContent) {
            throw Error('Missing reply content');
        }
        await replyToBugReport(user, _id, replyContent);
        res.statusMessage = 'Reply successfully submitted';
        res.sendStatus(200);
    } catch (error) {
        log.error(error);
        res.statusMessage = 'Some error occurred. Please try again';
        res.sendStatus(400);
    }
});

export default router;
