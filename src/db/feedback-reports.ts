import { Collection } from 'mongodb';
import { getCollection } from './mongo';
import { FeedbackReport } from '../lib/Interfaces';

export default (): Collection<FeedbackReport> =>
    getCollection<FeedbackReport>('feedback-reports');
