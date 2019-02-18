import * as createEvent from 'aws-event-mocks';
import { APIGatewayEvent, Context, ScheduledEvent } from "aws-lambda";
import { addJob, getJobs, rotateKeys } from "./handler";

process.env.BUCKET = 'TestBucket';
jest.mock('./jobs');
jest.mock('./batch');

describe('rotateKeys', () => {
    test('rotates keys unsuccessfully', (done) => {
        rotateKeys(event, context, (err: string, result: any) => {
            if (!err) {
                fail();
            }
            console.error(err);
            done();
        });
    });
});

describe('addJob', () => {
    test('add job unsuccessfully', (done) => {
        addJob(apiEvent, context, (err: string, result: any) => {
            if (err) {
                console.error(err);
                fail();
            }
            expect(result.statusCode).toBe(400);
            done();
        });
    });
});

describe('getJobs', () => {
    test('gets jobs unsuccessfully', (done) => {
        getJobs(apiEvent, context, (err: string, result: any) => {
            if (err) {
                console.error(err);
                fail();
            }
            expect(result.statusCode).toBe(400);
            done();
        });
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
