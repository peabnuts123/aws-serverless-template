import { CloudFrontOrigin } from "aws-lambda";

// @NOTE custom types because it looks like the types in `aws-lambda` are not 100% correct

type ValueMap<T> = Record<string, { value: T }>;

export interface CloudFrontFunctionContext {
  distributionDomainName: string;
  distributionId: string;
  eventType: string;
  requestId: string;
}

export interface CloudFrontFunctionRequest {
  body?: {
    action: 'read-only' | 'replace';
    data: string;
    encoding: 'base64' | 'text';
    readonly inputTruncated: boolean;
  };
  readonly clientIp?: string;
  readonly method: string;
  uri: string;
  querystring: ValueMap<string>;
  headers: ValueMap<string>;
  origin?: CloudFrontOrigin;
  cookies: Record<string, unknown>; // @TODO
}

export interface CloudFrontFunctionEvent {
  version: string;
  context: CloudFrontFunctionContext;
  viewer: Record<string, string>; // @TODO
  request: CloudFrontFunctionRequest;
}

export type CloudFrontFunctionHandler = (event: CloudFrontFunctionEvent) => CloudFrontFunctionRequest;
