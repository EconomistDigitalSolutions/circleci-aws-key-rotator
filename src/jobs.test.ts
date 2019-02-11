import { S3 } from "aws-sdk";
import * as sinon from "sinon";
import { getJobsFromS3, RotationJob } from "./jobs";

const s3: S3 = new S3();
const listStub = sinon.stub(s3, 'listObjectsV2');
const getStub = sinon.stub(s3, 'getObject');
const bucket = 'test-bucket';

test('no jobs in bucket', async (done) => {

    listStub.withArgs({
        Bucket: bucket, // Ignore this, think it's a bug in the declaration file
    }).returns({
        promise: () => Promise.resolve({}),
    });

    const jobs = await getJobsFromS3(s3, bucket);
    if (jobs.length !== 0) {
        fail();
    }
    done();
});

test('job in bucket', async (done) => {
    listStub.withArgs({
        Bucket: bucket, // Ignore this, think it's a bug in the declaration file
    }).returns({
        promise: () => Promise.resolve({
            Contents: [{
                Key: 'test-key',
            }],
        }),
    });

    getStub.withArgs({
        Bucket: bucket,
        Key: 'test-key',
    }).returns({
        promise: () => Promise.resolve({
            Body: JSON.stringify(job),
        }),
    });

    const jobs = await getJobsFromS3(s3, bucket);
    if (jobs.length === 0) {
        fail();
    }
    done();
});

test('non-job in bucket', async (done) => {
    listStub.withArgs({
        Bucket: bucket, // Ignore this, think it's a bug in the declaration file
    }).returns({
        promise: () => Promise.resolve({
            Contents: [{
                Key: 'test-key',
            }],
        }),
    });

    getStub.withArgs({
        Bucket: bucket,
        Key: 'test-key',
    }).returns({
        promise: () => Promise.resolve({
            Body: JSON.stringify({ foo: "bar" }),
        }),
    });

    const jobs = await getJobsFromS3(s3, bucket);
    if (jobs.length !== 0) {
        fail();
    }
    done();
});

test('object with no key in bucket', async (done) => {
    listStub.withArgs({
        Bucket: bucket, // Ignore this, think it's a bug in the declaration file
    }).returns({
        promise: () => Promise.resolve({
            Contents: [{
            }],
        }),
    });

    getStub.withArgs({
        Bucket: bucket,
        Key: 'test-key',
    }).returns({
        promise: () => Promise.resolve({
            Body: JSON.stringify({ foo: "bar" }),
        }),
    });

    const jobs = await getJobsFromS3(s3, bucket);
    if (jobs.length !== 0) {
        fail();
    }
    done();
});

test('object with no body data in bucket', async (done) => {
    listStub.withArgs({
        Bucket: bucket, // Ignore this, think it's a bug in the declaration file
    }).returns({
        promise: () => Promise.resolve({
            Contents: [{
                Key: 'test-key',
            }],
        }),
    });

    getStub.withArgs({
        Bucket: bucket,
        Key: 'test-key',
    }).returns({
        promise: () => Promise.resolve({}),
    });

    const jobs = await getJobsFromS3(s3, bucket);
    if (jobs.length !== 0) {
        fail();
    }
    done();
});

const job: RotationJob = {
    user: 'TestUser',
    vcsProvider: 'github',
    vcsUser: 'EconomistDigitalSolutions',
    project: 'TestProject',
    apiToken: 'TestToken',
};
