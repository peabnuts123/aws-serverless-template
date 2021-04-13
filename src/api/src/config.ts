import { LogLevel } from "./util/Logger";

const { ENVIRONMENT_ID, PROJECT_ID } = process.env;

export interface Config {
  projectTableName: string;
  environmentId: string;
  logLevel: LogLevel;
  awsEndpoint?: string;
}

const baseConfig = {
  // @NOTE defaults to "my-project" if not specified (e.g. when running locally)
  projectTableName: `${PROJECT_ID || 'my-project'}_${ENVIRONMENT_ID}_projects`,
  environmentId: ENVIRONMENT_ID!,
};

let config: Config;

switch (ENVIRONMENT_ID) {
  case 'local':
    process.env['AWS_ACCESS_KEY_ID'] = 'local';
    process.env['AWS_SECRET_ACCESS_KEY'] = 'local';

    config = {
      ...baseConfig,
      awsEndpoint: 'http://localhost:4578',
      logLevel: LogLevel.debug,
    };
    break;
    case 'docker':
    process.env['AWS_ACCESS_KEY_ID'] = 'docker';
    process.env['AWS_SECRET_ACCESS_KEY'] = 'docker';

    config = {
      ...baseConfig,
      // @NOTE override docker table name to match `local` environment
      projectTableName: `${PROJECT_ID || 'my-project'}_local_projects`,
      awsEndpoint: 'http://localstack:4566',
      logLevel: LogLevel.normal,
    };
    break;
  case 'dev':
    config = {
      ...baseConfig,
      logLevel: LogLevel.normal,
    };
    break;
  case 'test':
    config = {
      ...baseConfig,
      logLevel: LogLevel.none,
    };
    break;
  default:
    if (ENVIRONMENT_ID === undefined || ENVIRONMENT_ID.trim() === "") {
      throw new Error("Environment variable `ENVIRONMENT_ID` not set");
    } else {
      throw new Error("Unknown environment id: " + ENVIRONMENT_ID);
    }
}

export default config;
