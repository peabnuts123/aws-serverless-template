# AWS Serverless Template - WWW / Frontend Client

This is the frontend project. It is a Gatsby (React) project that is served statically and cached by CloudFront. It communicates to the API on the same domain using AJAX (fetch) calls for data dynamically, on the fly.

## Architecture

The project is a single-page-app / static site generated using [Gatsby](https://github.com/gatsbyjs/gatsby), which means it is a React project. The site is pre-rendered at compile-time from a set of managed content. At runtime, once the site has loaded, React takes over as a single-page-app, and fetches dynamic data from the API. You can learn more about Gatsby [here](https://www.gatsbyjs.com).

The project uses [MobX](https://mobx.js.org/README.html) for state management. "Stores" contain different sets of state for different areas of the app.

[Bulma](https://bulma.io/) is included and used in the sample application for brevity, so I didn't have to ship my whole CSS framework in this project just to make a demo. You can use your own framework or whatever framework you want to use, it's very simple to remove (just remove the import in `vendor.scss`).

The frontend project fetches all of the data it needs, including authentication details through the [API](../api/README.md) project. Domain-specific "Services" are written to abstract API implementation details away from the business logic of the app, exposing functions for interacting with the API. Usually these Services will be used from within a Store, and the results stored in mobx-observed state, rather than from a component directly.

For production, the API is expected to be hosted on the same domain as the frontend, on the path `/api`. For development purposes, though, the API is expected to be on a separate domain (e.g. https://localhost:5000 vs. http://localhost:8080). For projects that use authentication (e.g. OAuth), cookies will not work cross-domain unless you are on a secure context e.g. localhost, which is why the project is set up this way.

## Local development

### Prerequisites (local)

In order to run the project locally, you will need the following:

  - [Node.js and npm](https://nodejs.org/en/)
  - You must have an instance of the API running in order for the site to work properly. You can run it locally in another terminal window, or by running it in docker. See [the API's README](../api/README.md) on how to do this.

### Running the project (local)

1. Make sure you are in the `src/www` directory
1. First make sure you have installed the project's dependencies by running:
    ```sh
    npm install
    ```
1. You can start the development server by running:
    ```sh
    npm start
    ```

There are more npm scripts that you can run. Here is what each of them does:
  - `npm run build` - Build the project
    - You must set the `ENVIRONMENT_ID` environment variable to specify which environment configuration is included in the build e.g. `ENVIRONMENT_ID=dev`. _NOTE: This is done automatically when using the deploy script. `deploy.js`_
  - `npm test` - Run the tests
    - You can also run `npm run test:coverage` to run the tests and collect test coverage statistics, which will then be served on a URL upon completion (to be opened in your browser). Hit CTRL-C to stop the web server after you're finished with it.
  - `npm run lint` - Run code-quality checks across the project
  - `npm run type-check` - Use the TypeScript compiler to check your project has no errors
  - `npm run simulate-build` - "Simulate" the CI server by running all of `test`, `lint`, `type-check` and `build` in-order, to verify that everything is okay

## Docker

### Prerequisites (docker)

You don't need as much stuff to run the project in docker, as the application's dependencies are included in the Docker container. However, you still need an instance of the API running (which can also run in Docker).

  - [docker](https://docs.docker.com/get-docker/) and [docker-compose](https://docs.docker.com/compose/install/)
  - You must have an instance of the API running in order for the site to work properly. You can run it locally in another terminal window, or by running it in docker. See [the API's README](../api/README.md) on how to do this.


### Running the project (docker)

Running the WWW component in docker-compose is very simple.

1. From a terminal, ensure you are in the repository root directory (i.e. NOT in `src/www`)
1. Run the docker container with the following command:
    ```sh
    docker-compose up -d www
    ```
    - This will compile the current code into a new docker image.
    - If you have made some changes to the code, you will need to rebuild the docker image:
      ```sh
      docker-compose up --build -d www
      ```
    - **Note:** Don't run `--build` every time as it will fill up your system with identical images.

You should be good to go!

## Deploying to a cloud environment

Lastly, the WWW component can obviously be hosted in an AWS cloud environment. It is hosted in S3, and served by CloudFront.

To deploy the frontend client to a cloud environment:

1. Ensure the environment exists. Run Terraform to make sure the infrastructure exists / is up to date. See the [terraform documentation](../../terraform/README.md) for more details on this.
1. From a terminal in the `src/www` directory, run the following script:
    ```sh
    ./scripts/deploy.js [environment_id]
    ```
    - The `environment_id` parameter specifies which environment to deploy to e.g. `dev`:
      ```sh
      ./scripts/deploy.js dev
      ```


## Work backlog / TODO

  - _Nothing at-present_.
