/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { CloudFrontFunctionHandler } from "./cloudfront-types";
import Logger, { LogLevel } from "./Logger";

declare const global: any;

export default function registerHandler(handler: CloudFrontFunctionHandler): void {
  if (global.handler !== undefined) {
    throw new Error("Attempted to register a second handler function - possible including multiple handlers in bundle?");
  } else {
    Logger.setLogLevel(LogLevel.normal);
    global.handler = handler;
  }
}
