import { ApplicationConfig, GlobalConfig } from "../Config";
import { LogLevel } from "@app/util/Logger";

const LocalConfig: ApplicationConfig = {
  ...GlobalConfig,
  // @NOTE remember this is a client-side address. This is the address
  //  that the client's browser will fetch for the API.
  ApiHost: `http://localhost:5232`,
  LogLevel: LogLevel.debug,
};

export default LocalConfig;
