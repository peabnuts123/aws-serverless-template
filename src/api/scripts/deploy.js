#!/usr/bin/env node
/* eslint-disable no-console */

const { _: args, '$0': processName } = require('yargs').argv;
const { execSync } = require('child_process');
const { performance } = require('perf_hooks');
const fs = require('fs');
const path = require('path');
const { LambdaClient, UpdateFunctionCodeCommand } = require('@aws-sdk/client-lambda');
const archiver = require('archiver');

// Config
const buildDirectory = 'build';
const zipFileName = "api.zip";

// Validation
const environmentName = args[0];
if (environmentName === undefined || environmentName.trim() === '') {
  console.error("No environment name specified (e.g. dev)");
  console.error(`Usage: ${processName} (environment_name)`);
  process.exit(1);
} else if (environmentName === 'local') {
  console.error("Cannot deploy to local environment - API does not run in localstack. Just run it locally instead (e.g. 'npm start')");
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
/** @type {string[]} */
const lambdaFunctionNames = terraformOutput['lambda_function_names'].value;
/** @type {string} */
const awsRegion = terraformOutput['aws_region'].value;

// Build project
exec('npm install && npm run build');

if (!fs.existsSync(buildDirectory)) {
  console.error("Cannot find build directory");
  process.exit(3);
}
// Copy package*.json files into build directory and enter
fs.copyFileSync('package.json', path.join(buildDirectory, 'package.json'));
fs.copyFileSync('package-lock.json', path.join(buildDirectory, 'package-lock.json'));
process.chdir(buildDirectory);

// Install node_modules needed by build
exec('npm ci --only production');

void (async () => {
  await Promise.resolve();

  console.log("Creating zip archive...");
  await createZipArchive(zipFileName, '**/*');
  console.log("Finished creating zip archive");

  const lambdaClient = new LambdaClient({
    region: awsRegion,
  });

  // Deploy build artifact to lambda functions
  const startTimeAll = performance.now();
  for (let i = 0; i < lambdaFunctionNames.length; i++) {
    const functionName = lambdaFunctionNames[i];

    console.log(`Deploying function: ${functionName}...`);
    const startTime = performance.now();

    const response = await lambdaClient.send(new UpdateFunctionCodeCommand({
      FunctionName: functionName,
      ZipFile: fs.readFileSync(zipFileName),
    }));
    const endTime = performance.now();

    console.log(JSON.stringify(response, null, 2));
    console.log(`Finished deploying function '${functionName}' after ${((endTime - startTime) / 1000).toFixed(1)}s`);
  }
  const endTimeAll = performance.now();

  console.log(`Finished deploying code to ${lambdaFunctionNames.length} lambda functions after ${((endTimeAll - startTimeAll) / 1000).toFixed(1)}s`);
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

async function createZipArchive(outputFile, filesGlob) {
  const output = fs.createWriteStream(outputFile);
  const archive = archiver('zip', {
    zlib: { level: 9 },
  });
  archive.pipe(output);

  // Throw errors
  archive.on('error', function (err) {
    throw err;
  });

  // Add files to archive
  archive.glob(filesGlob);

  // Write archive
  await archive.finalize();

  await new Promise((resolve) => setTimeout(resolve, 1000));
}
