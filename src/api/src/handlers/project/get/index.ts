import { APIGatewayProxyHandlerV2 } from "aws-lambda";

import Config from '@app/config';

import Db from '@app/db';
import IDatabase from '@app/db/IDatabase';

import Logger from '@app/util/Logger';
import errorResponse from '@app/util/response/error';
import badRequestResponse from '@app/util/response/bad-request';
import notFoundResponse from "@app/util/response/not-found";
import ApiError from "@app/errors/ApiError";
import GenericError from "@app/errors/GenericError";
import ErrorId from "@app/errors/ErrorId";
import okResponse from "@app/util/response/ok";
import ErrorModel from "@app/errors/ErrorModel";
import UnknownError from "@app/errors/UnknownError";
import RequestValidationError from "@app/errors/RequestValidationError";
import { isValidProjectId } from "@app/validators/project";

Logger.setLogLevel(Config.logLevel);

const db: IDatabase = new Db();

export const handler: APIGatewayProxyHandlerV2 = async (event, _context) => {
  Logger.log(`Handling request: ${event.requestContext.http.method} ${event.rawPath}${event.rawQueryString ? '?' + event.rawQueryString : ''}`);

  try {
    // Validate path parameter exists
    const projectId: string | unknown = event.pathParameters?.id;
    if (!isValidProjectId(projectId)) {
      return badRequestResponse(new ApiError({
        error: new RequestValidationError('id', "Missing or invalid path parameter"),
      }));
    }

    // Look up project by id
    const project = await db.getProject(projectId);

    // Validate project exists with this id
    if (project === undefined) {
      return notFoundResponse(new ApiError({
        error: new GenericError(ErrorId.Project_Get_NoProjectExistsWithId, `No project exists with id: ${projectId}`),
      }));
    }

    Logger.log("Successfully looked up project with id:", projectId);

    return okResponse(project.toDto());
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
