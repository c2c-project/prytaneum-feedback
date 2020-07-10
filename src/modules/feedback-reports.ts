import {
    InsertOneWriteOpResult,
    WithId,
    UpdateWriteOpResult,
    DeleteWriteOpResultObject,
    ObjectId,
} from 'mongodb';

import Collections from 'db';
import { FeedbackReport, User } from 'lib/interfaces';

export const createReport = (
    date: string,
    description: string,
    user: User
): Promise<InsertOneWriteOpResult<WithId<FeedbackReport>>> => {
    return Collections.FeedbackReport().insertOne({
        date,
        description,
        submitterId: user._id,
    });
};

export const getReports = (): Promise<FeedbackReport[]> => {
    return Collections.FeedbackReport().find().toArray();
};

export const getReportBySubmitter = (
    submitterId: string
): Promise<FeedbackReport[]> => {
    return Collections.FeedbackReport()
        .find({ submitterId })
        .toArray();
};

export const getReportById = (_id: string): Promise<FeedbackReport | null> => {
    return Collections.FeedbackReport().findOne({ _id: new ObjectId(_id) });
};
export const updateReport = (
    _id: string,
    newDescription: string
): Promise<UpdateWriteOpResult> => {
    return Collections.FeedbackReport().updateOne(
        { _id: new ObjectId(_id) },
        { $set: { description: newDescription } }
    );
};

export const deleteReport = (
    _id: string
): Promise<DeleteWriteOpResultObject> => {
    return Collections.FeedbackReport().deleteOne({ _id: new ObjectId(_id) });
};
