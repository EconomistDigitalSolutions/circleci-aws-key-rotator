import { Callback } from "aws-lambda";
import { IAM } from "aws-sdk";
import * as AWS from "aws-sdk-mock";
import { AccessKey, AccessKeyMetadata, CreateAccessKeyRequest, DeleteAccessKeyRequest, ListAccessKeysRequest, UpdateAccessKeyRequest} from "aws-sdk/clients/iam";
import { KeyRotator } from "./keyRotator";

let iam: IAM;
let keys: AccessKeyMetadata[];
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
    keyRotator.rotateKeys('')
        .then((newKeys) => {
            if (!newKeys) {
                fail();
                done();
                return;
            }
            expect(newKeys.length).toBe(1);
            expect(newKeys[0].Status).toBe(ACTIVE);
            done();
        });
});

test('1 active key', (done) => {
    const existingKey = createKey(ACTIVE);
    keys.push(existingKey);

    keyRotator.rotateKeys('')
        .then((newKeys) => {
            if (!newKeys) {
                fail();
                done();
                return;
            }
            expect(newKeys.length).toBe(2);
            expect(existingKey.Status).toBe(INACTIVE);
            // expect new key to be active
            done();
        });
});

test('1 inactive key', (done) => {
    const existingKey = createKey(INACTIVE);
    keys.push(existingKey);

    keyRotator.rotateKeys('')
        .then((newKeys) => {
            if (!newKeys) {
                fail();
                done();
                return;
            }
            expect(newKeys.length).toBe(1);
            expect(keys.indexOf(existingKey)).toBe(-1);
            // expect new key to be active
            done();
        });
});

test('1 active and 1 inactive key', (done) => {
    const existingInactiveKey = createKey(INACTIVE);
    const existingActiveKey = createKey(ACTIVE);

    keys.push(existingInactiveKey);
    keys.push(existingActiveKey);

    keyRotator.rotateKeys('')
        .then((newKeys) => {
            if (!newKeys) {
                fail();
                done();
                return;
            }
            expect(newKeys.length).toBe(2);
            expect(keys.indexOf(existingInactiveKey)).toBe(-1);
            expect(existingActiveKey.Status).toBe(INACTIVE);
            // expect new key to be active
            done();
        });
});

test('2 inactive keys', (done) => {
    const firstExistingKey = createKey(INACTIVE);
    const secondExistingKey = createKey(INACTIVE);

    keys.push(firstExistingKey);
    keys.push(secondExistingKey);

    keyRotator.rotateKeys('')
        .then((newKeys) => {
            if (!newKeys) {
                fail();
                done();
                return;
            }
            expect(newKeys.length).toBe(1);
            expect(keys.indexOf(firstExistingKey)).toBe(-1);
            expect(keys.indexOf(secondExistingKey)).toBe(-1);
            // expect new key to be active
            done();
        });
});

// test('2 active keys', (done) => {
//     const firstExistingKey = createKey(ACTIVE);
//     const secondExistingKey = createKey(ACTIVE);

//     keys.push(firstExistingKey);
//     keys.push(secondExistingKey);

//     keyRotator.rotateKeys('')
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
const ACTIVE = 'Active';
const INACTIVE = 'Inactive';
// type KeyStatus = ACTIVE | INACTIVE;

function createKey(status: string): AccessKeyMetadata {
    return {
        AccessKeyId: '',
        Status: status,
        UserName: '',
    };
}

function mockListAccessKeys(params: ListAccessKeysRequest, callback: Callback) {
    callback(null, {
        AccessKeyMetadata: keys,
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

    const newKey: AccessKey = {
        UserName: params.UserName || "",
        AccessKeyId: "",
        SecretAccessKey: "",
        Status: 'Active',
    };

    keys.push({
        AccessKeyId: newKey.AccessKeyId,
        Status: newKey.Status,
        UserName: newKey.UserName,
    });

    callback(null, {
        AccessKey: newKey,
    });
}

function mockDeleteAccessKey(params: DeleteAccessKeyRequest, callback: Callback) {
    console.log("Mocking delete key...");
    console.log(keys);
    console.log(params.AccessKeyId);
    keys = keys.filter((key) => key.AccessKeyId !== params.AccessKeyId);
    console.log(keys);
    callback(null, {});
}
