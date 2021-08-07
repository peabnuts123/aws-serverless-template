#!/usr/bin/env node
/* eslint-disable no-console */

const { _: args, '$0': processName } = require('yargs').argv;
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const {
  CloudFrontClient,
  DescribeFunctionCommand,
  UpdateFunctionCommand,
  PublishFunctionCommand,
} = require('@aws-sdk/client-cloudfront');

// Config
const buildDirectory = 'build';

// Validation
const environmentName = args[0];
if (environmentName === undefined || environmentName.trim() === '') {
  console.error("No environment name specified (e.g. dev)");
  console.error(`Usage: ${processName} (environment_name)`);
  process.exit(1);
} else if (environmentName === 'local') {
  console.error("Cannot deploy to local environment - CloudFront does not run in localstack, it can only be deployed in a real environment.");
  process.exit(5);
}
if (!fs.existsSync('package.json')) {
  console.error("You must run this script from the project root.");
  process.exit(2);
}

// Fetch config from terraform
const terraformEnvironmentPath = `../../terraform/environments/${environmentName}`;
if (!fs.existsSync(terraformEnvironmentPath)) {
  console.error(`No terraform environment named '${environmentName}'`);
  process.exit(4);
}
const rawTerraformOutput = exec('terraform output --json', {
  cwd: terraformEnvironmentPath,
  stdio: 'pipe',
});
const terraformOutput = JSON.parse(rawTerraformOutput);

// Outputs from Terraform
/** @type {Record<string,string>} */
const wwwProxyFunctionConfig = terraformOutput['wwwproxy_function'].value;
/** @type {string} */
const cloudfrontDomainName = terraformOutput['cloudfront_domain_name'].value;
/** @type {string} */
const awsRegion = terraformOutput['aws_region'].value;

// Build project
exec('npm install && npm run build');

if (!fs.existsSync(buildDirectory)) {
  console.error("Cannot find build directory");
  process.exit(3);
}

// Async block
void (async () => {
  try {
    const cloudfrontClient = new CloudFrontClient({
      region: awsRegion,
    });

    await deployCloudFrontFunction(wwwProxyFunctionConfig, cloudfrontClient);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();


/**
 *
 * @param {string} command Command to exec
 * @param {import('child_process').ExecSyncOptionsWithStringEncoding} options
 */
function exec(command, options = {}) {
  console.log(`[exec]: ${command}`);

  return execSync(command, {
    stdio: 'inherit',
    encoding: 'utf-8',
    ...options,
  });
}

/**
 * Given the config output from Terraform, deploy & publish code for a CloudFront Function
 * @param {Record<string,string>} config Config from Terraform incl. name, handler, etc.
 * @param {CloudFrontClient} client CloudFront client form AWS SDK
 */
async function deployCloudFrontFunction(config, client) {
  console.log(`Deploying CloudFront function '${config.name}'...`);

  const functionCode = fs.readFileSync(path.join(buildDirectory, config.handler));

  // 1. Get current function's etag
  console.log("Get function's latest etag...");
  const describeResponse = await client.send(new DescribeFunctionCommand({
    Name: config.name,
  }));
  console.log(JSON.stringify(describeResponse, null, 2));
  let etag = describeResponse.ETag;

  // 2. Update code for function
  console.log("Update code for function...");
  const updateResponse = await client.send(new UpdateFunctionCommand({
    Name: config.name,
    IfMatch: etag,
    FunctionConfig: {
      Comment: `'www-proxy' function for distribution: ${cloudfrontDomainName}`,
      Runtime: "cloudfront-js-1.0",
    },
    FunctionCode: functionCode,
  }));
  console.log(JSON.stringify(updateResponse, null, 2));
  etag = updateResponse.ETag;

  // 3. Publish new version of function as latest
  console.log("Publish new version of function...");
  const publishResponse = await client.send(new PublishFunctionCommand({
    Name: config.name,
    IfMatch: etag,
  }));
  console.log(JSON.stringify(publishResponse, null, 2));

  console.log(`Successfully deployed code for CloudFront function '${config.name}'.`);
}
