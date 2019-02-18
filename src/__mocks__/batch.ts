import { IAM } from "aws-sdk";
import { RotationJob } from "../jobs";

const Batch: any = jest.genMockFromModule('../batch');

function batchRotateKeys(iam: IAM, jobs: RotationJob[]) {
    return Promise.reject('Test error');
}

Batch.batchRotateKeys = batchRotateKeys;

module.exports = Batch;
