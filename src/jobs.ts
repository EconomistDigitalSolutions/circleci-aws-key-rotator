import AWS = require("aws-sdk");

export interface RotationJob {
    user: string;
    vcsProvider: string;
    vcsUser: string;
    project: string;
    apiToken: string;
    accessKeyName?: string;
    secretKeyName?: string;
}

function isJob(arg: any): arg is RotationJob {
    return arg.user !== undefined &&
        arg.vcsProvider !== undefined &&
        arg.vcsUser !== undefined &&
        arg.project !== undefined &&
        arg.apiToken !== undefined;
}

export function getJobs(region: string, table: string): Promise<RotationJob[]> {
    return getFromDynamo(region, table);
}

function getFromDynamo(region: string, table: string): Promise<RotationJob[]> {
    AWS.config.update({
        endpoint: `https://dynamodb.${region}.amazonaws.com`,
    }, true);
    const docClient = new AWS.DynamoDB.DocumentClient();
    const params: AWS.DynamoDB.DocumentClient.ScanInput = {
        TableName: table,
    };

    return docClient.scan(params)
        .promise()
        .then((data) => {
            if (!data.Items) {
                return [];
            }

            return data.Items.filter(isJob);

        })
        .catch((err) => {
            console.error(err);
            return [];
        });
}

function getFromS3(bucket: string): Promise<RotationJob[]> {
    const s3 = new AWS.S3();

    const listParams: AWS.S3.ListObjectsV2Request = {
        Bucket: bucket,
    };
    return s3.listObjectsV2(listParams)
        .promise()
        .then((data) => {
            if (!data.Contents) {
                return [];
            }

            return data.Contents
                .map((obj) => obj.Key)
                .filter((keys) => keys !== undefined);
        })
        .then((keys) => {
            const jobs: RotationJob[] = [];
            for (const key of keys) {
                if (!key) {
                    continue;
                }
                getJobFromS3(bucket, key).then((job) => {
                    if (isJob(job)) {
                        jobs.push(job);
                    }
                });
            }
            return jobs;
        });

}

function getJobFromS3(bucket: string, key: string) {
    const s3 = new AWS.S3();
    const params: AWS.S3.GetObjectRequest = {
        Bucket: bucket,
        Key: key,
    };

    return s3.getObject(params)
        .promise()
        .then((data) => {
            if (!data.Body) {
                return;
            }
            return JSON.parse(data.Body.toString());
        });
}
