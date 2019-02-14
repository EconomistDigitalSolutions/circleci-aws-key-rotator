# circleci-aws-key-rotator

[![](https://img.shields.io/circleci/project/github/EconomistDigitalSolutions/circleci-aws-key-rotator/master.svg)](https://circleci.com/gh/EconomistDigitalSolutions/circleci-aws-key-rotator)
[![codecov](https://codecov.io/gh/EconomistDigitalSolutions/circleci-aws-key-rotator/branch/master/graph/badge.svg)](https://codecov.io/gh/EconomistDigitalSolutions/circleci-aws-key-rotator)

AWS stack for rotating AWS Access keys used by CircleCI. The stack stores [`Jobs`](#Jobs) representing IAM Users to rotate keys for and does a batch rotation of all the users it holds a `job` for.

# Pre-Requisites
1. An AWS IAM User set up to represent CircleCI.
2. Node.js installed.
3. A CircleCI API token.

# Usage
1. Clone the repository

    ```bash
    git clone https://github.com/EconomistDigitalSolutions/circleci-aws-key-rotator.git
    ```

    or

    ```bash
    git clone git@github.com:EconomistDigitalSolutions/circleci-aws-key-rotator.git
    ```

2. Install dependencies

    ```bash
    npm install
    ```

3. Deploy 

    ```bash
    npm run deploy -- [--profile <value>] [--region <value>]
    ```
This will deploy a Lambda which runs once per day at 04:00am to the AWS account specified by the profile.

## Options
**profile**

*Optional; default = 'default'*

The AWS profile to deploy on.

**region** 

*Optional; default = 'us-east-1'*

The AWS Region to deploy the Lambda on.

# Jobs
Jobs are stored by the stack as JSON objects matching the below schema:
```json
{
    "user": string,
    "vcsProvider": string,
    "vcsUser": string,
    "project": string,
    "apiToken": string,
    "accessKeyName": string?,
    "secretKeyName": string?
}
```
**user**

The IAM User to rotate the Access Keys for.

**vcsProvider**

The VCS provider. Currently CircleCI supports `github` or `bitbucket`.

**vcsUser**

The name of the VCS User.

**project**

The name of the project, i.e. the repository name.

**apiToken**

The API token for accessing the CircleCI API.

**accessKeyName** *(Optional)*

The name to use for the environment variable that stores the Access Key value on CircleCI.

**secretKeyName** *(Optional)*

The name to use for the environment variable that stores the Secret Key value on CircleCI.

# API

## Get Jobs
```
Method: GET 
Path: /jobs
```

Gets the list of jobs currently stored by the stack.

## Add Job
```
Method: POST 
Path: /jobs
Data: Valid Job JSON
```

Adds a new job to the stack. The job should be included as the data on the request.

# Issues/Todo
1. Make the timer configurable. (How? Raw cron syntax as a string param seems likely to be buggy.)