import { ObjectId } from 'mongodb';

import Collections, { connect, close } from 'db';
import faker from 'faker';
import request from 'supertest';
import app from 'app';

const testUser1 = {
    _id: new ObjectId().toHexString(),
};

const testUser2 = {
    _id: new ObjectId().toHexString(),
};

const testReports = [
    {
        _id: new ObjectId(),
        date: new Date().toISOString(),
        description: 'Avengers Assemble!!!',
        townhallId: new ObjectId().toHexString(),
        submitterId: testUser1._id,
        replies: [],
    },
    {
        _id: new ObjectId(),
        date: new Date().toISOString(),
        description: 'Wakanda Forever!!',
        townhallId: new ObjectId().toHexString(),
        submitterId: testUser2._id,
        replies: [],
    },
];

// Connects to database, initializes collections, and seed database before the tests run
beforeAll(async () => {
    await connect();
    await Collections.BugReport().insertMany(testReports);
});

// Deletes all the bug reports that were seeded in the beforeAll hook
afterAll(async () => {
    await Collections.BugReport().deleteMany({
        submitterId: testUser1._id,
    });
    await Collections.BugReport().deleteOne({ _id: testReports[0]._id });
    await Collections.BugReport().deleteOne({ _id: testReports[1]._id });
    await close();
});

