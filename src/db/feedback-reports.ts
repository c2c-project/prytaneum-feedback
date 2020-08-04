import { Collection } from 'mongodb';
import { getCollection } from './mongo';
import { FeedbackReport } from '../lib/interfaces';

export default (): Collection<FeedbackReport> =>
    getCollection<FeedbackReport>('feedback-reports');
