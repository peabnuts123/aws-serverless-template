# AWS Serverless Template - App

This is the "app" project. It contains code to do with the main entrypoint of the app i.e. CloudFront. Currently it just hosts a simple CloudFront function for rewriting rules in the frontend client.

## Architecture

The "app" project is relatively simple. The CloudFront Functions are pure JavaScript (written in TypeScript, of course). They cannot reference any libraries and must compile down to a single file. CloudFront Functions have tight restrictions on the amount of memory they consume and their execution time; read more about these restrictions in-detail [here](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/edge-functions.html).

The handler functions are compiled using [Parcel](https://v2.parceljs.org/) (using babel under the hood). This compiles them down to 1 small file.

## Functions

These are the CloudFront Functions in this project and what they do. Currently there is only 1 function.

  - **www-proxy**
    - Intercepts incoming requests to CloudFront and applies rewrite rules to the request. For example, requests to the project page (e.g. `GET /project/2a9cd657-a741-4c3b-8021-50ee98c354eb`) are rewritten to request the project page's HTML (`/project/[projectId]/index.html`).

## Local development

The CloudFront Functions cannot be run locally, they are only for deployment into a cloud environment.

## Deploying to a cloud environment

To deploy to a cloud environment:

1. Ensure the environment exists. Run Terraform to make sure the infrastructure exists / is up to date. See the [terraform documentation](../../terraform/README.md) for more details on this.
1. From a terminal in the `src/app` directory, run the following script:
    ```sh
    ./scripts/deploy.js [environment_id]
    ```
    - The `environment_id` parameter specifies which environment to deploy to e.g. `dev`:
      ```sh
      ./scripts/deploy.js dev
      ```


## Work backlog / TODO

  - _Nothing at-present_.
