import { KeyRotator } from "@economist/aws-key-rotator";
import { Callback, Context, ScheduledEvent } from "aws-lambda";
import { IAM } from "aws-sdk";
import { createCircleCIHandler } from "./circleci";
import { BATCH } from "./mode";

export function rotateKeys(event: ScheduledEvent, context: Context, callback: Callback) {

    // Get the User
    const user = process.env.IAM_USER;
    if (!user) {
        callback('No IAM User Provided');
        return;
    }

    const iam = new IAM();
    const vcsProvider = process.env.VCS_PROVIDER!;
    const vcsUser = process.env.VCS_USER!;
    const project = process.env.PROJECT_NAME!;
    const apiToken = process.env.API_TOKEN!;
    const keyRotator = new KeyRotator(iam, createCircleCIHandler(
        vcsProvider,
        vcsUser,
        project,
        apiToken,
        process.env.ACCESS_KEY_NAME,
        process.env.SECRET_KEY_NAME));

    keyRotator.rotateKeys(user)
        .then(() => callback(null, `Successfully rotated Access Keys for ${user}`))
        .catch((err) => callback(err));

    // if (process.env.MODE === BATCH) {
    //     for (let i = 0; i < 0; i++) {
    //         process.env.VCS_PROVIDER = "";
    //         process.env.VCS_USER = "";
    //         process.env.PROJECT_NAME = "";
    //         process.env.API_TOKEN = "";

    //         const rotator = new KeyRotator(iam, sendKeyToCircleCI);

    //         rotator.rotateKeys(user)
    //             .then(() => callback(null, `Successfully rotated Access Keys for ${user}`))
    //             .catch((err) => callback(err));
    //     }
    // }
}
