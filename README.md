# circleci-aws-key-rotator

[![](https://img.shields.io/circleci/project/github/EconomistDigitalSolutions/circleci-aws-key-rotator/master.svg)](https://circleci.com/gh/EconomistDigitalSolutions/circleci-aws-key-rotator)

AWS Lambda for rotating AWS Access keys used by CircleCI

# Pre-Requisites


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
    ```

## Options
**awsAccountId**

The AWS Account ID.

**awsUser**

The AWS IAM User that represents CircleCI.

**projectName**

The name of the project.

**region** 

*Optional; default = 'eu-west-2'*

The AWS Region to deploy the Lambda on.

**vcs** 

*Optional; default = 'github'*

The Version Control provider. Currently CircleCI supports either `github` or `bitbucket`.

**vcsUser** 

*Optional; default = 'EconomistDigitalSolutions'*

The Version Control User that the project belongs to.

# Issues/Todo
1. Append/preprend project name to Lambda name to allow multiple instances on the same AWS account for different projects
2. Make the timer configurable. (How? Raw cron syntax as a string param seems likely to be buggy.)
3. Delay in delete propagation
    - Delete call returns successfully but the key may not be removed immediately
    - Prevents new key being created if there are already 2 keys
    - ~~Create separate sweep step that runs on a set time prior to rotation to allow for delete to propagate?~~ Run delete after deactivation (i.e. as final step). No need to ever reactivate old keys, assume single key at beginning of rotation
4. How to handle case of 2 active keys?
    - Don't.
    - Bad practice, if there are two active keys then something has gone wrong, manually intervene