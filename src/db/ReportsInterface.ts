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
