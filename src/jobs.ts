import AWS = require("aws-sdk");
import { S3 } from "aws-sdk";

export interface RotationJob {
    user: string;
    vcsProvider: string;
    vcsUser: string;
    project: string;
    apiToken: string;
    accessKeyName?: string;
    secretKeyName?: string;
}

function isJob(arg: any): arg is RotationJob {
    return arg.user !== undefined &&
        arg.vcsProvider !== undefined &&
        arg.vcsUser !== undefined &&
        arg.project !== undefined &&
        arg.apiToken !== undefined;
}

export async function getJobsFromS3(s3: AWS.S3, bucket: string): Promise<RotationJob[]> {
    console.log(`Retrieving jobs from S3 Bucket: ${bucket}`);

    const listParams: AWS.S3.ListObjectsV2Request = {
        Bucket: bucket,
    };

    const objects = await s3.listObjectsV2(listParams).promise();

    if (!objects.Contents) {
        console.log(`No jobs found in S3 Bucket.`);
        return [];
    }

    const jobs: RotationJob[] = [];
    const keys = objects.Contents.map((obj) => obj.Key);

    console.log(`Retrieved the following keys from S3 Bucket ${bucket}: ${JSON.stringify(keys)}`);
    for (const key of keys) {
        if (!key) {
            continue;
        }

        const job = await getJobFromS3(s3, bucket, key);
        console.log(`Retrieved: ${JSON.stringify(job)}`);

        if (!isJob(job)) {
            console.log(`Retrieved object is not a recognised job.`);
            continue;
        }

        jobs.push(job);
    }

    console.log(`Retrieved the following jobs: ${JSON.stringify(jobs)}`);
    return jobs;

}

function getJobFromS3(s3: S3, bucket: string, key: string) {
    console.log(`Retrieving file ${key} from S3 Bucket: ${bucket}`);
    const params: AWS.S3.GetObjectRequest = {
        Bucket: bucket,
        Key: key,
    };

    return s3.getObject(params)
        .promise()
        .then((data) => {
            if (!data.Body) {
                return;
            }
            return JSON.parse(data.Body.toString());
        });
}
