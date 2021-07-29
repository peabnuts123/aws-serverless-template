import { CloudFrontFunctionHandler } from '../../util/cloudfront-types';
import Logger, { LogLevel } from '/src/util/Logger';

interface RewriteRule {
  test: (uri: string) => boolean,
  result: (uri: string) => string,
}

// Rules for matching and rewriting requests
const rewriteRules: RewriteRule[] = [
  // Rewrite requests to `/project/*` to dynamic "project" route
  {
    test: (uri) => /^\/project\/.+/.test(uri),
    result: () => '/project/[projectId]/index.html',
  },
];

const handler: CloudFrontFunctionHandler = (event) => {
  const { request } = event;
  const { uri } = request;

  Logger.log("Handling request:", uri);

  // Apply first matching rewrite rule (if any)
  for (let i = 0; i < rewriteRules.length; i++) {
    const rule = rewriteRules[i];
    if (rule.test(uri)) {
      request.uri = rule.result(uri);
      Logger.log(LogLevel.debug, `Matched rewrite rule [${i}]. Rewrote rule to: ${request.uri}`);
      break;
    }
  }

  Logger.log("Result: ", request.uri);

  return request;
};

export default handler;
