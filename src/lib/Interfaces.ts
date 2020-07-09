interface Name {
    first: string;
    last: string;
}

interface Submitter {
    _id: string;
    name: Name;
}

export interface Report {
    date: string;
    description: string;
    submitter: Submitter;
}

export interface User {
    // TODO: Chane to mongoDb object ID if necessary in the future
    _id: string;
}

export interface FeedbackReport extends Report {
    // Add feedback report properties in the future
}
