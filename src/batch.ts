import { KeyRotator } from "@economist/aws-key-rotator";
import { IAM } from "aws-sdk";
import { createCircleCIHandler } from "./circleci";
import { RotationJob } from "./jobs";

export function batchRotateKeys(iam: IAM, jobs: RotationJob[]) {
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

    return Promise.all(promises)
        .then(() => {
            if (failedJobs.length !== 0) {
                const err = `Key rotation failed for the following users: ${JSON.stringify(failedJobs)}`;
                console.error(err);
                throw err;
            }

            console.log(`Successfully rotated the Access Keys for: ${jobs.map((job) => job.user)}`);
        });
}
