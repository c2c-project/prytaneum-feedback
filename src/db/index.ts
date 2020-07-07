import { Collection } from 'mongodb';
import { connectToMongo } from './mongo';
import initFeedbackReports, {
    FeedbackReport as FeedbackReportType,
} from './feedback-reports';

/**
 * re-export anything from the collection files
 */
export { close, mongoRetry } from './mongo';

/**
 * declare collections here, they won't be undefined before being called
 * guaranteed by calling connect on startup before we ever use any collections
 */
let FeedbackReport: Collection<FeedbackReportType>;

/**
 * connects to mongo and initializes collections
 */
export async function connect(): Promise<void> {
    await connectToMongo();
    // also need to declare collections
    FeedbackReport = initFeedbackReports();
}

export default {
    FeedbackReport: (): Collection<FeedbackReportType> => FeedbackReport,
};
