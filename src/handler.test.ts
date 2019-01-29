import { KeyRotator } from "@economist/aws-key-rotator";
import { Context, ScheduledEvent } from "aws-lambda";
import { rotateKeys } from "./handler";
import { BATCH } from "./mode";

jest.mock('@economist/aws-key-rotator');

beforeEach(() => {
    process.env.IAM_USER = 'TestUser';
});

test('successful rotation', (done) => {
    KeyRotator.prototype.rotateKeys = jest.fn((user) => Promise.resolve());

    rotateKeys(event, context, (err: string, result: any) => {
        if (err) {
            console.log(err);
            fail();
        }

        console.log(result);
        done();
    });
});

test('failed rotation', (done) => {
    KeyRotator.prototype.rotateKeys = jest.fn((user) => Promise.reject('Test error'));
    rotateKeys(event, context, (err: string, result: any) => {
        if (!err) {
            fail();
        }
        console.log(err);
        done();
    });
});

test('no user provided', (done) => {

    process.env.IAM_USER = '';
    rotateKeys(event, context, (err: string, result: any) => {
        if (!err) {
            fail();
        }
        console.log(err);
        done();
    });
});

test('successful batch rotation', (done) => {
    process.env.MODE = BATCH;
    KeyRotator.prototype.rotateKeys = jest.fn((user) => Promise.resolve());

    rotateKeys(event, context, (err: string, result: any) => {
        if (err) {
            console.log(err);
            fail();
        }

        console.log(result);
        done();
    });
});

test('failed batch rotation', (done) => {
    process.env.MODE = BATCH;
    KeyRotator.prototype.rotateKeys = jest.fn((user) => Promise.reject('Test error'));

    rotateKeys(event, context, (err: string, result: any) => {
        if (!err) {
            fail();
        }
        console.log(err);
        done();
    });
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
