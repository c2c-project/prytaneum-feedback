import {
    InsertOneWriteOpResult,
    WithId,
    UpdateWriteOpResult,
    DeleteWriteOpResultObject,
    ObjectId,
} from 'mongodb';

import Collections from 'db';
import { BugReport, User } from 'lib/interfaces';

export const createReport = (
    date: string,
    description: string,
    townhallId: string,
    user: User
): Promise<InsertOneWriteOpResult<WithId<BugReport>>> => {
    return Collections.BugReport().insertOne({
        date,
        description,
        townhallId,
        submitterId: user._id,
    });
};

// We'll assume the limit is always 10 for now
// If the page number exceeds the number of available pages, 0 reports are returned

const numberOfDocumentsPerPage = 10;
export const getReports = (page: number): Promise<BugReport[]> => {
    return (
        Collections.BugReport()
            .find()
            .sort({ date: -1 })
            // If page is a negative number or undefined then we get the first page
            .skip(page > 0 ? numberOfDocumentsPerPage * (page - 1) : 0)
            .limit(numberOfDocumentsPerPage)
            .toArray()
    );
};

export const getReportBySubmitter = (
    submitterId: string
): Promise<BugReport[]> => {
    return Collections.BugReport().find({ submitterId }).toArray();
};

export const getReportById = (_id: string): Promise<BugReport | null> => {
    return Collections.BugReport().findOne({ _id: new ObjectId(_id) });
};

export const updateReport = (
    _id: string,
    newDescription: string
): Promise<UpdateWriteOpResult> => {
    return Collections.BugReport().updateOne(
        { _id: new ObjectId(_id) },
        { $set: { description: newDescription } }
    );
};

export const deleteReport = (
    _id: string
): Promise<DeleteWriteOpResultObject> => {
    return Collections.BugReport().deleteOne({ _id: new ObjectId(_id) });
};
