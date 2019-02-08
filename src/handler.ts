import { Callback, Context, ScheduledEvent } from "aws-lambda";
import { IAM } from "aws-sdk";
import { batchRotateKeys } from "./batch";
import { getJobsFromS3 } from "./jobs";

export async function rotateKeys(event: ScheduledEvent, context: Context, callback: Callback) {
    try {
        const jobs = await getJobsFromS3(process.env.BUCKET!);
        await batchRotateKeys(new IAM(), jobs)
            .then(() => callback(null, `Successfully completed key rotation.`));
    } catch (err) {
        console.log(err);
        callback(err);
    }
}
