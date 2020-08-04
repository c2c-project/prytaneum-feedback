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
 * @param {string} date - Date when the feedback report was concentrated at.
 * @param {string} description - Description of the feedback report.
 * @param {Object} user - Represents the submitter of the feedback report.
 * @returns MongoDB promise
 */
export const createReport = (
    date: string | Date,
    description: string,
    user: User
): Promise<InsertOneWriteOpResult<WithId<FeedbackReport>>> => {
    return Collections.FeedbackReport().insertOne({
        date: new Date(date),
        description,
        submitterId: user._id,
    });
};

/**
 * @description Retrieves at most 10 reports from the feedback-reports collection depending on the page number.
 * @param {number} page - Page number to return. If the page number exceeds the number of available pages, 0 reports are returned.
 * @param {string} ascending - Describes the sorted order of the reports.'True' for ascending. 'False' for descending.
 * @returns {Promise<FeedbackReport[]>} - promise that will produce an array of feedback reports.
 */
const numberOfDocumentsPerPage = 10;
export const getReports = (
    page: number,
    ascending: string
): Promise<FeedbackReport[]> => {
    return (
        Collections.FeedbackReport()
            .find()
            .sort({ date: ascending === 'true' ? 1 : -1 })
            // If page is a negative number or undefined then we get the first page
            .skip(page > 0 ? numberOfDocumentsPerPage * (page - 1) : 0)
            .limit(numberOfDocumentsPerPage)
            .toArray()
    );
};

/**
 * @description Retrieves feedback reports from a specific submitter.
 * @param {string} submitterId - Id of the submitter.
 * @returns {Promise<FeedbackReport[]>} - Promise that will produce an array of feedback reports.
 */
export const getReportBySubmitter = (
    submitterId: string
): Promise<FeedbackReport[]> => {
    return Collections.FeedbackReport().find({ submitterId }).toArray();
};

/**
 * @description Retrieves at most one feedback report specified by its unique Id.
 * @param {string} _id - Id of the feedback report to return
 * @returns {Promise<FeedbackReport | null>} - Promise that will produce a feedback report or null if no feedback report was found in the collection.
 */
export const getReportById = (_id: string): Promise<FeedbackReport | null> => {
    return Collections.FeedbackReport().findOne({ _id: new ObjectId(_id) });
};

// TODO: Check if adding no returns is fine for this type of function.
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
