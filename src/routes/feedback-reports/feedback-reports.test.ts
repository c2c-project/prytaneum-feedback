import { ObjectId } from 'mongodb';

import Collections, { connect } from 'db';
import { FeedbackReport } from 'lib/Interfaces';
import request from 'supertest';
import app from 'app';

const testReport: FeedbackReport = {
    date: new Date().toISOString(),
    description: 'I am a test',
    submitter: {
        _id: new ObjectId().toHexString(),
        name: {
            first: 'Bruce',
            last: 'Banner',
        },
    },
};
// Connects to database and initializes collections before the tests run
beforeAll(async () => {
    await connect();
});

// TODO: Add a better way to remove the report created from create-reports. For now, it is just finds the document from based on the description "I am a test"
afterAll(async () => {
    await Collections.FeedbackReport().deleteOne({
        description: 'I am a test',
    });
});
describe('/feedback-reports', () => {
    describe('/create-report', () => {
        it('should fail since feedback report data is not sent', async () => {
            const { status } = await request(app).post(
                '/feedback/create-report'
            );
            expect(status).toStrictEqual(404);
        });
        it('should fail since feedback report is missing date - Case 1', async () => {
            const { status } = await request(app)
                .post('/feedback/create-report')
                .send({
                    date: '',
                    description: 'I am a test',
                    submitter: {
                        _id: new ObjectId(),
                        name: {
                            first: 'Tony',
                            last: 'Stark',
                        },
                    },
                });
            expect(status).toStrictEqual(404);
        });
        it('should fail since feedback report is missing date - Case 2', async () => {
            const { status } = await request(app)
                .post('/feedback/create-report')
                .send({
                    description: 'I am a test',
                    submitter: {
                        _id: new ObjectId(),
                        name: {
                            first: 'Captain',
                            last: 'Rogers',
                        },
                    },
                });
            expect(status).toStrictEqual(404);
        });
        it('should fail since feedback report is missing description - Case 1', async () => {
            const { status } = await request(app)
                .post('/feedback/create-report')
                .send({
                    date: new Date().toISOString(),
                    description: '',
                    submitter: {
                        _id: new ObjectId(),
                        name: {
                            first: 'Black',
                            last: 'Widow',
                        },
                    },
                });
            expect(status).toStrictEqual(404);
        });
        it('should fail since feedback report is missing description - Case 2', async () => {
            const { status } = await request(app)
                .post('/feedback/create-report')
                .send({
                    date: new Date().toISOString(),
                    submitter: {
                        _id: new ObjectId(),
                        name: {
                            first: 'Doctor',
                            last: 'Strange',
                        },
                    },
                });
            expect(status).toStrictEqual(404);
        });
        // TODO: Discuss with David case when submitter is an empty object
        it('should fail since feedback report is missing submitter - Case 1', async () => {
            const { status } = await request(app)
                .post('/feedback/create-report')
                .send({
                    date: new Date().toISOString(),
                    description: 'I am a test',
                });
            expect(status).toStrictEqual(404);
        });
        it('should pass since a valid feedback report is sent', async () => {
            const { status } = await request(app)
                .post('/feedback/create-report')
                .send({
                    date: new Date().toISOString(),
                    description: 'I am a test',
                    submitter: {
                        _id: new ObjectId(),
                        name: {
                            first: 'Bruce',
                            last: 'Banner',
                        },
                    },
                });
            expect(status).toStrictEqual(200);
        });
    });
    describe('/get-reports', () => {
        // TODO: Test by calling from Admin service. Expect a 200 status and an array of feedback reports
        // TODO: Test by calling from service that is not the Admin service. Expect a 404 status
    });
});
