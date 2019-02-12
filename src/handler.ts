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
        throw new Error(`Request data not provided`);
    }

    try {
        await addJobToS3(new S3(), process.env.BUCKET!, JSON.parse(event.body));
        callback(null, {
            statusCode: 200,
            body: JSON.stringify({ "message": "Added job successfully." }),
        });
    } catch (err) {
        console.error(err);
        callback(JSON.stringify({
            statusCode: 400,
            body: JSON.stringify({ "message": err }),
        }));
    }
}
