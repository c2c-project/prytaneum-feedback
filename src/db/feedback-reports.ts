import { Collection } from 'mongodb';
import { getCollection } from './mongo';
import { Report } from './ReportsInterface';

export interface FeedbackReport extends Report {
    // Adds future feedback report properties in the future
}

export default (): Collection<FeedbackReport> =>
    getCollection<FeedbackReport>('feedback-reports');
