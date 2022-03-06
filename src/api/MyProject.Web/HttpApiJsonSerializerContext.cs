
using System.Text.Json.Serialization;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using Amazon.Lambda.Serialization.SystemTextJson;

// For increasing performance with Lamdba deserialisation
// From: https://aws.amazon.com/blogs/compute/introducing-the-net-6-runtime-for-aws-lambda/

[assembly: LambdaSerializer(typeof(SourceGeneratorLambdaJsonSerializer<MyProject.Web.HttpApiJsonSerializerContext>))]

namespace MyProject.Web;

[JsonSerializable(typeof(APIGatewayHttpApiV2ProxyRequest))]
[JsonSerializable(typeof(APIGatewayHttpApiV2ProxyResponse))]
public partial class HttpApiJsonSerializerContext : JsonSerializerContext
{
}
