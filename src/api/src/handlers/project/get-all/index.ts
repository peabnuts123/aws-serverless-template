import { APIGatewayProxyHandlerV2 } from "aws-lambda";

import Config from '../../../config';

import Db from '../../../db';
import IDatabase from '../../../db/IDatabase';

import Logger from '../../../util/Logger';
import errorResponse from '../../../util/response/error';
import ApiError from "../../../errors/ApiError";
import okResponse from "../../../util/response/ok";
import ErrorModel from "../../../errors/ErrorModel";
import UnknownError from "../../../errors/UnknownError";
import Project from "../../../db/models/Project";

Logger.setLogLevel(Config.logLevel);

const db: IDatabase = new Db();

export const handler: APIGatewayProxyHandlerV2 = async (event, _context) => {
  Logger.log(`Handling request: ${event.requestContext.http.method} ${event.rawPath}${event.rawQueryString ? '?' + event.rawQueryString : ''}`);

  try {
    // Look up all projects
    const allProjects: Project[] = await db.getAllProjects();

    Logger.log(`Successfully looked up ${allProjects.length} projects`);

    return okResponse(allProjects.map((project) => project.toDto()));
  } catch (err) {
    // Error occurred while processing
    let error: ErrorModel;
    if (err instanceof ErrorModel) {
      error = err;
    } else {
      error = new UnknownError(err as (string | Error));
    }

    return errorResponse(new ApiError({
      message: "An error occurred while processing.",
      error,
    }));
  }
};
