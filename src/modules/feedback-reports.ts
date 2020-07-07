import feedbackReports, { FeedbackReport } from '../db/feedback-reports';

export const createReport = (
    feedbackReport: Partial<FeedbackReport>
): Promise<any> => {
    const { date, description, submitter } = feedbackReport;
    if (!date) {
        throw Error('Date is required');
    }
    if (!description) {
        throw Error('Description is required');
    }
    if (!submitter) {
        throw Error('Submitter is required');
    }

    return feedbackReports().insertOne({ date, description, submitter });
};

export const getReports = (): Promise<FeedbackReport[]> => {
    return feedbackReports().find().toArray();
};
