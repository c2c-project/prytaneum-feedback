import { Collection } from 'mongodb';
import { getCollection } from './mongo';
import { BugReport } from '../lib/interfaces';

export default (): Collection<BugReport> =>
    getCollection<BugReport>('bug-reports');
