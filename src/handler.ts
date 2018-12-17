import { Callback, Context, ScheduledEvent } from "aws-lambda";
import { IAM } from "aws-sdk";
import { sendKeyToCircleCI } from "./key_handlers/circleci";
import { KeyRotator } from "./keyRotator";

export function rotateKeys(event: ScheduledEvent, context: Context, callback: Callback) {

    // Closure for creating the response
    const respond = (statusCode: number, message: string) => {
        return {
            statusCode,
            body: JSON.stringify({
                message,
                input: event,
            }),
        };
    };

    // Get the User
    const user = process.env.CIRCLECI_IAM_USER;
    if (!user) {
        return respond(400, 'No IAM User Provided');
    }

    const iam = new IAM();
    const keyRotator = new KeyRotator(iam, sendKeyToCircleCI);

    return keyRotator.rotateKeys(user)
        .then(() => respond(200, `Successfully rotated Access Keys for ${user}`))
        .catch((err) => respond(400, err));
}
