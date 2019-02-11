import { S3 } from "aws-sdk";
import { RotationJob } from "../jobs";

const Jobs: any = jest.genMockFromModule('../jobs');

async function getJobsFromS3(s3: S3, bucket: string) {
    const jobs: RotationJob[] = [];
    return jobs;
}

Jobs.getJobsFromS3 = getJobsFromS3;

module.exports = Jobs;
