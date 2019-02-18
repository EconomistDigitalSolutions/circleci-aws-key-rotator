import { NewKeyHandler } from "@economist/aws-key-rotator";
import { AccessKey } from "aws-sdk/clients/iam";
import "isomorphic-fetch";
import { ACCESS_KEY_ID, SECRET_ACCESS_KEY } from "./accessKeys";

/**
 * Function which creates a NewKeyHandler for CircleCI when called.
 * @param vcsProvider the version control provider, e.g. github
 * @param vcsUser the version control user
 * @param project the name of the project in the VCS/CircleCI
 * @param apiToken the CircleCI API Token
 * @param accessKeyName the name for the Access Key env var in CircleCI
 * @param secretKeyName the name for the Secret Key env var in CircleCI
 */
export function createCircleCIHandler(vcsProvider: string, vcsUser: string, project: string, apiToken: string, accessKeyName?: string, secretKeyName?: string): NewKeyHandler {
    return (key: AccessKey) => {
        const url = `https://circleci.com/api/v1.1/project/${vcsProvider}/${vcsUser}/${project}/envvar?circle-token=${apiToken}`;

        const promises: Array<Promise<Response>> = [];
        promises.push(send(url, accessKeyName || ACCESS_KEY_ID, key.AccessKeyId));
        promises.push(send(url, secretKeyName || SECRET_ACCESS_KEY, key.SecretAccessKey));

        return Promise.all(promises)
            .then((data) => {
                // Sanitize the response to: a) remove any sensitive data (i.e. API Token) and b) remove any extraneous data that just bloats the logs
                const responses = data.map((resp) => ({
                    ok: resp.ok,
                    status: resp.status,
                    statusText: resp.statusText,
                    headers: resp.headers,
                }));

                responses.forEach((resp) => console.log(`Received response from CircleCI: ${JSON.stringify(resp)}`));

                const badResponses = responses.filter((resp) => !resp.ok);
                if (badResponses.length !== 0) {
                    throw new Error(`Received one or more bad responses from CircleCI: ${JSON.stringify(badResponses)}`);
                }

            })
            .catch((err) => {
                console.error(`There was an error sending the request to CircleCI: ${JSON.stringify(err)}`);
                throw err;
            });
    };
}

/**
 * Helper function to create the request object, log it to the console and send it
 * @param url the URL to send the request to
 * @param key the name of the environment variable to set
 * @param value the value of the environment variable to set
 */
function send(url: string, key: string, value: string): Promise<Response> {
    const request = makeRequest(key, value);
    console.log(`Sending request to CircleCI to set/update env var: ${key}`);
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
