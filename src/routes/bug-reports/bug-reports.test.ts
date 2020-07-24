import { ObjectId } from 'mongodb';

// import faker from 'faker';
import Collections, { connect, close } from 'db';
import { BugReport, User } from 'lib/interfaces';
import faker from 'faker';
import request from 'supertest';
import app from 'app';

// Set the seed for random values
// faker.seed(1505);

const testUser1: User = {
    _id: new ObjectId().toHexString(),
};

const testUser2: User = {
    _id: new ObjectId().toHexString(),
};

const testReports: BugReport[] = [
    {
        _id: new ObjectId(),
        date: new Date().toISOString(),
        description: 'Avengers Assemble!!!',
        townhallId: new ObjectId().toHexString(),
        submitterId: testUser1._id,
    },
    {
        _id: new ObjectId(),
        date: new Date().toISOString(),
        description: 'Wakanda Forever!!',
        townhallId: new ObjectId().toHexString(),
        submitterId: testUser2._id,
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
        it('should fail since bug report data is not sent', async () => {
            const { status } = await request(app).post('/bugs/create-report');
            expect(status).toStrictEqual(400);
        });
        it('should fail since bug report townhall Id is empty', async () => {
            const { status } = await request(app)
                .post('/bugs/create-report')
                .send({
                    date: new Date().toISOString(),
                    description: 'I am a test',
                    townhallId: '',
                    user: testUser1,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since bug report townhall Id is missing', async () => {
            const { status } = await request(app)
                .post('/bugs/create-report')
                .send({
                    date: new Date().toISOString(),
                    description: 'I am a test',
                    user: testUser1,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since bug report date is empty', async () => {
            const { status } = await request(app)
                .post('/bugs/create-report')
                .send({
                    date: '',
                    description: 'I am a test',
                    townhallId: new ObjectId(),
                    user: testUser1,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since bug report date is missing', async () => {
            const { status } = await request(app)
                .post('/bugs/create-report')
                .send({
                    description: 'I am a test',
                    townhallId: new ObjectId(),
                    user: testUser1,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since bug report description is empty', async () => {
            const { status } = await request(app)
                .post('/bugs/create-report')
                .send({
                    date: new Date().toISOString(),
                    description: '',
                    townhallId: new ObjectId(),
                    user: testUser1,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since bug report description is missing', async () => {
            const { status } = await request(app)
                .post('/bugs/create-report')
                .send({
                    date: new Date().toISOString(),
                    townhallId: new ObjectId(),
                    user: testUser1,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since request is missing user', async () => {
            const { status } = await request(app)
                .post('/bugs/create-report')
                .send({
                    date: new Date().toISOString(),
                    description: 'I am a test',
                    townhallId: new ObjectId(),
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since user object is empty', async () => {
            const { status } = await request(app)
                .post('/bugs/create-report')
                .send({
                    date: new Date().toISOString(),
                    description: 'I am a test',
                    townhallId: new ObjectId(),
                    user: {},
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since user object does not have id', async () => {
            const { status } = await request(app)
                .post('/bugs/create-report')
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
            const { status } = await request(app)
                .post('/bugs/create-report')
                .send({
                    date: new Date().toISOString(),
                    description: 'I am buggy',
                    townhallId: new ObjectId(),
                    user: testUser1,
                });
            expect(status).toStrictEqual(200);
        });
        it('should fail random string values in bug report fields', async () => {
            const { status } = await request(app)
                .post('/bugs/create-report')
                .send({
                    date: faker.lorem.paragraphs(),
                    description: faker.lorem.paragraphs(),
                    townhallId: faker.lorem.paragraphs(),
                    user: testUser1,
                });
            expect(status).toStrictEqual(200);
        });
        it('Should fail since big positive integer values break the insertion of document in db', async () => {
            const { status } = await request(app)
                .post('/bugs/create-report')
                .send({
                    date: 241436545812618945612485614584554351234563456345636324566524552525245458246596534912345123745123741523475473541237412534651026512735672562137128456125641456891724587245451255524143654581261894561248561458456524524545824659376879325652523542462465349123451237451237415234754735412374125346510265127356725621371284561256414568917245872454512555125125,
                    description: 2414365458126189456124856145845652452454582465937687932565252354246246534912345123745123741523475473541237412534651026512735672562137128456125641456891724587245451255524143654581261894561248561458456524524545824659376879325652523542462465349123451237451237415234754735412374125346510265127356725621371284561256414568917245872454512555125125,
                    user: testUser1,
                });
            expect(status).toStrictEqual(400);
        });
        it('Should fail since big negative integer values break the insertion of document in db', async () => {
            const { status } = await request(app)
                .post('/bugs/create-report')
                .send({
                    date: -241436545812618945612485614584554351234563456345636324566524552525245458246596534912345123745123741523475473541237412534651026512735672562137128456125641456891724587245451241436545812618945612485614584565245245458246593768793256525235424624653491234512374512374152347547354123741253465102651273567256213712845612564145689172458724545125551252555125,
                    description: -2414365458126189456124856145845652452454582465937687932565252354246246534912345123745123741523475473541237412534651026512735672562137128456125641456891724587245451255512524143654581261894561248561458456524524545824659376879325652523542462465349123451237451237415234754735412374125346510265127356725621371284561256414568917245872454512555125,
                    user: testUser1,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since undefined values are sent', async () => {
            const { status } = await request(app)
                .post('/bugs/create-report')
                .send({
                    date: undefined,
                    description: undefined,
                    townhallId: undefined,
                    user: undefined,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since null values are sent', async () => {
            const { status } = await request(app)
                .post('/bugs/create-report')
                .send({
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
        it('should pass although no page is provided', async () => {
            const { status } = await request(app).get('/bugs/get-reports');
            expect(status).toStrictEqual(200);
        });
        it('should pass since zero page number zero returns first page', async () => {
            const { status } = await request(app).get(
                '/bugs/get-reports?page=0'
            );
            expect(status).toStrictEqual(200);
        });
        it('should pass since page is provided', async () => {
            const { status } = await request(app).get(
                '/bugs/get-reports?page=1'
            );
            expect(status).toStrictEqual(200);
        });
        it('should pass since page number greater than current number of pages returns 0 bugs reports', async () => {
            const { status } = await request(app).get(
                '/bugs/get-reports?page=2'
            );
            expect(status).toStrictEqual(200);
        });
        it('should pass since negative page number gets returns first page', async () => {
            const { status } = await request(app).get(
                '/bugs/get-reports?page=-1'
            );
            expect(status).toStrictEqual(200);
        });
        it('should pass since negative page number gets converted to page zero', async () => {
            const { status } = await request(app).get(
                '/bugs/get-reports?page=-135423652764745672745741235'
            );
            expect(status).toStrictEqual(200);
        });
        it('should fail since big positive page number is passed', async () => {
            const { status } = await request(app).get(
                '/bugs/get-reports?page=135423652764745672745741235'
            );
            expect(status).toStrictEqual(400);
        });
        it('should pass since big negative page number gets converted to page zero', async () => {
            const { status } = await request(app).get(
                '/bugs/get-reports?page=-413542613456735673517573456735671357576357356735262356235634623463461234623462346234562346234623463463426233463456356356356356356623632462346'
            );
            expect(status).toStrictEqual(200);
        });
        it('should fail since even bigger positive page number is passed', async () => {
            const { status } = await request(app).get(
                '/bugs/get-reports?page=413542613456735673517573456735671357576357356735262356235634623463461234623462346234562346234623463463426233463456356356356356356623632462346'
            );
            expect(status).toStrictEqual(400);
        });
        it('should pass since string for page number gets converted to page zero', async () => {
            const { status } = await request(app).get(
                '/bugs/get-reports?page=@'
            );
            expect(status).toStrictEqual(200);
        });
        it('should pass since random long string for page number gets converted to page zero', async () => {
            const { status } = await request(app).get(
                '/bugs/get-reports?page=vrtwerby456r5weyberwthy356456yertbgy53yb456yhnby'
            );
            expect(status).toStrictEqual(200);
        });
        it('should pass since longer string for page number gets converted to page zero', async () => {
            const { status } = await request(app).get(
                `/bugs/get-reports?page=${faker.lorem.paragraphs()}`
            );
            expect(status).toStrictEqual(200);
        });
        it('should pass since empty page number gets converted to page zero', async () => {
            const { status } = await request(app).get(
                '/bugs/get-reports?page='
            );
            expect(status).toStrictEqual(200);
        });
    });
    describe('/get-reports/:submitterId', () => {
        it('should fail since user object is not sent', async () => {
            const { status } = await request(app).get(
                `/bugs/get-reports/${testUser1._id}`
            );
            expect(status).toStrictEqual(400);
        });
        it('should fail since empty user object is sent', async () => {
            const { status } = await request(app)
                .get(`/bugs/get-reports/${testUser1._id}`)
                .send({
                    user: {},
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since user object is undefined', async () => {
            const { status } = await request(app)
                .get(`/bugs/get-reports/${testUser1._id}`)
                .send({
                    user: undefined,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since user object is null', async () => {
            const { status } = await request(app)
                .get(`/bugs/get-reports/${testUser1._id}`)
                .send({
                    user: null,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since calling user id and submitter id do not match', async () => {
            const { status } = await request(app)
                .get(`/bugs/get-reports/${testUser1._id}`)
                .send({
                    user: testUser2,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since random long string is sent for submitterId', async () => {
            const { status } = await request(app)
                .get(`/bugs/get-reports/${faker.lorem.paragraphs()}`)
                .send({
                    user: testUser2,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since random long string and integer values are sent for submitterId and user', async () => {
            const { status } = await request(app)
                .get(`/bugs/get-reports/${faker.lorem.paragraphs()}`)
                .send({
                    user: 128456231875162345812465012785621347859623582461512379081246571235627561237126347126378265021783412845623187516234581246501278562134785962358246151237908124657123562756123712634712637826502178345621457126358912345612485265062451234512561245681236458234756123850121256128356283056213580213612128456231875162345812465012785621347859623582461512379081246571235627561237126347126378265021783456214571263589123456124852650624512345125612456812364582347561238501212561283562830562135802136121284562318751623458124650127856213478596235824615123790812465712356275612371263471263782650217834562145712635891234561248526506245123451256124568123645823475612385012125612835628305621358021361256214571263589123456124852650624512345125612456812364582347561212845623187516234581246501278562134785962358246151237908124657123562756123712634712637826502178345621457126358912345612485265062451234512561245681236458234756123850121256128356283056213580213612850121256128356283056213580213612,
                });
            expect(status).toStrictEqual(400);
        });
        it('should pass since random submitter ids match but do not belong to any bugs report', async () => {
            const { status } = await request(app)
                .get(
                    '/bugs/get-reports/128456231875162345812465012785621347859623582461512379081246571235627561237126347126378265021783412845623187516234581246501278562134785962358246151237908124657123562756123712634712637826502178345621457126358912345612485265062451234512561245681236458234756123850121256128356283056213580213612128456231875162345812465012785621347859623582461512379081246571235627561237126347126378265021783456214571263589123456124852650624512345125612456812364582347561238501212561283562830562135802136121284562318751623458124650127856213478596235824615123790812465712356275612371263471263782650217834562145712635891234561248526506245123451256124568123645823475612385012125612835628305621358021361256214571263589123456124852650624512345125612456812364582347561212845623187516234581246501278562134785962358246151237908124657123512845623187516234581246501278562134785962358246151237908124657123562756123712634712637826502178341284562318751623458124650127856213478596235824615123790812465712356275612371263471263782650217834562145712635891234561248526506245123451256124568123645823475612385012125612835628305621358021361212845623187516234581246501278562134785962358246151237908124657123562756123712634712637826502178345621457126358912345612485265062451234512561245681236458234756123850121256128356283056213580213612128456231875162345812465012785621347859623582461512379081246571235627561237126347126378265021783456214571263589123456124852650624512345125612456812364582347561238501212561283562830562135802136125621457126358912345612485265062451234512561245681236458234756121284562318751623458124650127856213478596235824615123790812465712356275612371263471263782650217834562145712635891234561248526506245123451256124568123645823475612385012125612835628305621358021361285012125612835628305621358021361262756123712634712637826502178345621457126358912345612485265062451234512561245681236458234756123850121256128356283056213580213612850121256128356283056213580213612'
                )
                .send({
                    user: {
                        _id:
                            '128456231875162345812465012785621347859623582461512379081246571235627561237126347126378265021783412845623187516234581246501278562134785962358246151237908124657123562756123712634712637826502178345621457126358912345612485265062451234512561245681236458234756123850121256128356283056213580213612128456231875162345812465012785621347859623582461512379081246571235627561237126347126378265021783456214571263589123456124852650624512345125612456812364582347561238501212561283562830562135802136121284562318751623458124650127856213478596235824615123790812465712356275612371263471263782650217834562145712635891234561248526506245123451256124568123645823475612385012125612835628305621358021361256214571263589123456124852650624512345125612456812364582347561212845623187516234581246501278562134785962358246151237908124657123512845623187516234581246501278562134785962358246151237908124657123562756123712634712637826502178341284562318751623458124650127856213478596235824615123790812465712356275612371263471263782650217834562145712635891234561248526506245123451256124568123645823475612385012125612835628305621358021361212845623187516234581246501278562134785962358246151237908124657123562756123712634712637826502178345621457126358912345612485265062451234512561245681236458234756123850121256128356283056213580213612128456231875162345812465012785621347859623582461512379081246571235627561237126347126378265021783456214571263589123456124852650624512345125612456812364582347561238501212561283562830562135802136125621457126358912345612485265062451234512561245681236458234756121284562318751623458124650127856213478596235824615123790812465712356275612371263471263782650217834562145712635891234561248526506245123451256124568123645823475612385012125612835628305621358021361285012125612835628305621358021361262756123712634712637826502178345621457126358912345612485265062451234512561245681236458234756123850121256128356283056213580213612850121256128356283056213580213612',
                    },
                });
            expect(status).toStrictEqual(200);
        });
        it('should fail since random submitter ids are not the same type', async () => {
            const { status } = await request(app)
                .get(
                    '/bugs/get-reports/128456231875162345812465012785621347859623582461512379081246571235627561237126347126378265021783412845623187516234581246501278562134785962358246151237908124657123562756123712634712637826502178345621457126358912345612485265062451234512561245681236458234756123850121256128356283056213580213612128456231875162345812465012785621347859623582461512379081246571235627561237126347126378265021783456214571263589123456124852650624512345125612456812364582347561238501212561283562830562135802136121284562318751623458124650127856213478596235824615123790812465712356275612371263471263782650217834562145712635891234561248526506245123451256124568123645823475612385012125612835628305621358021361256214571263589123456124852650624512345125612456812364582347561212845623187516234581246501278562134785962358246151237908124657123512845623187516234581246501278562134785962358246151237908124657123562756123712634712637826502178341284562318751623458124650127856213478596235824615123790812465712356275612371263471263782650217834562145712635891234561248526506245123451256124568123645823475612385012125612835628305621358021361212845623187516234581246501278562134785962358246151237908124657123562756123712634712637826502178345621457126358912345612485265062451234512561245681236458234756123850121256128356283056213580213612128456231875162345812465012785621347859623582461512379081246571235627561237126347126378265021783456214571263589123456124852650624512345125612456812364582347561238501212561283562830562135802136125621457126358912345612485265062451234512561245681236458234756121284562318751623458124650127856213478596235824615123790812465712356275612371263471263782650217834562145712635891234561248526506245123451256124568123645823475612385012125612835628305621358021361285012125612835628305621358021361262756123712634712637826502178345621457126358912345612485265062451234512561245681236458234756123850121256128356283056213580213612850121256128356283056213580213612'
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
                .get(`/bugs/get-reports/${testUser1._id}`)
                .send({
                    user: testUser1,
                });
            expect(status).toStrictEqual(200);
        });
    });
    describe('/update-report', () => {
        it('should fail since request data is not sent', async () => {
            const { status } = await request(app).post('/bugs/update-report');
            expect(status).toStrictEqual(400);
        });
        it('should fail since Id is not sent', async () => {
            const { status } = await request(app)
                .post('/bugs/update-report')
                .send({
                    newDescription: 'I am a new description',
                    user: testUser1,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since empty Id is sent ', async () => {
            const { status } = await request(app)
                .post('/bugs/update-report')
                .send({
                    _id: '',
                    newDescription: 'I am a new description',
                    user: testUser1,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since undefined Id is sent ', async () => {
            const { status } = await request(app)
                .post('/bugs/update-report')
                .send({
                    _id: undefined,
                    newDescription: 'I am a new description',
                    user: testUser1,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since null Id is sent ', async () => {
            const { status } = await request(app)
                .post('/bugs/update-report')
                .send({
                    _id: null,
                    newDescription: 'I am a new description',
                    user: testUser1,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since long random Id does not match any document in db', async () => {
            const { status } = await request(app)
                .post('/bugs/update-report')
                .send({
                    _id: faker.lorem.paragraphs(),
                    newDescription: 'I am a new description',
                    user: testUser1,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since new description is not sent', async () => {
            const { status } = await request(app)
                .post('/bugs/update-report')
                .send({
                    _id: testReports[0]._id,
                    user: testUser1,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since empty new description is sent', async () => {
            const { status } = await request(app)
                .post('/bugs/update-report')
                .send({
                    _id: testReports[0]._id,
                    newDescription: '',
                    user: testUser1,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since undefined new description is sent', async () => {
            const { status } = await request(app)
                .post('/bugs/update-report')
                .send({
                    _id: testReports[0]._id,
                    newDescription: undefined,
                    user: testUser1,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since null new description is sent', async () => {
            const { status } = await request(app)
                .post('/bugs/update-report')
                .send({
                    _id: testReports[0]._id,
                    newDescription: null,
                    user: testUser1,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since user object is not sent', async () => {
            const { status } = await request(app)
                .post('/bugs/update-report')
                .send({
                    _id: testReports[0]._id,
                    newDescription: 'I am a new description',
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since empty user object is sent', async () => {
            const { status } = await request(app)
                .post('/bugs/update-report')
                .send({
                    _id: testReports[0]._id,
                    newDescription: 'I am a new description',
                    user: {},
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since undefined user object is sent', async () => {
            const { status } = await request(app)
                .post('/bugs/update-report')
                .send({
                    _id: testReports[0]._id,
                    newDescription: 'I am a new description',
                    user: undefined,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since null user object is sent', async () => {
            const { status } = await request(app)
                .post('/bugs/update-report')
                .send({
                    _id: testReports[0]._id,
                    newDescription: 'I am a new description',
                    user: null,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since calling user is not owner of the report to update', async () => {
            const { status } = await request(app)
                .post('/bugs/update-report')
                .send({
                    _id: testReports[0]._id,
                    newDescription: 'I am a new description',
                    user: testUser2,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since calling user object does not contain an id property', async () => {
            const { status } = await request(app)
                .post('/bugs/update-report')
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
            const { status } = await request(app)
                .post('/bugs/update-report')
                .send({
                    _id: testReports[0]._id,
                    newDescription: 'I am a new description',
                    user: 146514856912450128512635128365123084561380562128512635128365123084561380562128512635128361285126351283651230845613805625123084561380562128512635128365123084561380562128512635128365123084561380562128512635128365123084561380562128512635128365123084561380562128512635128365123084561380562128512635128365123084561380562,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since Id sent does not belong to any bug report in the database', async () => {
            const { status } = await request(app)
                .post('/bugs/update-report')
                .send({
                    _id: new ObjectId(),
                    newDescription: 'I am a new description',
                    user: testUser2,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since undefined is sent for all fields', async () => {
            const { status } = await request(app)
                .post('/bugs/update-report')
                .send({
                    _id: undefined,
                    newDescription: undefined,
                    user: undefined,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since null is sent for all fields', async () => {
            const { status } = await request(app)
                .post('/bugs/update-report')
                .send({
                    _id: null,
                    newDescription: null,
                    user: null,
                });
            expect(status).toStrictEqual(400);
        });

        it('should pass since calling user is owner of the report to update', async () => {
            const { status } = await request(app)
                .post('/bugs/update-report')
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
            const { status } = await request(app).post('/bugs/delete-report');
            expect(status).toStrictEqual(400);
        });
        it('should fail since Id is not sent', async () => {
            const { status } = await request(app)
                .post('/bugs/delete-report')
                .send({
                    user: testUser1,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since empty Id is sent ', async () => {
            const { status } = await request(app)
                .post('/bugs/delete-report')
                .send({
                    _id: '',
                    user: testUser1,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since undefined Id is sent ', async () => {
            const { status } = await request(app)
                .post('/bugs/delete-report')
                .send({
                    _id: undefined,
                    user: testUser1,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since null Id is sent ', async () => {
            const { status } = await request(app)
                .post('/bugs/delete-report')
                .send({
                    _id: null,
                    user: testUser1,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since user object is not sent', async () => {
            const { status } = await request(app)
                .post('/bugs/delete-report')
                .send({
                    _id: testReports[0]._id,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since empty user object is sent', async () => {
            const { status } = await request(app)
                .post('/bugs/delete-report')
                .send({
                    _id: testReports[0]._id,
                    user: {},
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since undefined user object is sent', async () => {
            const { status } = await request(app)
                .post('/bugs/delete-report')
                .send({
                    _id: testReports[0]._id,
                    user: undefined,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since null user object is sent', async () => {
            const { status } = await request(app)
                .post('/bugs/delete-report')
                .send({
                    _id: testReports[0]._id,
                    user: null,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since user object does not have id', async () => {
            const { status } = await request(app)
                .post('/bugs/delete-report')
                .send({
                    _id: testReports[0]._id,
                    user: {
                        junk: 'n57gb245',
                    },
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since calling user is not owner of the report to update', async () => {
            const { status } = await request(app)
                .post('/bugs/delete-report')
                .send({
                    _id: testReports[0]._id,
                    user: testUser2,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since Id sent does not belong to any bug report in the database', async () => {
            const { status } = await request(app)
                .post('/bugs/delete-report')
                .send({
                    _id: new ObjectId(),
                    user: testUser1,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since large random integer value is sent for the Id', async () => {
            const { status } = await request(app)
                .post('/bugs/delete-report')
                .send({
                    _id: 5218345612489051234851235812365712385962385218345612489051234851235812365712385962385167328957123452168341285612341254351673289571234521683412856123412543521834561248905123485123581236571238596238516732895712345216834128561234125435218345612489051234851235812365712385962385167328957123452168341285612341254352183456124890512348512358123657123859623851673289571234521683412856123412543,
                    user: testUser1,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since long string value is sent for the Id', async () => {
            const { status } = await request(app)
                .post('/bugs/delete-report')
                .send({
                    _id: faker.lorem.paragraphs(),
                    user: testUser1,
                });
            expect(status).toStrictEqual(400);
        });
        it('should fail since object is sent for the Id', async () => {
            const { status } = await request(app)
                .post('/bugs/delete-report')
                .send({
                    _id: {
                        garbage: faker.lorem.sentence(),
                    },
                    user: testUser1,
                });
            expect(status).toStrictEqual(400);
        });
        it('should pass since calling user is owner of the report to delete', async () => {
            const { status } = await request(app)
                .post('/bugs/delete-report')
                .send({
                    _id: testReports[0]._id,
                    user: testUser1,
                });
            expect(status).toStrictEqual(200);
        });
    });
});
