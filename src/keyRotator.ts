import { IAM } from "aws-sdk";
import { AccessKey, AccessKeyMetadata, CreateAccessKeyRequest, ListAccessKeysRequest } from "aws-sdk/clients/iam";
import { ACTIVE, INACTIVE } from "./keyStatus";

export class KeyRotator {

    private iam: IAM;
    private url: string;

    /**
     * Construct a new KeyRotator
     * @param iam the IAM Service Provider
     * @param url API URL for updating the key(s)
     */
    constructor(iam: IAM, url: string) {
        this.iam = iam;
        this.url = url;
    }

    /**
     * Rotate the Access Key(s) for a given IAM User
     * @param user the IAM User
     */
    public rotateKeys(user: string) {
        return this.getExistingKeys(user)
            .then(this.deleteInactiveKeys)
            .then((keys) => {
                this.createNewKey(user);
                // .then(this.sendNewKey);
                return keys;
            })
            .then(this.deactivateOldKeys)
            .then(() => { return; })
            .catch((err) => {
                this.handlerError(err);
            });
    }

    /**
     * Gets the existing Access Keys for a given IAM User
     * @param user the IAM User to get the Access Keys for
     */
    private getExistingKeys = (user: string): Promise<AccessKeyMetadata[]> => {
        console.log(`Retrieving existing keys for User ${user}`);
        const params: ListAccessKeysRequest = {
            UserName: user,
        };

        return this.iam.listAccessKeys(params)
            .promise()
            .then((data) => {
                console.log(`Retrieved the following keys for User ${user}: ${JSON.stringify(data.AccessKeyMetadata)}`);
                return Promise.resolve(data.AccessKeyMetadata);
            })
            .catch((err) => {
                return Promise.resolve([]);
            });
    }

    /**
     * Deletes any inactive keys in the given list
     * @param keys a list of IAM Access Keys
     */
    private deleteInactiveKeys = (keys: AccessKeyMetadata[]): Promise<AccessKeyMetadata[]> => {
        console.log('Deleting inactive keys');
        const inactiveKeys = keys.filter((key) => key.Status === INACTIVE && key.AccessKeyId);
        console.log(`The following keys are inactive and will be deleted: ${JSON.stringify(inactiveKeys)}`);
        inactiveKeys.forEach(this.deleteKey);
        return Promise.resolve(keys);
    }

    /**
     * Deletes a given key.
     * @param key the key to delete
     */
    private deleteKey = (key: AccessKeyMetadata) => {
        console.log(`Deleting Access Key: ${key.AccessKeyId}`);
        const params = {
            AccessKeyId: key.AccessKeyId!,
        };

        return this.iam.deleteAccessKey(params)
            .promise()
            .then((data) => {
                console.log(`Deleted Access Key: ${params.AccessKeyId}`);
                Promise.resolve(data);
            });
    }

    /**
     * Deactivates any active keys in the given list
     * @param keys a list of IAM Access Keys
     */
    private deactivateOldKeys = (keys: AccessKeyMetadata[]): Promise<AccessKeyMetadata[]> => {
        console.log(`Deactivating old keys from: ${JSON.stringify(keys)}`);
        const activeKeys = keys.filter((key) => key.Status === ACTIVE && key.AccessKeyId);
        console.log(`The following keys will be deactivated: ${JSON.stringify(activeKeys)}`);
        activeKeys.forEach(this.deactivateKey);
        return Promise.resolve(keys);
    }

    /**
     * Deactivates a given key by updating its Status to 'Inactive'.
     * @param key the key to update
     */
    private deactivateKey = (key: AccessKeyMetadata) => {
        console.log(`Deactivating Access Key: ${key.AccessKeyId}`);
        const params = {
            AccessKeyId: key.AccessKeyId!,
            Status: INACTIVE,
        };

        return this.iam.updateAccessKey(params)
            .promise()
            .then((data) => {
                console.log(`Deactivated Access Key: ${params.AccessKeyId}`);
                return Promise.resolve(data);
            });
    }

    /**
     * Creates a new Access Key and updates the relevant CircleCI environment variables.
     */
    private createNewKey = (user: string): Promise<AccessKey> => {
        console.log(`Creating a new Access Key for User: ${user}`);

        const params: CreateAccessKeyRequest = {
            UserName: user,
        };

        return this.iam.createAccessKey(params)
            .promise()
            .then((data) => {
                const newKey = data.AccessKey;
                console.log(`Created a new Access Key: ${JSON.stringify(newKey)}`);
                return Promise.resolve(newKey);
            });
    }

    private sendNewKey = (key: AccessKey): Promise<Response> => {
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

        return fetch(this.url, request)
            .then((resp) => {
                console.log(`Received response from CircleCI: ${JSON.stringify(resp)}`);
                return Promise.resolve(resp);
            })
            .catch((err) => {
                return Promise.reject(err);
                // TODO: What to do here? Retry? Can't rollback, discard key?
                // this.handlerError(err);
            });
    }

    /**
     * Checks whether the provided error is truthy and, if it is, logs it
     * to the console and throws it
     * @param error the error returned from a callback
     * @throws if the provided error is truthy
     */
    private handlerError(error: Error) {
        if (error) {
            console.log(error);
            throw error;
        }
    }
}
