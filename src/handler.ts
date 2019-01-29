import { KeyRotator } from "@economist/aws-key-rotator";
import { Callback, Context, ScheduledEvent } from "aws-lambda";
import { IAM } from "aws-sdk";
import { createCircleCIHandler } from "./circleci";
import { getRotationJobs, RotationJob } from "./jobs";
import { BATCH } from "./mode";

export function rotateKeys(event: ScheduledEvent, context: Context, callback: Callback) {

    const iam = new IAM();

    const jobs: Array<RotationJob> = getRotationJobs(process.env.MODE);
    const results: Array<Promise<void>> = [];
    for (const job of jobs) {

        const keyHandler = createCircleCIHandler(job.vcsProvider, job.vcsUser, job.project, job.apiToken, job.accessKeyName, job.secretKeyName);
        const keyRotator = new KeyRotator(iam, keyHandler);

        results.push(keyRotator.rotateKeys(job.user));
    }

    Promise.all(results)
        .then(() => callback(null, `Successfully rotated Access Keys for ${JSON.stringify(jobs.map((job) => job.user))}`))
        .catch((err) => callback(err));

    //     } else {
    //         // Get the User
    //         const user = process.env.IAM_USER;
    //         if (!user) {
    //             callback('No IAM User Provided');
    //             return;
    //         }
    //         const handler = createCircleCIHandler(
    //             process.env.VCS_PROVIDER!,
    //             process.env.VCS_USER!,
    //             process.env.PROJECT_NAME!,
    //             process.env.API_TOKEN!,
    //             process.env.ACCESS_KEY_NAME,
    //             process.env.SECRET_KEY_NAME);

    //         const keyRotator = new KeyRotator(iam, handler);

    //         keyRotator.rotateKeys(user)
    //             .then(() => callback(null, `Successfully rotated Access Keys for ${user}`))
    //             .catch((err) => callback(err));
    //     }
}
