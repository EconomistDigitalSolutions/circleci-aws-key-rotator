import { Context, ScheduledEvent } from "aws-lambda";
import { rotateKeys } from "./handler";

process.env.BUCKET = 'TestBucket';
jest.mock('./jobs');
jest.mock('./batch');

test('rotates keys unsuccessfully', (done) => {
    rotateKeys(event, context, (err: string, result: any) => {
        if (!err) {
            fail();
        }
        console.error(err);
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
