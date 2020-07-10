import { ObjectId } from 'mongodb';

export interface Report {
    _id?: ObjectId;
    date: string;
    description: string;
    submitterId: string;
}

export interface User {
    // TODO: Change to mongoDb object ID if necessary in the future
    _id: string;
}

export interface FeedbackReport extends Report {
    // Add feedback report properties in the future
}
