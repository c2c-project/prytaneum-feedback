import { Collection, ObjectId } from 'mongodb';

import { getCollection } from './mongo';

interface Example {
    _id: ObjectId;
}

export default (): Collection<Example> => getCollection<Example>('example');
