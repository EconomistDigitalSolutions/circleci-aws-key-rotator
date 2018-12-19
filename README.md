# circleci-aws-key-rotator

[![](https://img.shields.io/circleci/project/github/EconomistDigitalSolutions/circleci-aws-key-rotator/master.svg)](https://circleci.com/gh/EconomistDigitalSolutions/circleci-aws-key-rotator)

AWS Lambda for rotating AWS Access keys used by CircleCI

# Pre-Requisites
1. An AWS IAM User set up to represent CircleCI.
2. Node.js installed.

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

3. Deploy (***N.B.** line breaks are included for reading clarity and should be removed or escaped before running the command*)

    ```bash
    npm run deploy -- 
        --awsAccountId <value> 
        --awsUser <value> 
        --projectName <value>
        [--region <value>] 
        [--vcs <value>] 
        [--vcsUser <value>]
        [--accessKeyName <value>] 
        [--secretKeyName <value>]
    ```
This will deploy a Lambda to the specified AWS account

## Options
**awsAccountId**

The AWS Account ID.

**awsUser**

The AWS IAM User that represents CircleCI. This is the user whose key(s) will be rotated.

**projectName**

The name of the project. This should be the project that is using CircleCI for CI/CD.

**region** 

*Optional; default = 'eu-west-2'*

The AWS Region to deploy the Lambda on.

**vcs** 

*Optional; default = 'github'*

The Version Control provider. Currently CircleCI supports either `github` or `bitbucket`.

**vcsUser** 

*Optional; default = 'EconomistDigitalSolutions'*

The Version Control User that the project belongs to.

**accessKeyName**

*Optional; default = 'AWS_ACCESS_KEY_ID'*

The name of the environment variable that will store the AWS Access Key ID.

**secretKeyName**

*Optional; default = 'AWS_SECRET_ACCESS_KEY'*

The name of the environment variable that will store the AWS Secret Access Key.

# Issues/Todo
1. Make the timer configurable. (How? Raw cron syntax as a string param seems likely to be buggy.)
2. Improve "self-healing" when there are two keys present against the IAM User.
    - Currently if one or more keys are inactive then they will be deleted which should enable the next run of the rotator to succeeed.
    - Could add an extra step to retry the rotation after deleting inactive keys 
    - No way to self-heal if there are 2 active keys -> bad practice, should be avoided