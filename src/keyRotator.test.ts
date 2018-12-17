import { Callback } from "aws-lambda";
import { IAM } from "aws-sdk";
import * as AWS from "aws-sdk-mock";
import { AccessKey, AccessKeyMetadata, CreateAccessKeyRequest, DeleteAccessKeyRequest, ListAccessKeysRequest, UpdateAccessKeyRequest } from "aws-sdk/clients/iam";
import * as uuidv4 from "uuid/v4";
import { KeyRotator } from "./keyRotator";
import { ACTIVE, INACTIVE } from "./keyStatus";

const user = 'TestUser';

let iam: IAM;
let keys: AccessKeyMetadata[];
let newKey: AccessKeyMetadata;
let keyRotator: KeyRotator;

// SETUP
beforeAll(() => {
    AWS.mock('IAM', 'listAccessKeys', mockListAccessKeys);
    AWS.mock('IAM', 'updateAccessKey', mockUpdateAccessKey);
    AWS.mock('IAM', 'createAccessKey', mockCreateAccessKey);
    AWS.mock('IAM', 'deleteAccessKey', mockDeleteAccessKey);

    iam = new IAM();
    keyRotator = new KeyRotator(iam, '');
});

beforeEach(() => {
    keys = [];
});

// TEAR DOWN
afterAll(() => {
    AWS.restore('IAM');
});

// TESTS
test('no existing keys', (done) => {
    keyRotator.rotateKeys(user)
        .then(() => {
            console.log(`Keys after rotation: ${JSON.stringify(keys)}`);

            // Expect there to be a single key and it should be active
            expect(keys.length).toBe(1);
            expect(newKey.Status).toBe(ACTIVE);
            expect(keys.indexOf(newKey)).toBeGreaterThanOrEqual(0);
            done();
        });
});

test('1 active key', (done) => {
    const existingKey = createKey(ACTIVE);
    keys.push(existingKey);

    keyRotator.rotateKeys(user)
        .then(() => {
            console.log(`Keys after rotation: ${JSON.stringify(keys)}`);

            // Expect there to be 2 keys
            expect(keys.length).toBe(2);

            // Existing key should be present but inactive
            expect(existingKey.Status).toBe(INACTIVE);
            expect(keys.indexOf(existingKey)).toBeGreaterThanOrEqual(0);

            // New key should be present and active
            expect(newKey.Status).toBe(ACTIVE);
            expect(keys.indexOf(newKey)).toBeGreaterThanOrEqual(0);
            done();
        });
});

test('1 inactive key', (done) => {
    const existingKey = createKey(INACTIVE);
    keys.push(existingKey);

    keyRotator.rotateKeys(user)
        .then(() => {
            console.log(`Keys after rotation: ${JSON.stringify(keys)}`);

            // Expect there to be 1 key
            expect(keys.length).toBe(1);

            // Expect existing key to have been removed
            expect(keys.indexOf(existingKey)).toBe(-1);

            // Expect new key to be present and active
            expect(newKey.Status).toBe(ACTIVE);
            expect(keys.indexOf(newKey)).toBeGreaterThanOrEqual(0);
            done();
        });
});

test('1 active and 1 inactive key', (done) => {
    const existingInactiveKey = createKey(INACTIVE);
    const existingActiveKey = createKey(ACTIVE);

    keys.push(existingInactiveKey);
    keys.push(existingActiveKey);

    keyRotator.rotateKeys(user)
        .then(() => {
            console.log(`Keys after rotation: ${JSON.stringify(keys)}`);

            // Expect there to be 2 keys
            expect(keys.length).toBe(2);

            // Expect existing inactive key to have been removed
            expect(keys.indexOf(existingInactiveKey)).toBe(-1);

            // Expect existing active key to be present and inactive
            expect(existingActiveKey.Status).toBe(INACTIVE);
            expect(keys.indexOf(existingActiveKey)).toBeGreaterThanOrEqual(0);

            // Expect new key to be present and active
            expect(newKey.Status).toBe(ACTIVE);
            expect(keys.indexOf(newKey)).toBeGreaterThanOrEqual(0);
            done();
        });
});

test('2 inactive keys', (done) => {
    const firstExistingKey = createKey(INACTIVE);
    const secondExistingKey = createKey(INACTIVE);

    keys.push(firstExistingKey);
    keys.push(secondExistingKey);

    keyRotator.rotateKeys(user)
        .then(() => {
            console.log(`Keys after rotation: ${JSON.stringify(keys)}`);

            // Expect there to be 1 key
            expect(keys.length).toBe(1);

            // Expect both existing keys to have been removed
            expect(keys.indexOf(firstExistingKey)).toBe(-1);
            expect(keys.indexOf(secondExistingKey)).toBe(-1);

            // Expect new key to be present and active
            expect(newKey.Status).toBe(ACTIVE);
            expect(keys.indexOf(newKey)).toBeGreaterThanOrEqual(0);
            done();
        });
});

// TODO: Think about what the correct handling for this scenario is. Need to assert which key has a
// stronger claim, propagate it to existing users of the other key and then rotate as normal.
// test('2 active keys', (done) => {
//     const firstExistingKey = createKey(ACTIVE);
//     const secondExistingKey = createKey(ACTIVE);

//     keys.push(firstExistingKey);
//     keys.push(secondExistingKey);

//     keyRotator.rotateKeys(user)
//         .then((newKeys) => {
//             if (!newKeys) {
//                 fail();
//                 done();
//                 return;
//             }
//             expect(newKeys.length).toBe(1);
//             expect(keys.indexOf(firstExistingKey)).toBe(-1);
//             expect(keys.indexOf(secondExistingKey)).toBe(-1);
//             // expect new key to be active
//             done();
//         });
// });

// HELPERS
function createKey(status: string): AccessKeyMetadata {
    return {
        AccessKeyId: uuidv4(),
        Status: status,
        UserName: user,
    };
}

function mockListAccessKeys(params: ListAccessKeysRequest, callback: Callback) {
    callback(null, {
        AccessKeyMetadata: keys.slice(),
    });
}

function mockUpdateAccessKey(params: UpdateAccessKeyRequest, callback: Callback) {
    keys.filter((key) => key.AccessKeyId === params.AccessKeyId)
        .forEach((key) => key.Status = params.Status);
    callback(null, {});
}

function mockCreateAccessKey(params: CreateAccessKeyRequest, callback: Callback) {
    if (keys.length >= 2) {
        callback(new Error("Maximum 2 keys."), {});
        return;
    }

    const accessKey: AccessKey = {
        UserName: params.UserName || "",
        AccessKeyId: uuidv4(),
        SecretAccessKey: "",
        Status: 'Active',
    };

    newKey = {
        AccessKeyId: accessKey.AccessKeyId,
        Status: accessKey.Status,
        UserName: accessKey.UserName,
    };

    keys.push(newKey);

    callback(null, {
        AccessKey: accessKey,
    });
}

function mockDeleteAccessKey(params: DeleteAccessKeyRequest, callback: Callback) {
    console.log(`Keys before delete: ${JSON.stringify(keys)}`);
    keys = keys.filter((key) => key.AccessKeyId !== params.AccessKeyId);
    console.log(`Keys after delete: ${JSON.stringify(keys)}`);
    callback(null, {});
}
