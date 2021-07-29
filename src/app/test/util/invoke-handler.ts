import { CloudFrontFunctionHandler, CloudFrontFunctionEvent, CloudFrontFunctionRequest } from "/src/util/cloudfront-types";

export function invokeHandler(
  handler: CloudFrontFunctionHandler,
  requestOverrides?: Partial<CloudFrontFunctionEvent['request']>,
  contextOverrides?: Partial<CloudFrontFunctionEvent['context']>,
): CloudFrontFunctionRequest {
  return handler({
    version: '1.0',
    context: getMockHandlerContext(contextOverrides),
    viewer: {
      "ip": "124.157.112.236",
    },
    request: getMockHandlerRequest(requestOverrides),
  });
}

export function getMockHandlerContext(overrides: Partial<CloudFrontFunctionEvent['context']> = {}): CloudFrontFunctionEvent['context'] {
  return Object.assign({}, {
    "distributionDomainName": "d2adh1lf9lnz7d.cloudfront.net",
    "distributionId": "E2THG9B2BK28LF",
    "eventType": "viewer-request",
    "requestId": "z3gdMn-Nr2GteRwQL9jA-ZZfPJmmYHRCvSW3kORnLaNN2mcWUfdWJw==",
  }, overrides);
}

export function getMockHandlerRequest(overrides: Partial<CloudFrontFunctionEvent['request']> = {}): CloudFrontFunctionEvent['request'] {
  return Object.assign({}, {
    "method": "GET",
    "uri": "/about/",
    "querystring": {},
    "headers": {
      "user-agent": {
        "value": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:90.0) Gecko/20100101 Firefox/90.0",
      },
      "if-none-match": {
        "value": "W/\"07631210394f1787f2f1e320f91bc8c5\"",
      },
      "cache-control": {
        "value": "max-age=0",
      },
      "te": {
        "value": "trailers",
      },
      "host": {
        "value": "todo.myproject.com",
      },
      "accept": {
        "value": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      },
      "upgrade-insecure-requests": {
        "value": "1",
      },
      "sec-fetch-site": {
        "value": "none",
      },
      "if-modified-since": {
        "value": "Wed, 14 Apr 2021 01:18:38 GMT",
      },
      "accept-language": {
        "value": "en-US,en;q=0.5",
      },
      "sec-fetch-dest": {
        "value": "document",
      },
      "accept-encoding": {
        "value": "gzip, deflate, br",
      },
      "sec-fetch-user": {
        "value": "?1",
      },
      "sec-fetch-mode": {
        "value": "navigate",
      },
    },
    "cookies": {},
  }, overrides);
}
