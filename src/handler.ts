import { Callback, Context, ScheduledEvent } from "aws-lambda";
import { IAM } from "aws-sdk";
import { KeyRotator } from "./keyRotator";

export function rotateKeys(event: ScheduledEvent, context: Context, callback: Callback) {

    const url = `https://circleci.com/api/v1.1/project/${process.env.VCS_PROVIDER}/${process.env.VCS_USER}/${process.env.PROJECT_NAME}/envvar?circle-token=${process.env.CIRCLECI_TOKEN}`;
    const user = process.env.CIRCLECI_IAM_USER;

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

    if (!user) {
        return respond(400, 'No IAM User Provided');
    }

    const iam = new IAM();
    const keyRotator = new KeyRotator(iam, url);

    return keyRotator.rotateKeys(user)
        .then(() => respond(200, `Successfully rotated Access Keys for ${user}`))
        .catch((err) => respond(400, err));
}
