import env from '../config/env';
import { MongoClient } from 'mongodb';

export async function connect(): Promise<any> {
    const { DB_URL } = env;
    const db = MongoClient.connect(DB_URL, {
        useUnifiedTopology: true,
    }).catch((err) => console.log(err));

    return db.then((client) => client.db('feedback-portal'));
}

// TODO: replace this with your driver code
export async function query(): Promise<any> {
    return connect().then((db) =>
        db.collection('test').insertOne({
            hello: 'bye',
        })
    );
}
