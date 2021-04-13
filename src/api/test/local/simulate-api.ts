import { APIGatewayProxyEventV2, APIGatewayProxyHandlerV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import express, { Request, RequestHandler, Response, Router } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import getMockContext from '@test/local/util/get-mock-context';
import getMockProxyRequest from '@test/local/util/get-mock-proxy-request';

import Logger, { LogLevel } from '@app/util/Logger';
// Project
import { handler as CreateProjectHandler } from '@app/handlers/project/create';
import { handler as DeleteProjectHandler } from '@app/handlers/project/delete';
import { handler as GetProjectHandler } from '@app/handlers/project/get';
import { handler as GetAllProjectsHandler } from '@app/handlers/project/get-all';
import { handler as SaveProjectHandler } from '@app/handlers/project/save';
// Task
import { handler as CreateTaskHandler } from '@app/handlers/task/create';
import { handler as DeleteTaskHandler } from '@app/handlers/task/delete';
import { handler as GetTaskHandler } from '@app/handlers/task/get';
import { handler as GetAllTasksHandler } from '@app/handlers/task/get-all';
import { handler as SaveTaskHandler } from '@app/handlers/task/save';
// DEBUG
import { handler as SeedMockDataHandler } from '@app/handlers/seed-mock-data';

// EXPRESS APP
const app = express();

// Configure middleware
app.use(bodyParser.text({
  type: ['*/*'],
}));
app.use(cors());

const SERVER_PORT: number = Number(process.env['PORT'] || 8000);
app.listen(SERVER_PORT, () => {
  Logger.log(`Server listening on http://localhost:${SERVER_PORT}`);
});


// ROUTES
// These need to match the definitions in `terraform/modules/api/api-gateway.tf`
const router = Router();
// Project
router.post('/project', proxyHandler(CreateProjectHandler));
router.delete('/project/:id', proxyHandler(DeleteProjectHandler));
router.get('/project/:id', proxyHandler(GetProjectHandler));
router.get('/project', proxyHandler(GetAllProjectsHandler));
router.put('/project/:id', proxyHandler(SaveProjectHandler));
// Task
router.post('/project/:projectId/task', proxyHandler(CreateTaskHandler));
router.delete('/project/:projectId/task/:id', proxyHandler(DeleteTaskHandler));
router.get('/project/:projectId/task/:id', proxyHandler(GetTaskHandler));
router.get('/project/:projectId/task', proxyHandler(GetAllTasksHandler));
router.put('/project/:projectId/task/:id', proxyHandler(SaveTaskHandler));
// Debug
router.post('/debug/seed-mock-data', proxyHandler(SeedMockDataHandler));

app.use('/api', router);


// FUNCTIONS
/**
 * Create a request handler from an API Gateway handler function
 * @param handler The API Gateway handler function to call
 */
function proxyHandler(handler: APIGatewayProxyHandlerV2): RequestHandler {
  return async (req, res) => {
    // 1. Convert express request to API Gateway proxy request
    const event = convertRequestToApiGatewayPayload(req);
    // 2. Handle request
    const response: APIGatewayProxyStructuredResultV2 = await handler(event, getMockContext(), () => { }) as APIGatewayProxyStructuredResultV2;
    // 3. Convert API Gateway proxy response to express response (and send)
    return convertApiGatewayResultToResponse(response, res);
  };
}

/**
 * Convert an Express `Request` object into an API Gateway proxy event (v2)
 * @param req Express request to convert
 */
function convertRequestToApiGatewayPayload(req: Request): APIGatewayProxyEventV2 {
  return getMockProxyRequest({
    path: req.path,
    body: req.body as (string | undefined),
    queryParams: req.query as Record<string, string>,
    headers: req.headers as Record<string, string>,
    httpMethod: req.method,
    pathParams: req.params as Record<string, string>,
  });
}

/**
 * Convert the result of an API Gateway proxy handler function into an Express response.
 * @NOTE: The response is sent immediately.
 * @param result API Gateway proxy response
 * @param res Express Response object, to send the response in
 */
function convertApiGatewayResultToResponse(result: APIGatewayProxyStructuredResultV2, res: Response): Response {
  // Set status code
  if (result.statusCode) {
    res.statusCode = result.statusCode;
  }

  // Set cookies
  // @TODO - just log them for now to see what values these are
  if (result.cookies) {
    result.cookies.forEach((cookie) => {
      Logger.log(LogLevel.debug, "Cookie: ", cookie);
    });
  }

  // Set Headers
  if (result.headers) {
    Object.keys(result.headers).forEach((header) => {
      res.setHeader(header, `${result.headers![header]}`);
    });
  }

  // @NOTE `event.isBase64Encoded` is not handled. Not entirely sure on what needs to be set in the response
  //   to flag this. Probably update `Content-Encoding` ?

  // Set body
  if (result.body) {
    return res.send(result.body);
  } else {
    return res.send();
  }
}
