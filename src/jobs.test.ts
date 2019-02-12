import { S3 } from "aws-sdk";
import * as sinon from "sinon";
import { getJobsFromS3, RotationJob, addJobToS3 } from "./jobs";

const s3: S3 = new S3();
const listStub = sinon.stub(s3, 'listObjectsV2');
const getStub = sinon.stub(s3, 'getObject');
const putStub = sinon.stub(s3, 'putObject');
const bucket = 'test-bucket';

describe('get jobs from S3', () => {
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
});

describe('add job to S3', () => {
    test('successfully add job', async (done) => {
        let key = new Date().toISOString();
        key = `${key.substring(0, key.indexOf('T'))}-${job.user}.json`;
        putStub.withArgs({
            Bucket: bucket,
            Body: JSON.stringify(job),
            Key: key,
        }).returns({
            promise: () => Promise.resolve(),
        });

        await addJobToS3(s3, bucket, job)
            .then((data) => {
                done();
            })
            .catch((err) => {
                console.error(err);
                fail();
            });
    });

    test('failed to add job', async (done) => {
        let key = new Date().toISOString();
        key = `${key.substring(0, key.indexOf('T'))}-${job.user}.json`;
        putStub.withArgs({
            Bucket: bucket,
            Body: JSON.stringify(job),
            Key: key,
        }).returns({
            promise: () => Promise.reject('test error'),
        });

        await addJobToS3(s3, bucket, job)
            .then((data) => {
                fail();
            })
            .catch((err) => {
                console.error(err);
                done();
            });
    });

    test('fails adding non-job', async (done) => {

        await addJobToS3(s3, bucket, {})
            .then((data) => {
                fail();
            })
            .catch((err) => {
                console.error(err);
                done();
            });
    });
});

const job: RotationJob = {
    user: 'TestUser',
    vcsProvider: 'github',
    vcsUser: 'EconomistDigitalSolutions',
    project: 'TestProject',
    apiToken: 'TestToken',
};