describe('bug-reports', () => {
    describe('/create-report', () => {
        const endpoint = '/api/bugs/create-report';
        it('should fail since bug report data is not sent', async () => {
            const { status } = await request(app).post(endpoint);
            expect(status).toStrictEqual(400);
        });
        it('should fail since bug report townhall Id is empty', async () => {
            const { status } = await request(app).post(endpoint).send({
                date: new Date().toISOString(),
                description: 'I am a test',
                townhallId: '',
                user: testUser1,
            });
            expect(status).toStrictEqual(400);
        });
        it('should fail since bug report townhall Id is missing', async () => {
            const { status } = await request(app).post(endpoint).send({
                date: new Date().toISOString(),
                description: 'I am a test',
                user: testUser1,
            });
            expect(status).toStrictEqual(400);
        });
        it('should fail since bug report date is empty', async () => {
            const { status } = await request(app).post(endpoint).send({
                date: '',
                description: 'I am a test',
                townhallId: new ObjectId(),
                user: testUser1,
            });
            expect(status).toStrictEqual(400);
        });
        it('should fail since bug report date is missing', async () => {
            const { status } = await request(app).post(endpoint).send({
                description: 'I am a test',
                townhallId: new ObjectId(),
                user: testUser1,
            });
            expect(status).toStrictEqual(400);
        });
        it('should fail since bug report description is empty', async () => {
            const { status } = await request(app).post(endpoint).send({
                date: new Date().toISOString(),
                description: '',
                townhallId: new ObjectId(),
                user: testUser1,
            });
            expect(status).toStrictEqual(400);
        });
        it('should fail since bug report description is missing', async () => {
            const { status } = await request(app).post(endpoint).send({
                date: new Date().toISOString(),
                townhallId: new ObjectId(),
                user: testUser1,
            });
            expect(status).toStrictEqual(400);
        });
        it('should fail since request is missing user', async () => {
            const { status } = await request(app).post(endpoint).send({
                date: new Date().toISOString(),
                description: 'I am a test',
                townhallId: new ObjectId(),
            });
            expect(status).toStrictEqual(400);
        });
        it('should fail since user object is empty', async () => {
            const { status } = await request(app).post(endpoint).send({
                date: new Date().toISOString(),
                description: 'I am a test',
                townhallId: new ObjectId(),
                user: {},
            });
            expect(status).toStrictEqual(400);
        });
        it('should fail since user object does not have id', async () => {
            const { status } = await request(app)
                .post(endpoint)
                .send({
                    date: new Date().toISOString(),
                    description: 'I am a test',
                    townhallId: new ObjectId(),
                    user: {
                        junk: '2bfofc4',
                    },
                });
            expect(status).toStrictEqual(400);
        });
        it('should pass since a valid bug report is sent', async () => {
            // TODO: Check if the email was sent => Spy on the emit function on rabbitmq
            const { status } = await request(app).post(endpoint).send({
                date: new Date().toISOString(),
                description: 'I am buggy',
                townhallId: new ObjectId(),
                user: testUser1,
            });
            expect(status).toStrictEqual(200);
        });
        it('should fail random string values in bug report fields', async () => {
            const { status } = await request(app).post(endpoint).send({
                date: faker.lorem.paragraphs(),
                description: faker.lorem.paragraphs(),
                townhallId: faker.lorem.paragraphs(),
                user: testUser1,
            });
            expect(status).toStrictEqual(200);
        });
        it('Should fail since infinite positive values break the insertion of document in db', async () => {
            const { status } = await request(app).post(endpoint).send({
                date: Number.POSITIVE_INFINITY,
                description: Number.POSITIVE_INFINITY,
                user: testUser1,
            });
            expect(status).toStrictEqual(400);
        });
        it('Should fail since big negative integer values break the insertion of document in db', async () => {
            const { status } = await request(app).post(endpoint).send({
                date: Number.NEGATIVE_INFINITY,
                description: Number.NEGATIVE_INFINITY,
                user: testUser1,
            });
            expect(status).toStrictEqual(400);
        });
        it('should fail since undefined values are sent', async () => {
            const { status } = await request(app).post(endpoint).send({
                date: undefined,
                description: undefined,
                townhallId: undefined,
                user: undefined,
            });
            expect(status).toStrictEqual(400);
        });
        it('should fail since null values are sent', async () => {
            const { status } = await request(app).post(endpoint).send({
                date: null,
                description: null,
                townhallId: null,
                user: null,
            });
            expect(status).toStrictEqual(400);
        });
    });
    describe('/get-reports', () => {
        // TODO: Test by calling from Admin service. Expect a 200 status and an array of bug reports
        // TODO: Test by calling from service that is not the Admin service. Expect a 400 status
        const endpoint = '/api/bugs/get-reports';
        it('should fail since page and sortByDate are not provided', async () => {
            const { status } = await request(app).get(endpoint);
            expect(status).toStrictEqual(400);
        });
        it('should fail since sortByDate  is not provided', async () => {
            const { status } = await request(app).get(endpoint).send({
                page: 1,
            });
            expect(status).toStrictEqual(400);
        });
        it('should passing since page zero gets converted to page 1', async () => {
            const { status } = await request(app).get(endpoint).send({
                page: 0,
                sortByDate: true,
            });
            expect(status).toStrictEqual(200);
        });
        it('should pass since page number greater than current number of pages returns 0 bugs reports', async () => {
            const { status } = await request(app).get(endpoint).send({
                page: 2,
                sortByDate: true,
            });
            expect(status).toStrictEqual(200);
        });
        it('should pass since negative page number gets returns first page', async () => {
            const { status } = await request(app).get(endpoint).send({
                page: -1,
                sortByDate: true,
            });
            expect(status).toStrictEqual(200);
        });
        it('should pass since big negative page number gets converted to page zero', async () => {
            const { status } = await request(app).get(endpoint).send({
                page: -135423652764745672745741235,
                sortByDate: false,
            });
            expect(status).toStrictEqual(200);
        });
        it('should fail since big positive page number is passed', async () => {
            const { status } = await request(app).get(endpoint).send({
                page: 135423652764745672745741235,
                sortByDate: true,
            });
            expect(status).toStrictEqual(400);
        });
        it('should pass since infinite positive page number breaks mongo query', async () => {
            const { status } = await request(app).get(endpoint).send({
                page: Number.POSITIVE_INFINITY,
                sortByDate: true,
            });
            expect(status).toStrictEqual(400);
        });
        it('should fail since string for page number is invalid', async () => {
            const { status } = await request(app).get(endpoint).send({
                page: faker.random.word(),
                sortByDate: true,
            });
            expect(status).toStrictEqual(400);
        });
        it('should fail since random long string for page number is invalid', async () => {
            const { status } = await request(app)
                .get(endpoint)
                .send({
                    page: faker.random.words(40),
                    sortByDate: true,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since page number is not provided', async () => {
            const { status } = await request(app).get(endpoint).send({
                sortByDate: true,
            });
            expect(status).toStrictEqual(400);
        });
        it('should pass since required parameters are provided. Case 1', async () => {
            const { status } = await request(app).get(endpoint).send({
                page: 1,
                sortByDate: true,
            });
            expect(status).toStrictEqual(200);
        });
        it('should pass since required parameters are provided. Case 2', async () => {
            const { status } = await request(app).get(endpoint).send({
                page: 1,
                sortByDate: false,
            });
            expect(status).toStrictEqual(200);
        });
        it('should fail since random value for sortByDate parameter is provided', async () => {
            const { status } = await request(app).get(endpoint).send({
                page: 1,
                sortByDate: faker.random.word(),
            });
            expect(status).toStrictEqual(400);
        });
    });
    // TODO: Make query parameters be passed in the body
    describe('/get-reports/:submitterId', () => {
        const endpoint = '/api/bugs/get-reports';
        it('should fail since user object is not sent', async () => {
            const { status } = await request(app).get(
                `${endpoint}/${testUser1._id}`
            );
            expect(status).toStrictEqual(400);
        });
        it('should fail since empty user object is sent', async () => {
            const { status } = await request(app)
                .get(`${endpoint}/${testUser1._id}`)
                .send({
                    user: {},
                    page: 10,
                    sortByDate: true,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since user object is undefined', async () => {
            const { status } = await request(app)
                .get(`${endpoint}/${testUser1._id}`)
                .send({
                    user: undefined,
                    page: 7,
                    sortByDate: true,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since user object is null', async () => {
            const { status } = await request(app)
                .get(`${endpoint}/${testUser1._id}`)
                .send({
                    user: null,
                    page: 7,
                    sortByDate: false,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since calling user id and submitter id do not match', async () => {
            const { status } = await request(app)
                .get(`${endpoint}/${testUser1._id}`)
                .send({
                    user: testUser2,
                    page: 4,
                    sortByDate: true,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since random long string is sent for submitterId', async () => {
            const { status } = await request(app)
                .get(`${endpoint}/${faker.lorem.paragraphs()}`)
                .send({
                    user: testUser2,
                    page: 1,
                    sortByDate: true,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since random long string and integer values are sent for submitterId and user', async () => {
            const { status } = await request(app)
                .get(`${endpoint}/${faker.lorem.paragraphs()}`)
                .send({
                    user: Number.MAX_VALUE,
                    page: 6,
                    sortByDate: false,
                });
            expect(status).toStrictEqual(400);
        });
        it('should pass since random submitter ids match but do not belong to any bugs report', async () => {
            const randomId = faker.random.alphaNumeric(12);
            const { status } = await request(app)
                .get(`${endpoint}/${randomId}`)
                .send({
                    user: {
                        _id: randomId,
                    },
                    page: 1,
                    sortByDate: true,
                });
            expect(status).toStrictEqual(200);
        });
        it('should fail since random submitter ids are not the same type', async () => {
            const { status } = await request(app)
                .get(`${endpoint}/${Number.MAX_VALUE}`)
                .send({
                    user: {
                        _id: Number.MAX_VALUE,
                    },
                    page: 1,
                    sortByDate: true,
                });
            expect(status).toStrictEqual(400);
        });
        it('should pass since calling user id and submitter id  match', async () => {
            const { status } = await request(app)
                .get(`${endpoint}/${testUser1._id}`)
                .send({
                    user: testUser1,
                    page: 1,
                    sortByDate: true,
                });
            expect(status).toStrictEqual(200);
        });
        it('should fail since sortByDate query parameter is not sent', async () => {
            const { status } = await request(app)
                .get(`${endpoint}/${testUser1._id}`)
                .send({
                    user: testUser1,
                    page: 1,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since page query parameter is not sent', async () => {
            const { status } = await request(app)
                .get(`${endpoint}/${testUser1._id}`)
                .send({
                    user: testUser1,
                    sortByDate: false,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since a random non-number value is sent for page', async () => {
            const { status } = await request(app)
                .get(`${endpoint}/${testUser1._id}`)
                .send({
                    user: testUser1,
                    page: faker.lorem.paragraph(),
                    sortByDate: false,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since a random non-boolean value is sent for sortByDate', async () => {
            const { status } = await request(app)
                .get(`${endpoint}/${testUser1._id}`)
                .send({
                    user: testUser1,
                    page: 10,
                    sortByDate: faker.random.number(),
                });
            expect(status).toStrictEqual(400);
        });
    });
    describe('/update-report', () => {
        const endpoint = '/api/bugs/update-report';
        it('should fail since request data is not sent', async () => {
            const { status } = await request(app).post(endpoint);
            expect(status).toStrictEqual(400);
        });
        it('should fail since Id is not sent', async () => {
            const { status } = await request(app).post(endpoint).send({
                newDescription: 'I am a new description',
                user: testUser1,
            });
            expect(status).toStrictEqual(400);
        });
        it('should fail since empty Id is sent ', async () => {
            const { status } = await request(app).post(endpoint).send({
                _id: '',
                newDescription: 'I am a new description',
                user: testUser1,
            });
            expect(status).toStrictEqual(400);
        });
        it('should fail since undefined Id is sent ', async () => {
            const { status } = await request(app).post(endpoint).send({
                _id: undefined,
                newDescription: 'I am a new description',
                user: testUser1,
            });
            expect(status).toStrictEqual(400);
        });
        it('should fail since null Id is sent ', async () => {
            const { status } = await request(app).post(endpoint).send({
                _id: null,
                newDescription: 'I am a new description',
                user: testUser1,
            });
            expect(status).toStrictEqual(400);
        });
        it('should fail since long random Id does not match any document in db', async () => {
            const { status } = await request(app).post(endpoint).send({
                _id: faker.lorem.paragraphs(),
                newDescription: 'I am a new description',
                user: testUser1,
            });
            expect(status).toStrictEqual(400);
        });
        it('should fail since new description is not sent', async () => {
            const { status } = await request(app).post(endpoint).send({
                _id: testReports[0]._id,
                user: testUser1,
            });
            expect(status).toStrictEqual(400);
        });
        it('should fail since empty new description is sent', async () => {
            const { status } = await request(app).post(endpoint).send({
                _id: testReports[0]._id,
                newDescription: '',
                user: testUser1,
            });
            expect(status).toStrictEqual(400);
        });
        it('should fail since undefined new description is sent', async () => {
            const { status } = await request(app).post(endpoint).send({
                _id: testReports[0]._id,
                newDescription: undefined,
                user: testUser1,
            });
            expect(status).toStrictEqual(400);
        });
        it('should fail since null new description is sent', async () => {
            const { status } = await request(app).post(endpoint).send({
                _id: testReports[0]._id,
                newDescription: null,
                user: testUser1,
            });
            expect(status).toStrictEqual(400);
        });
        it('should fail since user object is not sent', async () => {
            const { status } = await request(app).post(endpoint).send({
                _id: testReports[0]._id,
                newDescription: 'I am a new description',
            });
            expect(status).toStrictEqual(400);
        });
        it('should fail since empty user object is sent', async () => {
            const { status } = await request(app).post(endpoint).send({
                _id: testReports[0]._id,
                newDescription: 'I am a new description',
                user: {},
            });
            expect(status).toStrictEqual(400);
        });
        it('should fail since undefined user object is sent', async () => {
            const { status } = await request(app).post(endpoint).send({
                _id: testReports[0]._id,
                newDescription: 'I am a new description',
                user: undefined,
            });
            expect(status).toStrictEqual(400);
        });
        it('should fail since null user object is sent', async () => {
            const { status } = await request(app).post(endpoint).send({
                _id: testReports[0]._id,
                newDescription: 'I am a new description',
                user: null,
            });
            expect(status).toStrictEqual(400);
        });
        it('should fail since calling user is not owner of the report to update', async () => {
            const { status } = await request(app).post(endpoint).send({
                _id: testReports[0]._id,
                newDescription: 'I am a new description',
                user: testUser2,
            });
            expect(status).toStrictEqual(400);
        });
        it('should fail since calling user object does not contain an id property', async () => {
            const { status } = await request(app)
                .post(endpoint)
                .send({
                    _id: testReports[0]._id,
                    newDescription: 'I am a new description',
                    user: {
                        garbage: faker.lorem.sentence(),
                    },
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since calling user is a long integer value', async () => {
            const { status } = await request(app).post(endpoint).send({
                _id: testReports[0]._id,
                newDescription: 'I am a new description',
                user: Number.MAX_VALUE,
            });
            expect(status).toStrictEqual(400);
        });
        it('should fail since Id sent does not belong to any bug report in the database', async () => {
            const { status } = await request(app).post(endpoint).send({
                _id: new ObjectId(),
                newDescription: 'I am a new description',
                user: testUser2,
            });
            expect(status).toStrictEqual(400);
        });
        it('should fail since undefined is sent for all fields', async () => {
            const { status } = await request(app).post(endpoint).send({
                _id: undefined,
                newDescription: undefined,
                user: undefined,
            });
            expect(status).toStrictEqual(400);
        });
        it('should fail since null is sent for all fields', async () => {
            const { status } = await request(app).post(endpoint).send({
                _id: null,
                newDescription: null,
                user: null,
            });
            expect(status).toStrictEqual(400);
        });

        it('should pass since calling user is owner of the report to update', async () => {
            const { status } = await request(app).post(endpoint).send({
                _id: testReports[1]._id,
                newDescription: 'I am a new description',
                user: testUser2,
            });
            expect(status).toStrictEqual(200);
        });
    });
    describe('/delete-report', () => {
        const endpoint = '/api/bugs/delete-report';
        it('should fail since request data is not sent', async () => {
            const { status } = await request(app).post(endpoint);
            expect(status).toStrictEqual(400);
        });
        it('should fail since Id is not sent', async () => {
            const { status } = await request(app).post(endpoint).send({
                user: testUser1,
            });
            expect(status).toStrictEqual(400);
        });
        it('should fail since empty Id is sent ', async () => {
            const { status } = await request(app).post(endpoint).send({
                _id: '',
                user: testUser1,
            });
            expect(status).toStrictEqual(400);
        });
        it('should fail since undefined Id is sent ', async () => {
            const { status } = await request(app).post(endpoint).send({
                _id: undefined,
                user: testUser1,
            });
            expect(status).toStrictEqual(400);
        });
        it('should fail since null Id is sent ', async () => {
            const { status } = await request(app).post(endpoint).send({
                _id: null,
                user: testUser1,
            });
            expect(status).toStrictEqual(400);
        });
        it('should fail since user object is not sent', async () => {
            const { status } = await request(app).post(endpoint).send({
                _id: testReports[0]._id,
            });
            expect(status).toStrictEqual(400);
        });
        it('should fail since empty user object is sent', async () => {
            const { status } = await request(app).post(endpoint).send({
                _id: testReports[0]._id,
                user: {},
            });
            expect(status).toStrictEqual(400);
        });
        it('should fail since undefined user object is sent', async () => {
            const { status } = await request(app).post(endpoint).send({
                _id: testReports[0]._id,
                user: undefined,
            });
            expect(status).toStrictEqual(400);
        });
        it('should fail since null user object is sent', async () => {
            const { status } = await request(app).post(endpoint).send({
                _id: testReports[0]._id,
                user: null,
            });
            expect(status).toStrictEqual(400);
        });
        it('should fail since user object does not have id', async () => {
            const { status } = await request(app)
                .post(endpoint)
                .send({
                    _id: testReports[0]._id,
                    user: {
                        junk: 'n57gb245',
                    },
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since calling user is not owner of the report to update', async () => {
            const { status } = await request(app).post(endpoint).send({
                _id: testReports[0]._id,
                user: testUser2,
            });
            expect(status).toStrictEqual(400);
        });
        it('should fail since Id sent does not belong to any bug report in the database', async () => {
            const { status } = await request(app).post(endpoint).send({
                _id: new ObjectId(),
                user: testUser1,
            });
            expect(status).toStrictEqual(400);
        });
        it('should fail since large random integer value is sent for the Id', async () => {
            const { status } = await request(app).post(endpoint).send({
                _id: Number.MAX_VALUE,
                user: testUser1,
            });
            expect(status).toStrictEqual(400);
        });
        it('should fail since long string value is sent for the Id', async () => {
            const { status } = await request(app).post(endpoint).send({
                _id: faker.lorem.paragraphs(),
                user: testUser1,
            });
            expect(status).toStrictEqual(400);
        });
        it('should fail since object is sent for the Id', async () => {
            const { status } = await request(app)
                .post(endpoint)
                .send({
                    _id: {
                        garbage: faker.lorem.sentence(),
                    },
                    user: testUser1,
                });
            expect(status).toStrictEqual(400);
        });
        it('should pass since calling user is owner of the report to delete', async () => {
            const { status } = await request(app).post(endpoint).send({
                _id: testReports[0]._id,
                user: testUser1,
            });
            expect(status).toStrictEqual(200);
        });
    });
    describe('/updateResolvedStatus', () => {
        const endpoint = '/api/bugs/updateResolvedStatus';

        it('should fail since resolved status is not sent', async () => {
            const { status } = await request(app).post(
                `${endpoint}/${testReports[0]._id.toHexString()}`
            );
            expect(status).toStrictEqual(400);
        });
        it('should fail since empty resolved status is sent', async () => {
            const { status } = await request(app)
                .post(`${endpoint}/${testReports[0]._id.toHexString()}`)
                .send({
                    resolvedStatus: '',
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since undefined resolved status is sent', async () => {
            const { status } = await request(app)
                .post(`${endpoint}/${testReports[0]._id.toHexString()}`)
                .send({
                    resolvedStatus: undefined,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since null resolved status is sent', async () => {
            const { status } = await request(app)
                .post(`${endpoint}/${testReports[0]._id.toHexString()}`)
                .send({
                    resolvedStatus: null,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since invalid resolved status is sent', async () => {
            const { status } = await request(app)
                .post(`${endpoint}/${testReports[0]._id.toHexString()}`)
                .send({
                    resolvedStatus: faker.random.word(),
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since long invalid resolved status is sent', async () => {
            const { status } = await request(app)
                .post(`${endpoint}/${testReports[0]._id.toHexString()}`)
                .send({
                    resolvedStatus: faker.lorem.paragraphs(),
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since random long positive number is sent as resolvedStatus', async () => {
            const { status } = await request(app)
                .post(`${endpoint}/${testReports[0]._id.toHexString()}`)
                .send({
                    resolvedStatus: Number.MAX_VALUE,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since random long negative number is sent as resolvedStatus', async () => {
            const { status } = await request(app)
                .post(`${endpoint}/${testReports[0]._id.toHexString()}`)
                .send({
                    resolvedStatus: Number.MIN_VALUE,
                });
            expect(status).toStrictEqual(400);
        });
        it('should pass since valid resolved status ("true") is sent', async () => {
            const { status } = await request(app)
                .post(`${endpoint}/${testReports[0]._id.toHexString()}`)
                .send({
                    resolvedStatus: true,
                });
            expect(status).toStrictEqual(200);
        });
        it('should pass since valid resolved status ("false") is sent', async () => {
            const { status } = await request(app)
                .post(`${endpoint}/${testReports[0]._id.toHexString()}`)
                .send({
                    resolvedStatus: false,
                });
            expect(status).toStrictEqual(200);
        });
    });
    describe('/replyTo', () => {
        const endpoint = `/api/bugs/replyTo/${testReports[0]._id.toHexString()}`;
        it('should fail since request body is not sent', async () => {
            const { status } = await request(app).post(endpoint);
            expect(status).toStrictEqual(400);
        });
        it('should fail since user object is missing', async () => {
            const { status } = await request(app).post(endpoint).send({
                replyContent: faker.lorem.paragraph(),
                repliedDate: new Date().toISOString(),
            });
            expect(status).toStrictEqual(400);
        });
        it('should fail since undefined user object is sent', async () => {
            const { status } = await request(app).post(endpoint).send({
                user: undefined,
                replyContent: faker.lorem.paragraph(),
                repliedDate: new Date().toISOString(),
            });
            expect(status).toStrictEqual(400);
        });
        it('should fail since null user object is sent', async () => {
            const { status } = await request(app).post(endpoint).send({
                user: null,
                replyContent: faker.lorem.paragraph(),
                repliedDate: new Date().toISOString(),
            });
            expect(status).toStrictEqual(400);
        });
        it('should fail since user object without id is sent', async () => {
            const { status } = await request(app).post(endpoint).send({
                user: {},
                replyContent: faker.lorem.paragraph(),
                repliedDate: new Date().toISOString(),
            });
            expect(status).toStrictEqual(400);
        });
        it('should fail since empty user Id is sent', async () => {
            const { status } = await request(app)
                .post(endpoint)
                .send({
                    user: {
                        _id: '',
                    },
                    replyContent: faker.lorem.paragraph(),
                    repliedDate: new Date().toISOString(),
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since undefined user Id is sent', async () => {
            const { status } = await request(app)
                .post(endpoint)
                .send({
                    user: {
                        _id: undefined,
                    },
                    replyContent: faker.lorem.paragraph(),
                    repliedDate: new Date().toISOString(),
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since null user Id is sent', async () => {
            const { status } = await request(app)
                .post(endpoint)
                .send({
                    user: {
                        _id: null,
                    },
                    replyContent: faker.lorem.paragraph(),
                    repliedDate: new Date().toISOString(),
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since reply content is missing', async () => {
            const { status } = await request(app).post(endpoint).send({
                user: testUser1,
                repliedDate: new Date().toISOString(),
            });
            expect(status).toStrictEqual(400);
        });
        it('should fail since reply content is undefined', async () => {
            const { status } = await request(app).post(endpoint).send({
                user: testUser1,
                replyContent: undefined,
                repliedDate: new Date().toISOString(),
            });
            expect(status).toStrictEqual(400);
        });
        it('should fail since reply content is null', async () => {
            const { status } = await request(app).post(endpoint).send({
                user: testUser1,
                replyContent: null,
                repliedDate: new Date().toISOString(),
            });
            expect(status).toStrictEqual(400);
        });
        it('should fail since replied date is missing', async () => {
            const { status } = await request(app).post(endpoint).send({
                user: testUser1,
                replyContent: faker.lorem.paragraphs(),
            });
            expect(status).toStrictEqual(400);
        });
        it('should fail since replied date is undefined', async () => {
            const { status } = await request(app).post(endpoint).send({
                user: testUser1,
                replyContent: faker.lorem.paragraphs(),
                repliedDate: undefined,
            });
            expect(status).toStrictEqual(400);
        });
        it('should fail since replied date is null', async () => {
            const { status } = await request(app).post(endpoint).send({
                user: testUser1,
                replyContent: faker.lorem.paragraphs(),
                repliedDate: null,
            });
            expect(status).toStrictEqual(400);
        });
        it('should pass since body of request is valid. Case 1', async () => {
            const { status } = await request(app).post(endpoint).send({
                user: testUser1,
                replyContent: faker.lorem.paragraphs(),
                repliedDate: new Date().toISOString(),
            });
            expect(status).toStrictEqual(200);
        });
        it('should pass since body of request is valid. Case2', async () => {
            const { status } = await request(app).post(endpoint).send({
                user: testUser2,
                replyContent: faker.lorem.paragraph(),
                repliedDate: new Date().toISOString(),
            });
            expect(status).toStrictEqual(200);
        });
    });
});
