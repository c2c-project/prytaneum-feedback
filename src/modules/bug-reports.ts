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
 * @param {string} date - Date when the bug report was concentrated at.
 * @param {string} description - Description of the bug report.
 * @param {string} townhallId - Id of the townhall session where the bug occurred.
 * @param {Object} user - Represents the submitter of the bug report.
 * @returns MongoDB promise
 */
export const createReport = (
    date: string | Date,
    description: string,
    townhallId: string,
    user: User
): Promise<InsertOneWriteOpResult<WithId<BugReport>>> => {
    return Collections.BugReport().insertOne({
        date: new Date(date),
        description,
        townhallId,
        submitterId: user._id,
        resolved: false,
    });
};

/**
 * @description Retrieves at most 10 reports from the bug-reports collection depending on the page number.
 * @param {number} page - Page number to return. If the page number exceeds the number of available pages, 0 reports are returned.
 * @param {string} ascending - Describes the sorted order of the reports.'True' for ascending. 'False' for descending.
 * @returns {Promise<BugReport[]>} - promise that will produce an array of bug reports.
 * @
 */
const numberOfDocumentsPerPage = 10;
export const getReports = (
    page: number,
    ascending: boolean,
    resolved?: boolean
): Promise<BugReport[]> => {
    const resolvedQuery =
        typeof resolved === 'boolean'
            ? { resolved }
            : { $or: [{ resolved: true }, { resolved: false }] };

    return (
        Collections.BugReport()
            .find(resolvedQuery)
            .sort({ date: ascending ? 1 : -1 })
            // If page is a negative number or undefined then we get the first page
            .skip(page > 0 ? numberOfDocumentsPerPage * (page - 1) : 0)
            .limit(numberOfDocumentsPerPage)
            .toArray()
    );
};

/**
 * @description Retrieves at most 10  bug reports from a specific submitter, depending on the page number.
 * @param {number} page - Page number to return. If the page number exceeds the number of available pages, 0 reports are returned.
 * @param {string} ascending - Describes the sorted order of the reports.'True' for ascending. 'False' for descending.
 * @returns {Promise<BugReport[]>} - Promise that will produce an array of bug reports.
 */
export const getReportBySubmitter = (
    page: number,
    ascending: boolean,
    submitterId: string
): Promise<BugReport[]> => {
    return Collections.BugReport()
        .find({ submitterId })
        .sort({ date: ascending ? 1 : -1 })
        .skip(page > 0 ? numberOfDocumentsPerPage * (page - 1) : 0)
        .limit(numberOfDocumentsPerPage)
        .toArray();
};

/**
 * @description Retrieves at most one bug report specified by its unique Id.
 * @param {string} _id -  Id of the bug report to return
 * @returns {Promise<BugReport | null>} - Promise that will produce a bug report or null if no bug report was found in the collection.
 * @
 */
export const getReportById = (_id: string): Promise<BugReport | null> => {
    return Collections.BugReport().findOne({ _id: new ObjectId(_id) });
};

// TODO: Check if adding no returns is fine for this type of function.
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
 * @returns total count of bug reports
 */
export const getNumberOfBugReports = (): Promise<number> => {
    return Collections.BugReport().countDocuments();
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
export const markReportAsResolved = (
    _id: string,
    resolvedStatus: boolean
): Promise<UpdateWriteOpResult> => {
    return Collections.BugReport().updateOne(
        { _id: new ObjectId(_id) },
        { $set: { resolved: resolvedStatus } }
    );
};
