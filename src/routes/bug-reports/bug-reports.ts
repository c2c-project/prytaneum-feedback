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
} from '../../modules/bug-reports';

const router = express.Router();

interface CreateReportRequest extends BugReport {
    user?: User;
}

/**
 * @description Creates a bug report and inserts it in the bugs-reports collection
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
 * @description Retrieves at most 10 reports from the bug-reports collection, depending on the page number provided. Calling user must be an Admin.
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
        const bugReports: BugReport[] = await getReports(page, ascending);
        res.status(200).send({ reports: bugReports });
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
 * */
router.get('/get-reports/:submitterId', async (req: Request, res: Response) => {
    try {
        const { submitterId } = req.params as { submitterId: string };
        const { user } = req.body as UserRequestBody;
        if (!user) {
            throw Error('Missing user object');
        }
        if (!user._id) {
            throw Error('Missing user Id');
        }
        if (submitterId !== user._id) {
            throw Error('Calling user is not owner of the report');
        }
        const bugReports: BugReport[] = await getReportBySubmitter(submitterId);
        res.status(200).send({ reports: bugReports });
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
