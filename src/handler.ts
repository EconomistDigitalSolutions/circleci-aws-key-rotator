import { APIGatewayEvent, Callback, Context, ScheduledEvent } from "aws-lambda";
import { IAM, S3 } from "aws-sdk";
import { batchRotateKeys } from "./batch";
import { addJobToS3, getJobsFromS3 } from "./jobs";

export async function rotateKeys(event: ScheduledEvent, context: Context, callback: Callback) {
    try {
        const jobs = await getJobsFromS3(new S3(), process.env.BUCKET!);
        console.log(`Retrieved jobs: ${JSON.stringify(jobs)}`);
        await batchRotateKeys(new IAM(), jobs);
        callback(null, `Successfully completed key rotation.`);
    } catch (err) {
        console.error(err);
        callback(err);
    }
}

export async function addJob(event: APIGatewayEvent, context: Context, callback: Callback) {
    if (!event.body) {
        throw new Error(`Request data not provided`);
    }

    try {
        await addJobToS3(new S3(), process.env.BUCKET!, JSON.parse(event.body));
        callback(null, success("Added job successfully."));
    } catch (err) {
        console.error(err);
        callback(null, error(err));
    }
}

export async function getJobs(event: APIGatewayEvent, context: Context, callback: Callback) {
    try {
        const jobs = (await getJobsFromS3(new S3(), process.env.BUCKET!))
            .map((job) => ({
                user: job.user,
                project: job.project,
            }));
        callback(null, success(jobs));
    } catch (err) {
        console.error(err);
        callback(null, error(err));
    }
}

function success(data: any) {
    return response(200, data);
}

function error(err: any) {
    return response(400, err.toString());
}

function response(code: number, data: any) {
    return {
        statusCode: code,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    };
}
