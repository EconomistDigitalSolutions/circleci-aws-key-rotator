import { IAM } from "aws-sdk";
import { AccessKey, AccessKeyMetadata, CreateAccessKeyRequest, ListAccessKeysRequest } from "aws-sdk/clients/iam";
import { ACTIVE, INACTIVE } from "./keyStatus";

export type NewKeyHandler = (key: AccessKey) => Promise<void>;

export class KeyRotator {

    private iam: IAM;
    private handleNewKey: NewKeyHandler;

    /**
     * Construct a new KeyRotator
     * @param iam the IAM Service Provider
     * @param newKeyHandler the callback invoked on creation of a new key. Takes the new key as a parameter
     */
    constructor(iam: IAM, newKeyHandler: NewKeyHandler) {
        this.iam = iam;
        this.handleNewKey = newKeyHandler;
    }

    /**
     * Rotate the Access Key(s) for a given IAM User
     * @param user the IAM User
     */
    public rotateKeys(user: string) {
        return this.getExistingKeys(user)
            .then((keys) =>
                this.createNewKey(user)
                    .then(this.handleNewKey)
                    .then(() => keys)
                    .catch((err) => {
                        // Try to self-heal by removing any inactive keys but still throw an error
                        // as we haven't created/handled the new key correctly
                        this.deleteInactiveKeys(keys);
                        return Promise.reject(err);
                    }))
            .then(this.deactivateOldKeys)
            .then(this.deleteInactiveKeys)
            .then(() => Promise.resolve())
            .catch((err) => {
                console.error(`There was an error during key rotation: ${JSON.stringify(err)}`);
                return Promise.reject(err);
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

        const promises: Array<Promise<any>> = [];
        inactiveKeys.forEach((key) => {
            const p = this.deleteKey(key);
            promises.push(p);
        });

        return Promise.all(promises)
            .then((data) => keys);
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
                return Promise.resolve(data);
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

        const promises: Array<Promise<any>> = [];
        activeKeys.forEach((key) => {
            const p = this.deactivateKey(key);
            promises.push(p);
        });

        return Promise.all(promises)
            .then((data) => keys);
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
     * @param user the IAM User to create a new Access Key for
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
}
