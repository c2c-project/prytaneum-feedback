import { ObjectId } from 'mongodb';

export interface Report {
    _id?: ObjectId;
    date: Date | string;
    description: string;
    submitterId: string;
    resolved: boolean;
}

export interface User {
    _id: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface FeedbackReport extends Report {
    // Add feedback report properties in the future
}

export interface BugReport extends Report {
    townhallId: string;
}
