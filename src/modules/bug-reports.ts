import {
    InsertOneWriteOpResult,
    WithId,
    UpdateWriteOpResult,
    DeleteWriteOpResultObject,
    ObjectId,
} from 'mongodb';

import Collections from 'db';
import { BugReport, User } from 'lib/interfaces';

/**
 * @description Creates a new bug report. The state of a new report is non-resolved.
 * @param {string} description - Description of the bug report.
 * @param {string} townhallId - Id of the townhall session where the bug occurred.
 * @param {Object} user - Represents the submitter of the bug report.
 * @returns MongoDB promise
 */
export const createReport = (
    description: string,
    townhallId: string,
    user: User
): Promise<InsertOneWriteOpResult<WithId<BugReport>>> => {
    return Collections.BugReport().insertOne({
        date: new Date(),
        description,
        townhallId,
        submitterId: user._id,
        resolved: false,
        replies: [],
    });
};

/**
 * @description Retrieves at most 10 reports from the bug-reports collection depending on the page number.
 * @param {number} page - Page number to return. If the page number exceeds the number of available pages, 0 reports are returned.
 * @param {boolean} sortByDate - Sort by date order. True for ascending. False for descending.
 * @param {boolean} resolved - Resolved status of reports to retrieve
 * @returns {Promise<BugReport[]>} - promise that will produce an array of bug reports.
 */
const numberOfDocumentsPerPage = 10;
export const getReports = (
    page: number,
    sortByDate: boolean,
    resolved?: boolean
): Promise<BugReport[]> => {
    const resolvedQuery = typeof resolved === 'boolean' ? { resolved } : {};

    return (
        Collections.BugReport()
            .find(resolvedQuery)
            .sort({ date: sortByDate ? 1 : -1 })
            // If page is a negative number or undefined then we get the first page
            .skip(page > 0 ? numberOfDocumentsPerPage * (page - 1) : 0)
            .limit(numberOfDocumentsPerPage)
            .toArray()
    );
};

/**
 * @description Retrieves at most 10 bug reports from a specific submitter, depending on the page number.
 * @param {number} page - Page number to return. If the page number exceeds the number of available pages, 0 reports are returned.
 * @param {boolean} sortByDate - Sort by date order. True for ascending. False for descending.
 * @param {string} submitterId - Submitter's Id of reports to retrieve
 * @returns {Promise<BugReport[]>} - Promise that will produce an array of bug reports.
 */
export const getReportBySubmitter = (
    page: number,
    sortByDate: boolean,
    submitterId: string
): Promise<BugReport[]> => {
    return Collections.BugReport()
        .find({ submitterId })
        .sort({ date: sortByDate ? 1 : -1 })
        .skip(page > 0 ? numberOfDocumentsPerPage * (page - 1) : 0)
        .limit(numberOfDocumentsPerPage)
        .toArray();
};

/**
 * @description Retrieves at most one bug report specified by its unique Id.
 * @param {string} _id -  Id of the bug report to return
 * @returns {Promise<BugReport | null>} - Promise that will produce a bug report or null if no bug report was found in the collection.
 */
export const getReportById = (_id: string): Promise<BugReport | null> => {
    return Collections.BugReport().findOne({ _id: new ObjectId(_id) });
};

/**
 * @description Updates the description of a bug report specified by its unique Id.
 * @param {string} _id - Id of the bug report to update.
 * @param {string} description - New description of the bug report.
 * @returns MongoDB promise
 */
export const updateReport = (
    _id: string,
    newDescription: string
): Promise<UpdateWriteOpResult> => {
    return Collections.BugReport().updateOne(
        { _id: new ObjectId(_id) },
        { $set: { description: newDescription } }
    );
};

/**
 * @description Deletes a bug report specified by its unique Id.
 * @param {string} _id - Id of the bug report to delete.
 * @returns MongoDB promise
 */
export const deleteReport = (
    _id: string
): Promise<DeleteWriteOpResultObject> => {
    return Collections.BugReport().deleteOne({ _id: new ObjectId(_id) });
};

/**
 * @description Returns the total count of reports in the bug-reports collection
 * @param {boolean} resolved Function counts reports that match this resolved status
 * @returns total count of bug reports
 */
export const getNumberOfBugReports = (resolved?: boolean): Promise<number> => {
    const resolvedQuery = typeof resolved === 'boolean' ? { resolved } : {};
    return Collections.BugReport().countDocuments(resolvedQuery);
};

/**
 * @description Returns the count of bug reports submitted by a specific user
 * @param {string} submitterId - Id of user
 * @returns count of bug reports
 */
export const getNumberOfBugReportsBySubmitter = (
    submitterId: string
): Promise<number> => {
    return Collections.BugReport().countDocuments({ submitterId });
};

/**
 * @description Sets the resolved attribute of a bug report to the resolvedStatus provided.
 * @param {string} _id -  Id of the report
 * @param {boolean} resolvedStatus - resolved status
 * @returns Mongodb promise
 */
export const updateResolvedStatus = (
    _id: string,
    resolvedStatus: boolean
): Promise<UpdateWriteOpResult> => {
    return Collections.BugReport().updateOne(
        { _id: new ObjectId(_id) },
        { $set: { resolved: resolvedStatus } }
    );
};

/**
 * @description Adds a reply to a report
 * @param {Object} user - user object of the replier
 * @param {string} _id -  Id of the report
 * @param {string} replyContent - Content of the reply
 * @returns Mongodb promise
 */
export const replyToBugReport = (
    user: User,
    _id: string,
    replyContent: string
): Promise<UpdateWriteOpResult> => {
    return Collections.BugReport().updateOne(
        { _id: new ObjectId(_id) },
        {
            $push: {
                replies: {
                    $each: [
                        {
                            content: replyContent,
                            repliedDate: new Date(),
                            repliedBy: user,
                        },
                    ],
                    $sort: { repliedDate: 1 },
                },
            },
        }
    );
};
