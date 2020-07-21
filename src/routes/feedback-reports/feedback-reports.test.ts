import { ObjectId } from 'mongodb';

import Collections, { connect, close } from 'db';
import { FeedbackReport, User } from 'lib/interfaces';
import request from 'supertest';
import app from 'app';

const testUser1: User = {
    _id: new ObjectId().toHexString(),
};

const testUser2: User = {
    _id: new ObjectId().toHexString(),
};

const testReports: FeedbackReport[] = [
    {
        _id: new ObjectId(),
        date: new Date().toISOString(),
        description: 'Avengers Assemble!!!',
        submitterId: testUser1._id,
    },
    {
        _id: new ObjectId(),
        date: new Date().toISOString(),
        description: 'Wakanda Forever!!',
        submitterId: testUser2._id,
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
    await Collections.FeedbackReport().deleteMany({
        submitterId: testUser1._id,
    });
    await Collections.FeedbackReport().deleteOne({ _id: testReports[0]._id });
    await Collections.FeedbackReport().deleteOne({ _id: testReports[1]._id });
    await close();
});

describe('feedback-reports', () => {
    describe('/create-report', () => {
        it('should fail since feedback report data is not sent', async () => {
            const { status } = await request(app).post(
                '/feedback/create-report'
            );
            expect(status).toStrictEqual(400);
        });
        it('should fail since feedback report date is empty', async () => {
            const { status } = await request(app)
                .post('/feedback/create-report')
                .send({
                    date: '',
                    description: 'I am a test',
                    user: testUser1,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since feedback report date is missing', async () => {
            const { status } = await request(app)
                .post('/feedback/create-report')
                .send({
                    description: 'I am a test',
                    user: testUser1,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since feedback report description is empty', async () => {
            const { status } = await request(app)
                .post('/feedback/create-report')
                .send({
                    date: new Date().toISOString(),
                    description: '',
                    user: testUser1,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since feedback report description is missing', async () => {
            const { status } = await request(app)
                .post('/feedback/create-report')
                .send({
                    date: new Date().toISOString(),
                    user: testUser1,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since request is missing user', async () => {
            const { status } = await request(app)
                .post('/feedback/create-report')
                .send({
                    date: new Date().toISOString(),
                    description: 'I am a test',
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since user object is empty', async () => {
            const { status } = await request(app)
                .post('/feedback/create-report')
                .send({
                    date: new Date().toISOString(),
                    description: 'I am a test',
                    user: {},
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since user object does not have id', async () => {
            const { status } = await request(app)
                .post('/feedback/create-report')
                .send({
                    date: new Date().toISOString(),
                    description: 'I am a test',
                    user: {
                        junk: '28tnvn84',
                    },
                });
            expect(status).toStrictEqual(400);
        });
        it('should pass since a valid feedback report is sent', async () => {
            // TODO: Check if the email was sent => Spy on the emit function on rabbitmq
            const { status } = await request(app)
                .post('/feedback/create-report')
                .send({
                    date: new Date().toISOString(),
                    description: 'I am a test',
                    user: testUser1,
                });
            expect(status).toStrictEqual(200);
        });
        it('should pass although random string values are sent in feedback report fields', async () => {
            const { status } = await request(app)
                .post('/feedback/create-report')
                .send({
                    date:
                        '514nr89ptyew8vtyn12485vn4751b514nr89ptye514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefvw8vtyn12485vn4751b517248bfct71284v5tg246758ob234b514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv1fwwevweefw514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob514nr89ptyew8vtyn12485vn4751b514nr89ptye514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefvw8vtyn12485vn4751b517248bfct71284v5tg246758ob234b514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv1fwwevweefw514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1514nr89ptyew8vtyn12485vn4751b514nr89ptye514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485514nr89ptyew8vtyn12485vn4751b514nr89ptye514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefvw8vtyn12485vn4751b517248bfct71284v5tg246758ob234b514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv1fwwevweefw514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefvefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b514nr89ptye514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefvw8vtyn12485vn4751b517248bfct71284v5tg246758ob234b514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv1fwwevweefw514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefvefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b514nr89ptye514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefvw8vtyn12485vn4751b517248bfct71284v5tg246758ob234b514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv1fwwevweefw514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefvefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b514nr89ptye514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefvw8vtyn12485vn4751b517248bfct71284v5tg246758ob234b514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv1fwwevweefw514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefvefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefvvn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefvw8vtyn12485vn4751b517248bfct71284v5tg246758ob234b514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv1fwwevweefw514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefvefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefvfwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefvefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv234b1fwwevweefwefvefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv',
                    description:
                        '514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12514nr89ptyew8vtyn12485vn4751b514nr89ptye514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefvw8vtyn12485vn4751b517248bfct71284v5tg246758ob234b514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv1fwwevweefw514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefvefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b514nr89ptye514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefvw8vtyn12485vn4751b517248bfct71284v5tg246758ob234b514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv1fwwevweefw514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefvefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b514nr89ptye514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefvw8vtyn12485vn4751b517248bfct71284v5tg246758ob234b514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv1fwwevweefw514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefvefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b514nr89ptye514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefvw8vtyn12485vn4751b517248bfct71284v5tg246758ob234b514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv1fwwevweefw514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefvefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b514nr89ptye514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefvw8vtyn12485vn4751b517248bfct71284v5tg246758ob234b514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv1fwwevweefw514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefvefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b514nr89ptye514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefvw8vtyn12485vn4751b517248bfct71284v5tg246758ob234b514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv1fwwevweefw514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefvefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b514nr89ptye514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefvw8vtyn12485vn4751b517248bfct71284v5tg246758ob234b514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv1fwwevweefw514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefvefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv12485vn4751b517248bfct71514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefv234b1fwwevweefw514nr89ptyew8vtyn12485vn4751b514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv514nr89ptyew8vtyn12485vn4751b517248bfct71284v5tg246758ob234b1fwwevweefwefv517248bfct71284v5tg246758ob234b1fwwevweefwefvefv',
                    user: testUser1,
                });
            expect(status).toStrictEqual(200);
        });
        it('Should fail since big positive integer values break the insertion of document in db', async () => {
            const { status } = await request(app)
                .post('/feedback/create-report')
                .send({
                    date: 241436545812618945612485614584554351234563456345636324566524552525245458246596534912345123745123741523475473541237412534651026512735672562137128456125641456891724587245451255524143654581261894561248561458456524524545824659376879325652523542462465349123451237451237415234754735412374125346510265127356725621371284561256414568917245872454512555125125,
                    description: 2414365458126189456124856145845652452454582465937687932565252354246246534912345123745123741523475473541237412534651026512735672562137128456125641456891724587245451255524143654581261894561248561458456524524545824659376879325652523542462465349123451237451237415234754735412374125346510265127356725621371284561256414568917245872454512555125125,
                    user: testUser1,
                });
            expect(status).toStrictEqual(400);
        });
        it('Should fail since big negative integer values break the insertion of document in db', async () => {
            const { status } = await request(app)
                .post('/feedback/create-report')
                .send({
                    date: -241436545812618945612485614584554351234563456345636324566524552525245458246596534912345123745123741523475473541237412534651026512735672562137128456125641456891724587245451241436545812618945612485614584565245245458246593768793256525235424624653491234512374512374152347547354123741253465102651273567256213712845612564145689172458724545125551252555125,
                    description: -2414365458126189456124856145845652452454582465937687932565252354246246534912345123745123741523475473541237412534651026512735672562137128456125641456891724587245451255512524143654581261894561248561458456524524545824659376879325652523542462465349123451237451237415234754735412374125346510265127356725621371284561256414568917245872454512555125,
                    user: testUser1,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since undefined values are sent', async () => {
            const { status } = await request(app)
                .post('/feedback/create-report')
                .send({
                    date: undefined,
                    description: undefined,
                    user: undefined,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since null values are sent', async () => {
            const { status } = await request(app)
                .post('/feedback/create-report')
                .send({
                    date: null,
                    description: null,
                    user: null,
                });
            expect(status).toStrictEqual(400);
        });
    });
    describe('/get-reports', () => {
        // TODO: Test by calling from Admin service. Expect a 200 status and an array of feedback reports
        // TODO: Test by calling from service that is not the Admin service. Expect a 400 status
        it('should pass although no page is provided', async () => {
            const { status } = await request(app).get('/feedback/get-reports');
            expect(status).toStrictEqual(200);
        });
        it('should pass since zero page number zero returns first page', async () => {
            const { status } = await request(app).get(
                '/feedback/get-reports?page=0'
            );
            expect(status).toStrictEqual(200);
        });
        it('should pass since page is provided', async () => {
            const { status } = await request(app).get(
                '/feedback/get-reports?page=1'
            );
            expect(status).toStrictEqual(200);
        });
        it('should pass since page number greater than current number of pages returns 0 feedback reports', async () => {
            const { status } = await request(app).get(
                '/feedback/get-reports?page=2'
            );
            expect(status).toStrictEqual(200);
        });
        it('should pass since negative page number gets returns first page', async () => {
            const { status } = await request(app).get(
                '/feedback/get-reports?page=-1'
            );
            expect(status).toStrictEqual(200);
        });
        it('should pass since negative page number gets converted to page zero', async () => {
            const { status } = await request(app).get(
                '/feedback/get-reports?page=-135423652764745672745741235'
            );
            expect(status).toStrictEqual(200);
        });
        it('should fail since big positive page number is passed', async () => {
            const { status } = await request(app).get(
                '/feedback/get-reports?page=135423652764745672745741235'
            );
            expect(status).toStrictEqual(400);
        });
        it('should pass since big negative page number gets converted to page zero', async () => {
            const { status } = await request(app).get(
                '/feedback/get-reports?page=-413542613456735673517573456735671357576357356735262356235634623463461234623462346234562346234623463463426233463456356356356356356623632462346'
            );
            expect(status).toStrictEqual(200);
        });
        it('should fail since even bigger positive page number is passed', async () => {
            const { status } = await request(app).get(
                '/feedback/get-reports?page=413542613456735673517573456735671357576357356735262356235634623463461234623462346234562346234623463463426233463456356356356356356623632462346'
            );
            expect(status).toStrictEqual(400);
        });
        it('should pass since string for page number gets converted to page zero', async () => {
            const { status } = await request(app).get(
                '/feedback/get-reports?page=@'
            );
            expect(status).toStrictEqual(200);
        });
        it('should pass since random long string for page number gets converted to page zero', async () => {
            const { status } = await request(app).get(
                '/feedback/get-reports?page=vrtwerby456r5weyberwthy356456yertbgy53yb456yhnby'
            );
            expect(status).toStrictEqual(200);
        });
        it('should pass since random even longer string for page number gets converted to page zero', async () => {
            const { status } = await request(app).get(
                '/feedback/get-reports?page=page=ecvtrertbwtrnbtwernwterwtertnwertnwerterntewrtwerecvtrertbwtrnbtwernwterwtertnwertnwerterntewrtwerecvtrertbwtrnbtwernwterwtertnwertnwerterntewrtwerecvtrertbwtrnbtwernwterwtertnwertnwerterntewrtwerecvtrertbwtrnbtwernwterwtertnwertnwerterntewrtwerecvtrertbwtrnbtwernwterwtertnwertnwerterntewrtwerecvtrertbwtrnbtwernwterwtertnwertnwerterntewrtwerecvtrertbwtrnbtwernwterwtertnwertnwerterntewrtwerecvtrertbwtrnbtwernwterwtertnwertnwerterntewrtwerecvtrertbwtrnbtwernwterwtertnwertnwerterntewrtwerecvtrertbwtrnbtwernwterwtertnwertnwerterntewrtwerecvtrertbwtrnbtwernwterwtertnwertnwerterntewrtwerecvtrertbwtrnbtwernwterwtertnwertnwerterntewrtwerecvtrertbwtrnbtwernwterwtertnwertnwerterntewrtwerecvtrertbwtrnbtwernwterwtertnwertnwerterntewrtwerecvtrertbwtrnbtwernwterwtertnwertnwerterntewrtwerecvtrertecvtrertbwtrnbtwernwterwtertnwertnwerterntewrtwerecvtrertbwtrnbtwernwterwtertnwertnwerterntewrtwerecvtrertbwtrnbtwernwteecvtrertbwtrnbtwernwterwtertnwertn'
            );
            expect(status).toStrictEqual(200);
        });
        it('should pass since empty page number gets converted to page zero', async () => {
            const { status } = await request(app).get(
                '/feedback/get-reports?page='
            );
            expect(status).toStrictEqual(200);
        });
    });
    describe('/get-reports/:submitterId', () => {
        it('should fail since user object is not sent', async () => {
            const { status } = await request(app).get(
                `/feedback/get-reports/${testUser1._id}`
            );
            expect(status).toStrictEqual(400);
        });
        it('should fail since empty user object is sent', async () => {
            const { status } = await request(app)
                .get(`/feedback/get-reports/${testUser1._id}`)
                .send({
                    user: {},
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since user object is undefined', async () => {
            const { status } = await request(app)
                .get(`/feedback/get-reports/${testUser1._id}`)
                .send({
                    user: undefined,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since user object is null', async () => {
            const { status } = await request(app)
                .get(`/feedback/get-reports/${testUser1._id}`)
                .send({
                    user: null,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since calling user id and submitter id do not match', async () => {
            const { status } = await request(app)
                .get(`/feedback/get-reports/${testUser1._id}`)
                .send({
                    user: testUser2,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since random long string is sent for submitterId', async () => {
            const { status } = await request(app)
                .get(
                    '/feedback/get-reports/42634562576256723456hb4yrteyg354642634562576256723456hb4yrteyg35462j563gtjnrtyerth3456n345ygvb356h53bh3524b5rt3v4rt24b24rb43rt534rgf453h6356v55yt5fvtrt354t54ytny54y35y4gert432n6356n42634562576256723456hb4yrteyg35462j563gtjnrtyerth3456n345ygvb356h53bh3524b5rt3v4rt24b24rb43rt534rgf453h6356v55yt5fvtrt354t54ytny54y35y4gert432n6356n42634562576256723456hb4yrteyg35462j563gtjnrtyerth3456n345ygvb356h53bh3524b5rt3v4rt24b24rb43rt534rgf453h6356v55yt5fvtrt354t54ytny54y35y4gert432n6356n42634562576256723456hb4yrteyg35462j563gtjnrtyerth3456n345ygvb356h53bh3524b5rt3v4rt24b24rb43rt534rgf453h6356v55yt5fvtrt354t54ytny54y35y4gert432n6356n42634562576256723456hb4yrteyg35462j563gtjnrtyerth3456n345ygvb356h53bh3524b5rt3v4rt24b24rb43rt534rgf453h6356v55yt5fvtrt354t54ytny54y35y4gert432n6356n42634562576256723456hb4yrteyg35462j563gtjnrtyerth3456n345ygvb356h53bh3524b5rt3v4rt24b24rb43rt534rgf453h6356v55yt5fvtrt354t54ytny54y35y4gert432n6356n2j563gtjnrtyerth3456n345ygvb356h53bh3524b5rt3v4rt24b24rb43rt534rgf453h6356v55yt5fvtrt354t54ytny54y35y4gert432n6356n'
                )
                .send({
                    user: testUser2,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since random long string and integer values are sent for submitterId and user', async () => {
            const { status } = await request(app)
                .get(
                    '/feedback/get-reports/42634562576256723456h42634562576256723456hb4yrteyg35462j563gtjnrtyerth3456n345ygvb356h53bh3524b5rt3v4rt24b24rb43rt534rgf453h6356v55yt5fvtrt354t54ytny54y35y4gert432n6356nb4yrteyg35462j563gtjnrtyerth3456n345ygvb356h53bh3524b5rt3v4rt24b24rb43rt534rgf453h6356v55yt5fvtrt3542634562576256723456hb4yrteyg35462j563gtjnrtyerth3456n345ygvb356h53bh3524b5rt3v4rt24b24rb43rt534rgf453h6356v55yt5fvtrt354t54ytny54y35y4gert432n6356n42634562542634562576256723456hb4yrteyg35462j563gtjnrtyerth3456n345ygvb356h53bh3524b5rt3v4rt24b24rb43rt534rgf453h6356v55yt5fvtrt354t54ytny54y35y4gert432n6356n6256723456hb4yrteyg35462j563gtjnrtyerth3456n345ygvb356h53bh3524b5rt3v4rt24b24rb43rt534rgf453h6356v55yt5fvtrt354t54ytny54y35y4gert432n6356n4t54ytny54y35y4gert43242634562576256723456hb4yrteyg35462j563gtjnrtyerth3456n345ygvb356h53bh3524b5rt3v4rt24b24rb43rt534rgf453h6356v55yt5fvtrt354t54ytny54y35y4gert432n6356n42634562576256723456hb4yrteyg35462j563gtjnrtyerth3456n345ygvb356h53bh3524b5rt3v4rt24b24rb43rt534rgf453h6356v55yt5fvtrt354t54ytny54y35y4gert432n6356nn6356n'
                )
                .send({
                    user: 128456231875162345812465012785621347859623582461512379081246571235627561237126347126378265021783412845623187516234581246501278562134785962358246151237908124657123562756123712634712637826502178345621457126358912345612485265062451234512561245681236458234756123850121256128356283056213580213612128456231875162345812465012785621347859623582461512379081246571235627561237126347126378265021783456214571263589123456124852650624512345125612456812364582347561238501212561283562830562135802136121284562318751623458124650127856213478596235824615123790812465712356275612371263471263782650217834562145712635891234561248526506245123451256124568123645823475612385012125612835628305621358021361256214571263589123456124852650624512345125612456812364582347561212845623187516234581246501278562134785962358246151237908124657123562756123712634712637826502178345621457126358912345612485265062451234512561245681236458234756123850121256128356283056213580213612850121256128356283056213580213612,
                });
            expect(status).toStrictEqual(400);
        });
        it('should pass since random submitter ids match but do not belong to any feedback report', async () => {
            const { status } = await request(app)
                .get(
                    '/feedback/get-reports/128456231875162345812465012785621347859623582461512379081246571235627561237126347126378265021783412845623187516234581246501278562134785962358246151237908124657123562756123712634712637826502178345621457126358912345612485265062451234512561245681236458234756123850121256128356283056213580213612128456231875162345812465012785621347859623582461512379081246571235627561237126347126378265021783456214571263589123456124852650624512345125612456812364582347561238501212561283562830562135802136121284562318751623458124650127856213478596235824615123790812465712356275612371263471263782650217834562145712635891234561248526506245123451256124568123645823475612385012125612835628305621358021361256214571263589123456124852650624512345125612456812364582347561212845623187516234581246501278562134785962358246151237908124657123512845623187516234581246501278562134785962358246151237908124657123562756123712634712637826502178341284562318751623458124650127856213478596235824615123790812465712356275612371263471263782650217834562145712635891234561248526506245123451256124568123645823475612385012125612835628305621358021361212845623187516234581246501278562134785962358246151237908124657123562756123712634712637826502178345621457126358912345612485265062451234512561245681236458234756123850121256128356283056213580213612128456231875162345812465012785621347859623582461512379081246571235627561237126347126378265021783456214571263589123456124852650624512345125612456812364582347561238501212561283562830562135802136125621457126358912345612485265062451234512561245681236458234756121284562318751623458124650127856213478596235824615123790812465712356275612371263471263782650217834562145712635891234561248526506245123451256124568123645823475612385012125612835628305621358021361285012125612835628305621358021361262756123712634712637826502178345621457126358912345612485265062451234512561245681236458234756123850121256128356283056213580213612850121256128356283056213580213612'
                )
                .send({
                    user: {
                        _id:
                            '128456231875162345812465012785621347859623582461512379081246571235627561237126347126378265021783412845623187516234581246501278562134785962358246151237908124657123562756123712634712637826502178345621457126358912345612485265062451234512561245681236458234756123850121256128356283056213580213612128456231875162345812465012785621347859623582461512379081246571235627561237126347126378265021783456214571263589123456124852650624512345125612456812364582347561238501212561283562830562135802136121284562318751623458124650127856213478596235824615123790812465712356275612371263471263782650217834562145712635891234561248526506245123451256124568123645823475612385012125612835628305621358021361256214571263589123456124852650624512345125612456812364582347561212845623187516234581246501278562134785962358246151237908124657123512845623187516234581246501278562134785962358246151237908124657123562756123712634712637826502178341284562318751623458124650127856213478596235824615123790812465712356275612371263471263782650217834562145712635891234561248526506245123451256124568123645823475612385012125612835628305621358021361212845623187516234581246501278562134785962358246151237908124657123562756123712634712637826502178345621457126358912345612485265062451234512561245681236458234756123850121256128356283056213580213612128456231875162345812465012785621347859623582461512379081246571235627561237126347126378265021783456214571263589123456124852650624512345125612456812364582347561238501212561283562830562135802136125621457126358912345612485265062451234512561245681236458234756121284562318751623458124650127856213478596235824615123790812465712356275612371263471263782650217834562145712635891234561248526506245123451256124568123645823475612385012125612835628305621358021361285012125612835628305621358021361262756123712634712637826502178345621457126358912345612485265062451234512561245681236458234756123850121256128356283056213580213612850121256128356283056213580213612',
                    },
                });
            expect(status).toStrictEqual(200);
        });
        it('should fail since random submitter ids match but are not the same type', async () => {
            const { status } = await request(app)
                .get(
                    '/feedback/get-reports/128456231875162345812465012785621347859623582461512379081246571235627561237126347126378265021783412845623187516234581246501278562134785962358246151237908124657123562756123712634712637826502178345621457126358912345612485265062451234512561245681236458234756123850121256128356283056213580213612128456231875162345812465012785621347859623582461512379081246571235627561237126347126378265021783456214571263589123456124852650624512345125612456812364582347561238501212561283562830562135802136121284562318751623458124650127856213478596235824615123790812465712356275612371263471263782650217834562145712635891234561248526506245123451256124568123645823475612385012125612835628305621358021361256214571263589123456124852650624512345125612456812364582347561212845623187516234581246501278562134785962358246151237908124657123512845623187516234581246501278562134785962358246151237908124657123562756123712634712637826502178341284562318751623458124650127856213478596235824615123790812465712356275612371263471263782650217834562145712635891234561248526506245123451256124568123645823475612385012125612835628305621358021361212845623187516234581246501278562134785962358246151237908124657123562756123712634712637826502178345621457126358912345612485265062451234512561245681236458234756123850121256128356283056213580213612128456231875162345812465012785621347859623582461512379081246571235627561237126347126378265021783456214571263589123456124852650624512345125612456812364582347561238501212561283562830562135802136125621457126358912345612485265062451234512561245681236458234756121284562318751623458124650127856213478596235824615123790812465712356275612371263471263782650217834562145712635891234561248526506245123451256124568123645823475612385012125612835628305621358021361285012125612835628305621358021361262756123712634712637826502178345621457126358912345612485265062451234512561245681236458234756123850121256128356283056213580213612850121256128356283056213580213612'
                )
                .send({
                    user: {
                        _id: 128456231875162345812465012785621347859623582461512379081246571235627561237126347126378265021783412845623187516234581246501278562134785962358246151237908124657123562756123712634712637826502178345621457126358912345612485265062451234512561245681236458234756123850121256128356283056213580213612128456231875162345812465012785621347859623582461512379081246571235627561237126347126378265021783456214571263589123456124852650624512345125612456812364582347561238501212561283562830562135802136121284562318751623458124650127856213478596235824615123790812465712356275612371263471263782650217834562145712635891234561248526506245123451256124568123645823475612385012125612835628305621358021361256214571263589123456124852650624512345125612456812364582347561212845623187516234581246501278562134785962358246151237908124657123512845623187516234581246501278562134785962358246151237908124657123562756123712634712637826502178341284562318751623458124650127856213478596235824615123790812465712356275612371263471263782650217834562145712635891234561248526506245123451256124568123645823475612385012125612835628305621358021361212845623187516234581246501278562134785962358246151237908124657123562756123712634712637826502178345621457126358912345612485265062451234512561245681236458234756123850121256128356283056213580213612128456231875162345812465012785621347859623582461512379081246571235627561237126347126378265021783456214571263589123456124852650624512345125612456812364582347561238501212561283562830562135802136125621457126358912345612485265062451234512561245681236458234756121284562318751623458124650127856213478596235824615123790812465712356275612371263471263782650217834562145712635891234561248526506245123451256124568123645823475612385012125612835628305621358021361285012125612835628305621358021361262756123712634712637826502178345621457126358912345612485265062451234512561245681236458234756123850121256128356283056213580213612850121256128356283056213580213612,
                    },
                });
            expect(status).toStrictEqual(400);
        });
        it('should pass since calling user id and submitter id  match', async () => {
            const { status } = await request(app)
                .get(`/feedback/get-reports/${testUser1._id}`)
                .send({
                    user: testUser1,
                });
            expect(status).toStrictEqual(200);
        });
    });
    describe('/update-report', () => {
        it('should fail since request data is not sent', async () => {
            const { status } = await request(app).post(
                '/feedback/update-report'
            );
            expect(status).toStrictEqual(400);
        });
        it('should fail since Id is not sent', async () => {
            const { status } = await request(app)
                .post('/feedback/update-report')
                .send({
                    newDescription: 'I am a new description',
                    user: testUser1,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since empty Id is sent ', async () => {
            const { status } = await request(app)
                .post('/feedback/update-report')
                .send({
                    _id: '',
                    newDescription: 'I am a new description',
                    user: testUser1,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since undefined Id is sent ', async () => {
            const { status } = await request(app)
                .post('/feedback/update-report')
                .send({
                    _id: undefined,
                    newDescription: 'I am a new description',
                    user: testUser1,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since null Id is sent ', async () => {
            const { status } = await request(app)
                .post('/feedback/update-report')
                .send({
                    _id: null,
                    newDescription: 'I am a new description',
                    user: testUser1,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since long random Id does not match any document in db', async () => {
            const { status } = await request(app)
                .post('/feedback/update-report')
                .send({
                    _id:
                        'y189fv42ynr348179rpybnv123845y1p289fnr57wv24nr7b148pv234nr472nbrt8;9ewd289n4yuqwerg7gv8br812rgvy2rfc213rbybevgwbrtnywertyerwmyweyweymeyeyneym3fu8yhdugw34r',
                    newDescription: 'I am a new description',
                    user: testUser1,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since new description is not sent', async () => {
            const { status } = await request(app)
                .post('/feedback/update-report')
                .send({
                    _id: testReports[0]._id,
                    user: testUser1,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since empty new description is sent', async () => {
            const { status } = await request(app)
                .post('/feedback/update-report')
                .send({
                    _id: testReports[0]._id,
                    newDescription: '',
                    user: testUser1,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since undefined new description is sent', async () => {
            const { status } = await request(app)
                .post('/feedback/update-report')
                .send({
                    _id: testReports[0]._id,
                    newDescription: undefined,
                    user: testUser1,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since null new description is sent', async () => {
            const { status } = await request(app)
                .post('/feedback/update-report')
                .send({
                    _id: testReports[0]._id,
                    newDescription: null,
                    user: testUser1,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since user object is not sent', async () => {
            const { status } = await request(app)
                .post('/feedback/update-report')
                .send({
                    _id: testReports[0]._id,
                    newDescription: 'I am a new description',
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since empty user object is sent', async () => {
            const { status } = await request(app)
                .post('/feedback/update-report')
                .send({
                    _id: testReports[0]._id,
                    newDescription: 'I am a new description',
                    user: {},
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since undefined user object is sent', async () => {
            const { status } = await request(app)
                .post('/feedback/update-report')
                .send({
                    _id: testReports[0]._id,
                    newDescription: 'I am a new description',
                    user: undefined,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since null user object is sent', async () => {
            const { status } = await request(app)
                .post('/feedback/update-report')
                .send({
                    _id: testReports[0]._id,
                    newDescription: 'I am a new description',
                    user: null,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since calling user is not owner of the report to update', async () => {
            const { status } = await request(app)
                .post('/feedback/update-report')
                .send({
                    _id: testReports[0]._id,
                    newDescription: 'I am a new description',
                    user: testUser2,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since calling user object does not contain an id property', async () => {
            const { status } = await request(app)
                .post('/feedback/update-report')
                .send({
                    _id: testReports[0]._id,
                    newDescription: 'I am a new description',
                    user: {
                        garbage:
                            'fwuievh8wbq[yt2q89345v9rahc9rfevwugrtquoilb;trq4tvqbt',
                    },
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since calling user is a long integer value', async () => {
            const { status } = await request(app)
                .post('/feedback/update-report')
                .send({
                    _id: testReports[0]._id,
                    newDescription: 'I am a new description',
                    user: 146514856912450128512635128365123084561380562128512635128365123084561380562128512635128361285126351283651230845613805625123084561380562128512635128365123084561380562128512635128365123084561380562128512635128365123084561380562128512635128365123084561380562128512635128365123084561380562128512635128365123084561380562,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since Id sent does not belong to any feedback report in the database', async () => {
            const { status } = await request(app)
                .post('/feedback/update-report')
                .send({
                    _id: new ObjectId(),
                    newDescription: 'I am a new description',
                    user: testUser2,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since undefined is sent for all fields', async () => {
            const { status } = await request(app)
                .post('/feedback/update-report')
                .send({
                    _id: undefined,
                    newDescription: undefined,
                    user: undefined,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since null is sent for all fields', async () => {
            const { status } = await request(app)
                .post('/feedback/update-report')
                .send({
                    _id: null,
                    newDescription: null,
                    user: null,
                });
            expect(status).toStrictEqual(400);
        });

        it('should pass since calling user is owner of the report to update', async () => {
            const { status } = await request(app)
                .post('/feedback/update-report')
                .send({
                    _id: testReports[1]._id,
                    newDescription: 'I am a new description',
                    user: testUser2,
                });
            expect(status).toStrictEqual(200);
        });
    });
    describe('/delete-report', () => {
        it('should fail since request data is not sent', async () => {
            const { status } = await request(app).post(
                '/feedback/delete-report'
            );
            expect(status).toStrictEqual(400);
        });
        it('should fail since Id is not sent', async () => {
            const { status } = await request(app)
                .post('/feedback/delete-report')
                .send({
                    user: testUser1,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since empty Id is sent ', async () => {
            const { status } = await request(app)
                .post('/feedback/delete-report')
                .send({
                    _id: '',
                    user: testUser1,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since undefined Id is sent ', async () => {
            const { status } = await request(app)
                .post('/feedback/delete-report')
                .send({
                    _id: undefined,
                    user: testUser1,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since null Id is sent ', async () => {
            const { status } = await request(app)
                .post('/feedback/delete-report')
                .send({
                    _id: null,
                    user: testUser1,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since user object is not sent', async () => {
            const { status } = await request(app)
                .post('/feedback/delete-report')
                .send({
                    _id: testReports[0]._id,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since empty user object is sent', async () => {
            const { status } = await request(app)
                .post('/feedback/delete-report')
                .send({
                    _id: testReports[0]._id,
                    user: {},
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since undefined user object is sent', async () => {
            const { status } = await request(app)
                .post('/feedback/delete-report')
                .send({
                    _id: testReports[0]._id,
                    user: undefined,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since null user object is sent', async () => {
            const { status } = await request(app)
                .post('/feedback/delete-report')
                .send({
                    _id: testReports[0]._id,
                    user: null,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since user object does not have id', async () => {
            const { status } = await request(app)
                .post('/feedback/delete-report')
                .send({
                    _id: testReports[0]._id,
                    user: {
                        junk: '2bfofc4',
                    },
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since calling user is not owner of the report to update', async () => {
            const { status } = await request(app)
                .post('/feedback/delete-report')
                .send({
                    _id: testReports[0]._id,
                    user: testUser2,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since Id sent does not belong to any feedback report in the database', async () => {
            const { status } = await request(app)
                .post('/feedback/delete-report')
                .send({
                    _id: new ObjectId(),
                    user: testUser1,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since large random integer value is sent for the Id', async () => {
            const { status } = await request(app)
                .post('/feedback/delete-report')
                .send({
                    _id: 5218345612489051234851235812365712385962385218345612489051234851235812365712385962385167328957123452168341285612341254351673289571234521683412856123412543521834561248905123485123581236571238596238516732895712345216834128561234125435218345612489051234851235812365712385962385167328957123452168341285612341254352183456124890512348512358123657123859623851673289571234521683412856123412543,
                    user: testUser1,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since long string value is sent for the Id', async () => {
            const { status } = await request(app)
                .post('/feedback/delete-report')
                .send({
                    _id:
                        'ybht8439ywb8retynvgrweyfvbweulrytq84rqwn8tyqe8wghrtebywerntwernertmnwertyerybwrtynwrtywrtywnmwrtywrthywtywernrtqwlen8tvqweuthgvnfqudgqcb789ert7v2p8934tbver78w9ytvbq89wertytbnqrietolrgrgrvbuupgbhbtvbvbrtvbtvbobtvotvbowryuwertvby7i8op8bwertvbbrbeweqefweufuewvybqwertbuipqweyfrb8qweyr8qwepyrtuewylgftvruntybqwertluvifugrbtyurgvyurgthlqbtrybht8439ywb8retynvgrweyfvbweulrytq84rqwn8tyqe8wghrtebywerntwernertmnwertyerybwrtynwrtywrtywnmwrtywrthywtywernrtqwlen8tvqweuthgvnfqudgqcb789ert7v2p8934tbver78w9ytvbq89wertytbnqrietolrgrgrvbuupgbhbtvbvbrtvbtvbobtvotvbowryuwertvby7i8op8bwertvbbrbeweqefweufuewvybqwertbuipqweyfrb8qweyr8qwepyrtuewylgftvruntybqwertluvifugrbtyurgvyurgthlqbtr',
                    user: testUser1,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since object is sent for the Id', async () => {
            const { status } = await request(app)
                .post('/feedback/delete-report')
                .send({
                    _id: {
                        garbage:
                            '4u39tybnper8tyvgwenritbwperitbrhtvgirnehtbirehntbgeribt4u39tybnper8tyvgwenritbwperitbrhtvgirnehtbirehntbgeribt',
                    },
                    user: testUser1,
                });
            expect(status).toStrictEqual(400);
        });
        it('should pass since calling user is owner of the report to delete', async () => {
            const { status } = await request(app)
                .post('/feedback/delete-report')
                .send({
                    _id: testReports[0]._id,
                    user: testUser1,
                });
            expect(status).toStrictEqual(200);
        });
    });
});
