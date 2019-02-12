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

export async function putJob(event: APIGatewayEvent, context: Context, callback: Callback) {
    if (!event.body) {
        throw new Error(`No body on request.`);
    }

    try {
        await addJobToS3(new S3(), process.env.BUCKET!, event.body);
    } catch (err) {
        console.error(err);
        callback(err);
    }
}
