# AWS Serverless Template

This is a template/boilerplate project for more simply creating web applications hosted in AWS. It uses a "Serverless" architecture which is to say that the API runs on-demand via AWS Lambda functions, instead of a long-running process hosted on a server somewhere that you have access to. This makes the entire project extremely cheap to host, even at high volumes of traffic.


## Architecture

### DB

The database used in this project is AWS DynamoDB. This is essentially a NoSQL database that contains free-form objects that can have whatever data they want in them. DynamoDB mixes this paradigm up by referring to each object in the DB as a "row" in a "table" so it can be somewhat confusing to work with. It also has a strong concept of a "primary key" (which every object/row must have) but (like all NoSQL implementations) can't really handle "foreign keys" / relational data beyond nesting related objects as a property on the parent.

DynamoDB is relatively easy to work with for simple projects, but mostly it was chosen for cost purposes. It costs nothing to host until you are storing gigabytes of JSON data and sending out hundreds of Gb per month (at which point you can probably afford to spend a few dollars a month on your "pet project"). Comparatively, even a simple relational database will cost you tens of dollars a month to run for no traffic (and a lot more for high traffic).

DynamoDB can't be easily mocked so when running the project locally, Localstack is used to spin up a compatible mock of DynamoDB (running on Docker).


### API

The API is written in TypeScript for performance reasons. JavaScript is very quick to start up, so "cold-boot" times are relatively low (a second or so). Each API endpoint exports a handler function for that particular endpoint. In AWS these functions are each deployed to their own Lambda and wired together using API Gateway. In local development, a simple express server is started which maps the endpoints to each handler function.

When deployed, the API is proxied behind CloudFront so that the API and the frontend client can be served from the same domain.


### Frontend client

The frontend is a "single-page app" written in React (actually, Gatsby). This was mostly chosen as it is the current favourite in the frontend community. Working in React is the easiest way to find support and integrations with other packages and libraries. Gatsby sets up a working project with sane defaults which makes it much easier to work with React. Gatsby also pre-renders all pages on your site at deploy-time so it makes for a rather snappy site load (no JavaScript bundle woes).

The web client is hosted on S3, and served through CloudFront. Cloudfront caches all the site's assets so, again, load-times should be relatively quick. The cache is disabled for the root `index.html` document so deployments to the site are live instantly.


## Development

This repository contains a fully-working demo application. The application isn't terribly complex so it should be relatively easy to rip out the content that is there and replace it with your own. This is how this repository is intended to be consumed. It is not a framework, it's a project template. The demo project is there to show you how things are supposed to hang together, so that you can build your own without having to research the full context yourself.


### Running the project

Each project is its own self-contained "component". A guide for running / developing each component can be found in each respective README:

  - [API](./src/api/README.md)
  - [www](./src/www/README.md)
  - [Terraform (infrastructure)](./terraform/README.md)

The project as-a-whole is designed to be able to run in a few ways:

  - Manually within each component, for debugging / developing (e.g. `npm start`)
  - With docker-compose, for developing services that depend on other components
    - e.g. if you're working on the frontend and just need a working API to be running, you can run the API and the DB in docker, and run the frontend manually
  - On cloud infrastructure i.e. AWS

Broadly you will need the following things to run the project locally:
  - Node.js and npm
  - Docker


## Deployment

Deployment of this project to an AWS environment is done in 3 parts:

1. Use Terraform to provision the AWS infrastructure needed
1. Compile and build the code needed for the API
1. Compile and build the code needed for the frontend client

Check the individual docs of each ([Terraform](./terraform/README.md), [API](./src/api/README.md), [WWW](./src/www/README.md)) for instructions on how to do these steps in detail.

## Backlog
  - DRY enhancements to API handlers
  - Tests for API
  - Tests for Frontend
  - The things recorded on https://todo.winsauce.com
  - launch.json
  - Docker for frontend (can API run locally while frontend runs in Docker?)