import { ApplicationConfig, GlobalConfig } from "../Config";
import { LogLevel } from "@app/util/Logger";

const LocalConfig: ApplicationConfig = {
  ...GlobalConfig,
  ApiHost: `http://localhost:5232`,
  LogLevel: LogLevel.debug,
};

export default LocalConfig;
