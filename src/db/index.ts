import { Collection } from 'mongodb';
import {
    FeedbackReport as FeedbackReportType,
    BugReport as BugReportType,
} from 'lib/interfaces';
import { connectToMongo } from './mongo';
import initFeedbackReports from './feedback-reports';
import initBugReports from './bug-reports';
/**
 * re-export anything from the collection files
 */
export { close, mongoRetry } from './mongo';

/**
 * declare collections here, they won't be undefined before being called
 * guaranteed by calling connect on startup before we ever use any collections
 */
let FeedbackReport: Collection<FeedbackReportType>;
let BugReport: Collection<BugReportType>;

/**
 * connects to mongo and initializes collections
 */
export async function connect(): Promise<void> {
    await connectToMongo();
    // also need to declare collections
    FeedbackReport = initFeedbackReports();
    BugReport = initBugReports();
}

export default {
    FeedbackReport: (): Collection<FeedbackReportType> => FeedbackReport,
    BugReport: (): Collection<BugReportType> => BugReport,
};
