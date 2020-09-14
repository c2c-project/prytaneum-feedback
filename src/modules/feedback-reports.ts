import {
    InsertOneWriteOpResult,
    WithId,
    UpdateWriteOpResult,
    DeleteWriteOpResultObject,
    ObjectId,
} from 'mongodb';

import Collections from 'db';
import { FeedbackReport, User } from 'lib/interfaces';

/**
 * @description Creates a new feedback report.
 * @param {string} description - Description of the feedback report.
 * @param {Object} user - Represents the submitter of the feedback report.
 * @returns MongoDB promise
 */
export const createReport = (
    description: string,
    user: User
): Promise<InsertOneWriteOpResult<WithId<FeedbackReport>>> => {
    return Collections.FeedbackReport().insertOne({
        date: new Date(),
        description,
        submitterId: user._id,
        resolved: false,
        replies: [],
    });
};

/**
 * @description Retrieves at most 10 reports from the feedback-reports collection depending on the page number.
 * @param {number} page - Page number to return. If the page number exceeds the number of available pages, 0 reports are returned.
 * @param {boolean} sortByDate - Sort by date order. True for ascending. False for descending.
 * @param {boolean} resolved - Resolved status of reports to retrieve
 * @returns {Promise<FeedbackReport[]>} - promise that will produce an array of feedback reports.
 */
const numberOfDocumentsPerPage = 10;
export const getReports = (
    page: number,
    sortByDate: boolean,
    resolved?: boolean
): Promise<FeedbackReport[]> => {
    const resolvedQuery =
        typeof resolved === 'boolean'
            ? { resolved }
            : { $or: [{ resolved: true }, { resolved: false }] };

    return (
        Collections.FeedbackReport()
            .find(resolvedQuery)
            .sort({ date: sortByDate ? 1 : -1 })
            // If page is a negative number or undefined then we get the first page
            .skip(page > 0 ? numberOfDocumentsPerPage * (page - 1) : 0)
            .limit(numberOfDocumentsPerPage)
            .toArray()
    );
};

/**
 * @description Retrieves at most 10  feedback reports from a specific submitter, depending on the page number.
 * @param {number} page - Page number to return. If the page number exceeds the number of available pages, 0 reports are returned.
 * @param {boolean} sortByDate - Sort by date order. True for ascending. False for descending.
 * @param {string} submitterId - Id of the submitter.
 * @returns {Promise<FeedbackReport[]>} - Promise that will produce an array of feedback reports.
 */
export const getReportBySubmitter = (
    page: number,
    sortByDate: boolean,
    submitterId: string
): Promise<FeedbackReport[]> => {
    return Collections.FeedbackReport()
        .find({ submitterId })
        .sort({ date: sortByDate ? 1 : -1 })
        .skip(page > 0 ? numberOfDocumentsPerPage * (page - 1) : 0)
        .limit(numberOfDocumentsPerPage)
        .toArray();
};

/**
 * @description Retrieves at most one feedback report specified by its unique Id.
 * @param {string} _id - Id of the feedback report to return
 * @returns {Promise<FeedbackReport | null>} - Promise that will produce a feedback report or null if no feedback report was found in the collection.
 */
export const getReportById = (_id: string): Promise<FeedbackReport | null> => {
    return Collections.FeedbackReport().findOne({ _id: new ObjectId(_id) });
};

/**
 * @description Updates the description of a feedback report specified by its unique Id.
 * @param {string} _id - Id of the feedback report to update.
 * @param {string} description - New description of the feedback report.
 * @returns MongoDB promise
 */
export const updateReport = (
    _id: string,
    newDescription: string
): Promise<UpdateWriteOpResult> => {
    return Collections.FeedbackReport().updateOne(
        { _id: new ObjectId(_id) },
        { $set: { description: newDescription } }
    );
};

/**
 * @description Deletes a feedback report specified by its unique Id.
 * @param {string} _id - Id of the feedback report to delete.
 * @returns MongoDB promise
 */
export const deleteReport = (
    _id: string
): Promise<DeleteWriteOpResultObject> => {
    return Collections.FeedbackReport().deleteOne({ _id: new ObjectId(_id) });
};

/**
 * @description Returns the total count of reports in the feedback-reports collection
 * @returns total count of feedback reports
 */
export const getNumberOfFeedbackReports = (): Promise<number> => {
    return Collections.FeedbackReport().countDocuments();
};

/**
 * @description Returns the count of feedback reports submitted by a specific user
 * @param {string} submitterId - Id of user
 * @returns count of feedback reports
 */
export const getNumberOfFeedbackReportsBySubmitter = (
    submitterId: string
): Promise<number> => {
    return Collections.FeedbackReport().countDocuments({ submitterId });
};

/**
 * @description Sets the resolved attribute of a feedback report to the resolvedStatus provided.
 * @param {string} _id -  Id of the report
 * @param {boolean} resolvedStatus - resolved status
 * @returns Mongodb promise
 */
export const updateResolvedStatus = (
    _id: string,
    resolvedStatus: boolean
): Promise<UpdateWriteOpResult> => {
    return Collections.FeedbackReport().updateOne(
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
export const replyToFeedbackReport = (
    user: User,
    _id: string,
    replyContent: string
): Promise<UpdateWriteOpResult> => {
    return Collections.FeedbackReport().updateOne(
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
