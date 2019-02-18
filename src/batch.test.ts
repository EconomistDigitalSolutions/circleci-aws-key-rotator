import { KeyRotator } from "@economist/aws-key-rotator";
import { IAM } from "aws-sdk";
import { batchRotateKeys } from "./batch";
import { RotationJob } from "./jobs";

jest.mock('@economist/aws-key-rotator');

const iam = new IAM();

test('all keys rotated successfully', (done) => {
    KeyRotator.prototype.rotateKeys = jest.fn((user) => Promise.resolve());
    batchRotateKeys(iam, jobs)
        .then(() => done())
        .catch((err) => fail());
});

test('some keys rotated successfully', (done) => {
    KeyRotator.prototype.rotateKeys = jest.fn((user) => {
        if (user === 'TestUser1') {
            return Promise.resolve();
        }
        return Promise.reject('Failed');
    });
    batchRotateKeys(iam, jobs)
        .then(() => fail())
        .catch((err) => done());
});

test('no keys rotated successfully', (done) => {
    KeyRotator.prototype.rotateKeys = jest.fn((user) => Promise.reject('Failed'));
    batchRotateKeys(iam, jobs)
        .then(() => fail())
        .catch((err) => done());
});

test('no jobs provided', (done) => {
    KeyRotator.prototype.rotateKeys = jest.fn((user) => Promise.resolve());
    batchRotateKeys(iam, [])
        .then(() => done())
        .catch((err) => fail());
});

const jobs: RotationJob[] = [
    {
        user: 'TestUser1',
        vcsProvider: 'github',
        vcsUser: 'EconomistDigitalSolutions',
        project: 'TestProject',
        apiToken: 'TestToken',
    },
    {
        user: 'TestUser2',
        vcsProvider: 'github',
        vcsUser: 'EconomistDigitalSolutions',
        project: 'TestProject',
        apiToken: 'TestToken',
    },
];
