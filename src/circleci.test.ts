import { AccessKey } from "aws-sdk/clients/iam";
import fetchMock = require("fetch-mock");
import { createCircleCIHandler } from "./circleci";

const key: AccessKey = {
    AccessKeyId: 'AccessKeyId',
    SecretAccessKey: 'Secret',
    Status: 'Active',
    UserName: 'Test User',
};

afterEach(() => {
    fetchMock.restore();
});

test('successfully sent request', (done) => {

    fetchMock.post('*', Promise.resolve({}));

    createCircleCIHandler("", "", "", "")(key)
        .then(() => {
            expect(fetchMock.called()).toBeTruthy();
            done();
        })
        .catch((err) => {
            console.error(err);
            fail();
        });
});

test('received bad response', (done) => {
    fetchMock.post('*', Promise.resolve(400));

    createCircleCIHandler("", "", "", "")(key)
        .then(() => {
            fail();
            done();
        })
        .catch((err) => {
            expect(fetchMock.called()).toBeTruthy();
            done();
        });
});

test('failed to send request', (done) => {

    fetchMock.post('*', Promise.reject('Test'));

    createCircleCIHandler("", "", "", "")(key)
        .then(() => {
            fail();
            done();
        })
        .catch((err) => {
            expect(fetchMock.called()).toBeTruthy();
            done();
        });
});
