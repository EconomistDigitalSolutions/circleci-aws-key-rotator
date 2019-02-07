import { KeyRotator } from "@economist/aws-key-rotator";
import { Callback, Context, ScheduledEvent } from "aws-lambda";
import { IAM } from "aws-sdk";
import { createCircleCIHandler } from "./circleci";
import { getJobs, RotationJob } from "./jobs";

export async function batchRotate(event: ScheduledEvent, context: Context, callback: Callback) {
    const jobs = await getJobs(process.env.REGION!, process.env.TABLE!);
    const iam = new IAM();
    const promises: Promise<void>[] = [];
    const failedJobs: { user: string, reason: any }[] = [];
    for (const job of jobs) {
        const keyHandler = createCircleCIHandler(job.vcsProvider, job.vcsUser, job.project, job.apiToken, job.accessKeyName, job.secretKeyName);
        const keyRotator = new KeyRotator(iam, keyHandler);

        const promise = keyRotator.rotateKeys(job.user)
            .catch((err) => {
                console.error(err);
                failedJobs.push({
                    user: job.user,
                    reason: err,
                });
            });

        promises.push(promise);
    }

    Promise.all(promises).then(() => {
        if (failedJobs.length !== 0) {
            callback(`Key rotation failed for the following users: ${JSON.stringify(failedJobs)}`);
        }

        callback(null, `Successfully rotated the Access Keys for: ${jobs.map((job) => job.user)}`);
    });
}
