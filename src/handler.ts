import { Callback, Context, ScheduledEvent } from "aws-lambda";
import { IAM } from "aws-sdk";
import { batchRotateKeys } from "./batch";
import { getJobs } from "./jobs";

export async function rotateKeys(event: ScheduledEvent, context: Context, callback: Callback) {
    const jobs = await getJobs(process.env.REGION!, process.env.TABLE!);
    console.log(`Retrieved the following jobs: ${JSON.stringify(jobs)}`);

    batchRotateKeys(new IAM(), jobs)
        .then(() => callback(null, `Successfully completed key rotation.`))
        .catch((err) => callback(err));
}
