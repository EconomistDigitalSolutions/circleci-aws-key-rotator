import { AccessKey } from "aws-sdk/clients/iam";
import { ACCESS_KEY_ID, SECRET_ACCESS_KEY } from "../accessKeys";

export function sendKeyToCircleCI(key: AccessKey) {
    const url = `https://circleci.com/api/v1.1/project/
                    ${process.env.VCS_PROVIDER}/
                    ${process.env.VCS_USER}/
                    ${process.env.PROJECT_NAME}/
                    envvar?circle-token=${process.env.API_TOKEN}`;

    const keyIdRequest = makeRequest(ACCESS_KEY_ID, key.AccessKeyId);
    console.log(`Sending request to CircleCI: ${JSON.stringify(keyIdRequest)}`);

    const secretRequest = makeRequest(SECRET_ACCESS_KEY, key.SecretAccessKey);

    return fetch(url, keyIdRequest)
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

function makeRequest(name: string, value: string) {
    return {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name,
            value,
        }),
    };
}
