import { KeyRotator } from "@economist/aws-key-rotator";
import { Context, ScheduledEvent } from "aws-lambda";
import { rotateKeys } from "./handler";
import { RotationJob } from "./jobs";

jest.mock('@economist/aws-key-rotator');

test('successful rotation', (done) => {
    // BatchRotator.prototype.rotateKeys = jest.fn(() => Promise.resolve());

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
    // BatchRotator.prototype.rotateKeys = jest.fn(() => Promise.reject('Test error'));
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

const job: RotationJob = {
    user: 'TestUser',
    vcsProvider: 'github',
    vcsUser: 'EconomistDigitalSolutions',
    project: 'TestProject',
    apiToken: 'TestToken',
};
