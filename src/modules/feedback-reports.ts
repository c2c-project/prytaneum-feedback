import {
    InsertOneWriteOpResult,
    WithId,
    ObjectID,
    UpdateWriteOpResult,
    DeleteWriteOpResultObject,
} from 'mongodb';

import Collections from 'db';
import { FeedbackReport } from 'lib/Interfaces';

export const createReport = (
    feedbackReport: FeedbackReport
): Promise<InsertOneWriteOpResult<WithId<FeedbackReport>>> => {
    const { date, description, submitter } = feedbackReport;
    return Collections.FeedbackReport().insertOne({
        date,
        description,
        submitter,
    });
};

export const getReports = (): Promise<FeedbackReport[]> => {
    return Collections.FeedbackReport().find().toArray();
};

export const getReportBySubmitter = (
    submitterId: string
): Promise<FeedbackReport[]> => {
    return Collections.FeedbackReport()
        .find({ 'submitter._id': submitterId })
        .toArray();
};

export const getReportById = (Id: string): Promise<FeedbackReport | null> => {
    return Collections.FeedbackReport().findOne({ _id: new ObjectID(Id) });
};
export const updateReport = (
    Id: string,
    newDescription: string
): Promise<UpdateWriteOpResult> => {
    return Collections.FeedbackReport().updateOne(
        { _id: new ObjectID(Id) },
        { $set: { description: newDescription } }
    );
};

export const deleteReport = (
    Id: string
): Promise<DeleteWriteOpResultObject> => {
    return Collections.FeedbackReport().deleteOne({ _id: new ObjectID(Id) });
};
