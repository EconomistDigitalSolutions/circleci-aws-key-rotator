import { AccessKey } from "aws-sdk/clients/iam";

export function sendKeyToCircleCI(key: AccessKey) {
    const url = `https://circleci.com/api/v1.1/project/
                    ${process.env.VCS_PROVIDER}/
                    ${process.env.VCS_USER}/
                    ${process.env.PROJECT_NAME}/
                    envvar?circle-token=${process.env.CIRCLECI_TOKEN}`;

    const request = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name: key.AccessKeyId,
            value: key.SecretAccessKey,
        }),
    };
    console.log(`Sending request to CircleCI: ${JSON.stringify(request)}`);

    return fetch(url, request)
        .then((resp) => {
            console.log(`Received response from CircleCI: ${JSON.stringify(resp)}`);
            return Promise.resolve();
        })
        .catch((err) => {
            // TODO: What to do here? Retry? Can't rollback, discard key?
            console.error(`There was an error sending the request to CircleCI: ${JSON.stringify(err)}`);
            return Promise.reject(err);
        });
}
