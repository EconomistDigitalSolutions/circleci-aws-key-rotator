import { AccessKey } from "aws-sdk/clients/iam";
import { ACCESS_KEY_ID, SECRET_ACCESS_KEY } from "./accessKeys";

/**
 * Sends the given Access Key to CircleCI in the form of environment variables.
 * @param key the AWS Access Key
 */
export function sendKeyToCircleCI(key: AccessKey) {
    const url = `https://circleci.com/api/v1.1/project/
                    ${process.env.VCS_PROVIDER}/
                    ${process.env.VCS_USER}/
                    ${process.env.PROJECT_NAME}/
                    envvar?circle-token=${process.env.API_TOKEN}`;

    const promises: Array<Promise<Response>> = [];
    promises.push(send(url, process.env.ACCESS_KEY_NAME || ACCESS_KEY_ID, key.AccessKeyId));
    promises.push(send(url, process.env.SECRET_KEY_NAME || SECRET_ACCESS_KEY, key.SecretAccessKey));

    return Promise.all(promises)
        .then((data) => {
            data.forEach((resp) => console.log(`Received response from CircleCI: ${JSON.stringify(resp)}`));
            return Promise.resolve();
        })
        .catch((err) => {
            console.error(`There was an error sending the request to CircleCI: ${JSON.stringify(err)}`);
            return Promise.reject(err);
        });
}

/**
 * Helper function to create the request object, log it to the console and send it
 * @param url the URL to send the request to
 * @param key the name of the environment variable to set
 * @param value the value of the environment variable to set
 */
function send(url: string, key: string, value: string): Promise<Response> {
    const request = makeRequest(key, value);
    console.log(`Sending request to CircleCI: ${JSON.stringify(request)}`);
    return fetch(url, request);
}

/**
 * Helper function to create a request object
 * @param key the name of the environment variable to set
 * @param value the value of the environment variable to set
 */
function makeRequest(name: string, value: string): RequestInit {
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