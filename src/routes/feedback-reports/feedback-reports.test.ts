import { ObjectId } from 'mongodb';

import Collections, { connect, close } from 'db';
import { FeedbackReport, Submitter } from 'lib/Interfaces';
import request from 'supertest';
import app from 'app';

interface TestFeedbackReport extends FeedbackReport {
    _id: ObjectId;
}

const testSubmitter1: Submitter = {
    _id: new ObjectId().toHexString(),
    name: {
        first: 'Bruce',
        last: 'Banner',
    },
};

const testSubmitter2: Submitter = {
    _id: new ObjectId().toHexString(),
    name: {
        first: 'Peter',
        last: 'Parker',
    },
};

const testReports: TestFeedbackReport[] = [
    {
        _id: new ObjectId(),
        date: new Date().toISOString(),
        description: 'Avengers Assemble!!!',
        submitter: testSubmitter1,
    },
    {
        _id: new ObjectId(),
        date: new Date().toISOString(),
        description: 'Wakanda Forever!!',
        submitter: testSubmitter2,
    },
];

// Connects to database, initializes collections, and seed database before the tests run
beforeAll(async () => {
    await connect();
    await Collections.FeedbackReport().insertMany(testReports);
});

// TODO: Add a better way to remove the report created from create-reports. For now, it is just finds the document from based on the description "I am a test"
// Deletes all the feedback reports that were seeded in the beforeAll hook
afterAll(async () => {
    await Collections.FeedbackReport().deleteOne({
        description: 'I am a test',
    });
    await Collections.FeedbackReport().deleteOne({ _id: testReports[0]._id });
    await Collections.FeedbackReport().deleteOne({ _id: testReports[1]._id });
    await close();
});

