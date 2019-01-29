import { BATCH } from "./mode";

export function getRotationJobs(mode?: string): Array<RotationJob> {
    if (mode === BATCH) {
        // get batch jobs
        return [];
    } else {
        // Get the User
        const user = process.env.IAM_USER;
        if (!user) {
            // callback('No IAM User Provided');
            return [];
        }
        return [{
            user,
            vcsProvider: process.env.VCS_PROVIDER!,
            vcsUser: process.env.VCS_USER!,
            project: process.env.PROJECT_NAME!,
            apiToken: process.env.API_TOKEN!,
            accessKeyName: process.env.ACCESS_KEY_NAME,
            secretKeyName: process.env.SECRET_KEY_NAME,
        }];
    }
}

export interface RotationJob {
    user: string;
    vcsProvider: string;
    vcsUser: string;
    project: string;
    apiToken: string;
    accessKeyName?: string;
    secretKeyName?: string;
}
