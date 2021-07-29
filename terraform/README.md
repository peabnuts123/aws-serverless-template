# AWS Serverless Template - Terraform / Cloud Infrastructure

This folder contains all the infrastructure code to run and manage the different environments. One can easily spin-up an environment by providing some config in a `.tfvars` file and running `terraform apply`.

## Architecture

Each component has its own module and takes in the dependencies it needs as variables. Each environment deploys the modules it needs.

```md
# List of environments
  - dev
  - local
  - (test)
  - etc.

# Environment definition
  - environments/dev
    - main.tf - specifies modules as-needed e.g. `db`, `api`, etc.
    - outputs.tf
    - providers.tf
    - etc.

# Modules / components
  - modules/api
    - api-gateway.tf
    - cloudwatch.tf
    - etc.
  - modules/db
    - heroku.tf
    - etc.
  - etc.
```


## Deploying an environment

Since Terraform is designed to be idempotent, you can use the same process to create a new environment or update an existing one.

### Prerequisites

You need to have a few things before you can create an environment:
  - The Access/Secret Key of an AWS user with the following permissions:
    - IAMFullAccess
    - AmazonDynamoDBFullAccess
    - CloudWatchLogsFullAccess
    - AmazonAPIGatewayAdministrator
    - AWSLambda_FullAccess
    - AmazonS3FullAccess
    - CloudFrontFullAccess
    - AWSCertificateManagerFullAccess

  - A domain set up (and active) in ACM
    - TL;DR:
      1. Add your domain to ACM
      1. Add a CNAME record to your domain with the name/value that ACM gives you
      1. Wait for it to validate
      1. Now you are good to go
    - You will use this domain in the config e.g. `dev.myproject.com`

### Deploying

Once you have everything you need, you can do the following to create the infrastructure for an environment:

1. Within an environment folder, copy the file `example.tfvars` and name it `terraform.tfvars`
1. Fill in all the values in the new file. Some are already provided for you. You must provide every value.
1. If this is the first time you have deployed, or you've made module/provider changes, run `terraform init`
1. Now you are good to go. Run `terraform apply`
1. Terraform will do a bunch of processing and then provide you with a plan. You will be asked if you want to continue; type 'yes' and hit enter. It will take a while to spin up all the infrastructure it needs (the first time), but eventually your environment will finish creating, and you will be presented with some outputs
1. You've just created the skeleton infrastructure needed to run your environment - now you need to deploy the code for each component 🙂

## Deploying to localstack

This project is set-up to be able to deploy its infrastructure to a running instance of [localstack](https://github.com/localstack/localstack). This does not deploy an entire environment of infrastructure (mostly because it is limited by localstack's _free tier_), it only deploys the components that cannot be run locally manually (basically just the DB).

1. Make sure localstack is running. You can run this with the provided docker-compose.yml file by running `docker-compose up -d localstack`. This is a pre-configured containerised instance of localstack that will run only the needed components.
1. Deploy the infrastructure as per the normal method above.

## Deploying components' code

Each component has code that needs to be deployed into the environment as a separate step. Each component folder will have some deploy scripts for doing this, and the documentation for deploying the code for each component lives in each respective README.

Generally speaking, these scripts just need the ID of the that is being deployed to (e.g. `node scripts/deploy.js dev`).

_Remember that code cannot be deployed to the local environment, it is for development purposes only._

## Backlog / TODO

  - Update project_id/environment_id validation to remove underscores
  - For that matter, document build/deploy scripts dependencies
  - Add "Comment" to each CloudFront to describe what the heck it is