describe('/feedback-reports', () => {
    describe('/create-report', () => {
        it('should fail since feedback report data is not sent', async () => {
            const { status } = await request(app).post(
                '/feedback/create-report'
            );
            expect(status).toStrictEqual(404);
        });
        it('should fail since feedback report date is empty', async () => {
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
        it('should fail since feedback report date is missing', async () => {
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
        it('should fail since feedback report description is empty', async () => {
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
        it('should fail since feedback report description is missing', async () => {
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
        it('should fail since feedback report is missing submitter', async () => {
            const { status } = await request(app)
                .post('/feedback/create-report')
                .send({
                    date: new Date().toISOString(),
                    description: 'I am a test',
                });
            expect(status).toStrictEqual(404);
        });
        it('should fail since feedback report submitter object is empty', async () => {
            const { status } = await request(app)
                .post('/feedback/create-report')
                .send({
                    date: new Date().toISOString(),
                    description: 'I am a test',
                    submitter: {},
                });
            expect(status).toStrictEqual(404);
        });
        it('should pass since a valid feedback report is sent', async () => {
            // TODO: Check if the email was sent?
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
        it('should pass', async () => {
            const { status } = await request(app).get('/feedback/get-reports');
            expect(status).toStrictEqual(200);
        });
    });
    describe('/get-reports/:submitterId', () => {
        it('should fail since user object is not sent', async () => {
            const { status } = await request(app).get(
                `/feedback/get-reports/${testSubmitter1._id}`
            );
            expect(status).toStrictEqual(404);
        });
        it('should fail since empty user object is sent', async () => {
            const { status } = await request(app)
                .get(`/feedback/get-reports/${testSubmitter1._id}`)
                .send({
                    user: {},
                });
            expect(status).toStrictEqual(404);
        });
        it('should fail since calling user id and submitter id do not match', async () => {
            const { status } = await request(app)
                .get(`/feedback/get-reports/${testSubmitter1._id}`)
                .send({
                    user: testSubmitter2,
                });
            expect(status).toStrictEqual(404);
        });
        it('should pass since calling user id and submitter id  match', async () => {
            // TODO: Also compare the feedback reports that are sent in the request?
            const { status } = await request(app)
                .get(`/feedback/get-reports/${testSubmitter1._id}`)
                .send({
                    user: testSubmitter1,
                });
            expect(status).toStrictEqual(200);
        });
    });
    describe('/update-report', () => {
        it('should fail since request data is not sent', async () => {
            const { status } = await request(app).post(
                '/feedback/update-report'
            );
            expect(status).toStrictEqual(404);
        });
        it('should fail since Id is not sent', async () => {
            const { status } = await request(app)
                .post('/feedback/update-report')
                .send({
                    newDescription: 'I am a new description',
                    user: testSubmitter1,
                });
            expect(status).toStrictEqual(404);
        });
        it('should fail since empty Id is sent ', async () => {
            const { status } = await request(app)
                .post('/feedback/update-report')
                .send({
                    Id: '',
                    newDescription: 'I am a new description',
                    user: testSubmitter1,
                });
            expect(status).toStrictEqual(404);
        });
        it('should fail since new description is not sent', async () => {
            const { status } = await request(app)
                .post('/feedback/update-report')
                .send({
                    Id: testReports[0]._id,
                    user: testSubmitter1,
                });
            expect(status).toStrictEqual(404);
        });
        it('should fail since empty new description is sent', async () => {
            const { status } = await request(app)
                .post('/feedback/update-report')
                .send({
                    Id: testReports[0]._id,
                    newDescription: '',
                    user: testSubmitter1,
                });
            expect(status).toStrictEqual(404);
        });
        it('should fail since user object is not sent', async () => {
            const { status } = await request(app)
                .post('/feedback/update-report')
                .send({
                    Id: testReports[0]._id,
                    newDescription: 'I am a new description',
                });
            expect(status).toStrictEqual(404);
        });
        it('should fail since empty user object is sent', async () => {
            const { status } = await request(app)
                .post('/feedback/update-report')
                .send({
                    Id: testReports[0]._id,
                    newDescription: '',
                    user: {},
                });
            expect(status).toStrictEqual(404);
        });
        it('should fail since calling user is not owner of the report to update', async () => {
            const { status } = await request(app)
                .post('/feedback/update-report')
                .send({
                    Id: testReports[0]._id,
                    newDescription: 'I am a new description',
                    user: testSubmitter2,
                });
            expect(status).toStrictEqual(404);
        });
        it('should fail since Id sent does not belong to any feedback report in the database', async () => {
            const { status } = await request(app)
                .post('/feedback/update-report')
                .send({
                    Id: new ObjectId(),
                    newDescription: 'I am a new description',
                    user: testSubmitter2,
                });
            expect(status).toStrictEqual(404);
        });
        it('should pass since calling user is owner of the report to update', async () => {
            const { status } = await request(app)
                .post('/feedback/update-report')
                .send({
                    Id: testReports[1]._id,
                    newDescription: 'I am a new description',
                    user: testSubmitter2,
                });
            expect(status).toStrictEqual(200);
        });
    });
    describe('/delete-report', () => {
        it('should fail since request data is not sent', async () => {
            const { status } = await request(app).get(
                '/feedback/delete-report'
            );
            expect(status).toStrictEqual(404);
        });
        it('should fail since Id is not sent', async () => {
            const { status } = await request(app)
                .post('/feedback/delete-report')
                .send({
                    user: testSubmitter1,
                });
            expect(status).toStrictEqual(404);
        });
        it('should fail since empty Id is sent ', async () => {
            const { status } = await request(app)
                .post('/feedback/delete-report')
                .send({
                    Id: '',
                    user: testSubmitter1,
                });
            expect(status).toStrictEqual(404);
        });
        it('should fail since user object is not sent', async () => {
            const { status } = await request(app)
                .post('/feedback/delete-report')
                .send({
                    Id: testReports[0]._id,
                });
            expect(status).toStrictEqual(404);
        });
        it('should fail since empty user object is sent', async () => {
            const { status } = await request(app)
                .post('/feedback/delete-report')
                .send({
                    Id: testReports[0]._id,
                    user: {},
                });
            expect(status).toStrictEqual(404);
        });
        it('should fail since calling user is not owner of the report to update', async () => {
            const { status } = await request(app)
                .post('/feedback/delete-report')
                .send({
                    Id: testReports[0]._id,
                    user: testSubmitter2,
                });
            expect(status).toStrictEqual(404);
        });
        it('should fail since Id sent does not belong to any feedback report in the database', async () => {
            const { status } = await request(app)
                .post('/feedback/delete-report')
                .send({
                    Id: new ObjectId(),
                    user: testSubmitter1,
                });
            expect(status).toStrictEqual(404);
        });
        it('should pass since calling user is owner of the report to delete', async () => {
            const { status } = await request(app)
                .post('/feedback/delete-report')
                .send({
                    Id: testReports[0]._id,
                    user: testSubmitter1,
                });
            expect(status).toStrictEqual(200);
        });
    });
});
