import { Callback, Context, ScheduledEvent } from "aws-lambda";
import { IAM, S3 } from "aws-sdk";
import { batchRotateKeys } from "./batch";
import { getJobsFromS3 } from "./jobs";

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
