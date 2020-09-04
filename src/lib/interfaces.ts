import { ObjectId } from 'mongodb';

export interface User {
    _id: string;
}

export interface Reply {
    content: string;
    repliedBy: User;
    repliedDate: Date;
}
export interface Report {
    _id?: ObjectId;
    date: Date | string;
    description: string;
    submitterId: string;
    resolved?: boolean;
    replies: Reply[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface FeedbackReport extends Report {
    // Add feedback report properties in the future
}

export interface BugReport extends Report {
    townhallId: string;
}
