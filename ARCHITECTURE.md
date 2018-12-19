# Architecture
The key rotator is primarily designed for use with CircleCI but is architected to allow the core functionality to be extended to other services in the future if required.

## KeyRotator
The KeyRotator class handles the bulk of the key rotation functionality. It exposes a single method to rotate the keys for a given user which is described below.

### Constructor
```typescript
constructor(iam: IAM, newKeyHandler: NewKeyHandler)
```
#### Params
***iam -*** an instance of an [IAM](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/IAM.html) object from the aws-sdk library. Used to provide access to a users AWS Access Keys.

***newKeyHandler -*** the function for handling the new key once it is created. If the handling is not successful then the KeyRotator will automatically delete the newly created key.

### rotateKeys
```typescript
rotateKeys(user: string): Promise<void>
```
Rotates the access keys for a given user by creating a new key, propagating it as required through the NewKeyHandler and then deleting the old key(s).

#### Params
***user -*** the name of the IAM User to rotate the access keys for.

#### Returns
A promise the resolves with no data if the key rotation was successful and rejects with an error if it was not.


## NewKeyHandler
```typescript
(newKey: AccessKey) => Promise<void>
```
A custom function that handles the newly created Access Key as required.
#### Params
***newKey -*** an instance of an AccessKey object from the aws-sdk library that is returned as part of the [createNewAccessKey](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/IAM.html#createAccessKey-property) method.

#### Returns
A promise the resolves with no data if the new key handling was successful and rejects with an error if it was not.