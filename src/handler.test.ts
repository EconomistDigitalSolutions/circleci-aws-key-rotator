import * as createEvent from 'aws-event-mocks';
import { APIGatewayEvent, Context, ScheduledEvent } from "aws-lambda";
import { addJob, getJobs, rotateKeys } from "./handler";

process.env.BUCKET = 'TestBucket';
jest.mock('./jobs');

test('rotates keys successfully', (done) => {
    rotateKeys(event, context, (err: string, result: any) => {
        if (err) {
            console.error(err);
            fail();
        }
        done();
    });
});

test('add job successfully', (done) => {
    apiEvent.body = JSON.stringify({
        user: 'fakeUser',

    });
    addJob(apiEvent, context, (err: string, result: any) => {
        if (err) {
            console.error(err);
            fail();
        }
        expect(result.statusCode).toBe(200);
        done();
    });
});

test('add job no request data', (done) => {
    apiEvent.body = null;
    addJob(apiEvent, context, (err: string, result: any) => {
        if (err) {
            console.error(err);
            fail();
        }
        expect(result.statusCode).toBe(400);
        done();
    });
});

test('gets jobs successfully', (done) => {
    getJobs(apiEvent, context, (err: string, result: any) => {
        if (err) {
            console.error(err);
            fail();
        }
        expect(result.statusCode).toBe(200);
        done();
    });
});

const apiEvent: APIGatewayEvent = createEvent({
    template: 'aws:apiGateway',
});

const event: ScheduledEvent = {
    account: 'test-account',
    region: 'test-region',
    detail: {},
    id: 'test-id',
    resources: [],
    source: 'test-source',
    time: 'test-time',
    "detail-type": 'test-detail-type',
};

const context: Context = {
    awsRequestId: 'test-request-id',
    callbackWaitsForEmptyEventLoop: false,
    functionName: 'test-functionName',
    functionVersion: 'test-functionVersion',
    invokedFunctionArn: 'test-invokedFunctionArn',
    logGroupName: 'test-logGroupName',
    logStreamName: 'test-logStreamName',
    memoryLimitInMB: 128,
    done: () => { return; },
    fail: (err) => { return; },
    getRemainingTimeInMillis: () => 0,
    succeed: () => { return; },
};
