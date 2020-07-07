import { InsertOneWriteOpResult, WithId } from 'mongodb';

import Collections from 'db';
import { FeedbackReport } from 'db/feedback-reports';

export const createReport = (
    feedbackReport: Partial<FeedbackReport>
): Promise<InsertOneWriteOpResult<WithId<FeedbackReport>>> => {
    const { date, description, submitter } = feedbackReport;
    // TO DO: ADD MORE VERBOSE VALIDATION
    if (!date) {
        throw Error('Date is required');
    }
    if (!description) {
        throw Error('Description is required');
    }
    if (!submitter) {
        throw Error('Submitter is required');
    }

    return Collections.FeedbackReport().insertOne({
        date,
        description,
        submitter,
    });
};

export const getReports = (): Promise<FeedbackReport[]> => {
    return Collections.FeedbackReport().find().toArray();
};
