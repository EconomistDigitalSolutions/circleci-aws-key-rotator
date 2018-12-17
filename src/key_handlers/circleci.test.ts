import { AccessKey } from "aws-sdk/clients/iam";
import fetchMock = require("fetch-mock");
import { ACTIVE } from "../keyStatus";
import { sendKeyToCircleCI } from "./circleci";

const key: AccessKey = {
    AccessKeyId: 'AccessKeyId',
    SecretAccessKey: 'Secret',
    Status: ACTIVE,
    UserName: 'Test User',
};

afterEach(() => {
    fetchMock.restore();
});

test('successfully sent request', (done) => {

    fetchMock.post('*', Promise.resolve({}));

    sendKeyToCircleCI(key)
        .then(() => {
            expect(fetchMock.called()).toBeTruthy();
            done();
        })
        .catch((err) => {
            console.error(err);
            fail();
        });
});

test('failed to send request', (done) => {

    fetchMock.post('*', Promise.reject('Test'));

    sendKeyToCircleCI(key)
        .then(() => {
            fail();
            done();
        })
        .catch((err) => {
            expect(fetchMock.called()).toBeTruthy();
            done();
        });
});
