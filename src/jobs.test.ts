import { isJob } from "./jobs";

test('object is job', () => {
    const obj = {
        user: "user",
        vcsProvider: "github",
        vcsUser: "EconomistDigitalSolutions",
        project: "project",
        apiToken: "token",
    };

    if (!isJob(obj)) {
        fail();
    }
});
