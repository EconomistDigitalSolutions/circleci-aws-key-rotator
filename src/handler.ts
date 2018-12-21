import { KeyRotator } from "@economist/aws-key-rotator";
import { Callback, Context, ScheduledEvent } from "aws-lambda";
import { IAM } from "aws-sdk";
import { sendKeyToCircleCI } from "./circleci";

export function rotateKeys(event: ScheduledEvent, context: Context, callback: Callback) {

    // Get the User
    const user = process.env.IAM_USER;
    if (!user) {
        callback('No IAM User Provided');
        return;
    }

    const iam = new IAM();
    const keyRotator = new KeyRotator(iam, sendKeyToCircleCI);

    keyRotator.rotateKeys(user)
        .then(() => callback(null, `Successfully rotated Access Keys for ${user}`))
        .catch((err) => callback(err));
}
