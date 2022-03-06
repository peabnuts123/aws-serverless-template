using System.Text.Json.Serialization;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DataModel;
using Amazon.Runtime;
using Microsoft.AspNetCore.Mvc;
using MyProject.Business.Services;
using MyProject.Config;
using MyProject.Data;
using MyProject.Web;
using Serilog;


var builder = WebApplication.CreateBuilder(args);

InitLogging(builder);
InitConfig(builder);
InitServices(builder);

var app = builder.Build();

ConfigureApp(app);

Log.Information("Project Id: {Id}", Configuration.ProjectId);
Log.Information("Environment Id: {Id}", Configuration.EnvironmentId);
Log.Information("Environment description: {Description}", Configuration.Get<string>("EnvironmentDescription"));

app.Run();

void InitLogging(WebApplicationBuilder builder)
{
    Log.Logger = new LoggerConfiguration()
        .ReadFrom.Configuration(Configuration.Base)
        .Enrich.FromLogContext()
        .WriteTo.Console()
        .CreateLogger();

    builder.Host.UseSerilog();
}

void InitConfig(WebApplicationBuilder builder)
{
    // Validate config
    string[] requiredConfigValues = new string[] {
        /* Put config options that are required here */
    };
    foreach (string requiredConfig in requiredConfigValues)
    {
        Configuration.Base.GetRequiredSection(requiredConfig);
    }

    // Setup config
    builder.Environment.EnvironmentName = Configuration.EnvironmentId;
    builder.Configuration.AddConfiguration(Configuration.Base);
}

void InitServices(WebApplicationBuilder builder)
{
    builder.Services.AddControllers();
    builder.Services.Configure<JsonOptions>((options) =>
    {
        // Strip nulls from payload
        // @TODO This might be annoying later? e.g. if we WANT null returned
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
        // Serialize enums as strings instead of integers
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });
    builder.Services.Configure<ApiBehaviorOptions>((options) =>
    {
        // Customise automatic validation error response payload
        options.InvalidModelStateResponseFactory = (ActionContext context) =>
        {
            // @NOTE: Small bug I can't be bothered fixing.
            // If a parameter with the wrong TYPE is passed to the API - this returns kind of a weird response.
            // Ordinarily, say, when a field marked as [Required] is not passed, this will return a dictionary
            //  with e.g. keys `name`, `description` etc. and messages like "Field must be a non-empty string".
            //  These are then mapped to validation errors and the `field` property is set to the key - nice and expected.
            // In the scenario where the request includes the property but it is the wrong TYPE then the ModelState
            //  dictionary contains IMO strange data. The name of the parameter from the controller's action (e.g. `dto`) is
            //  included as a key itself, with a message like "The dto field is required", and the names of the properties
            //  all become `$.___` e.g. `$.name` instead of `name`.
            // This returns a bit of an odd response saying that a field called `dto` is required, and serves validation
            //  error messages with `field` set to odd names like `$.description`.
            // I can't figure out how to detect this scenario in a sane way. We should not be serving an validation error
            //  about the controller's action parameter, and the names should match the fields. I don't know why
            //  this scenario yields a totally different data in the ModelState dictionary anyway.

            // Map validation errors to RequestValidationError models
            List<ErrorModel> validationErrors = context.ModelState
                .Where((entry) => entry.Value!.Errors.Count > 0)
                .SelectMany((entry) =>
                    entry.Value!.Errors.Select((error) =>
                        new RequestValidationError(field: entry.Key, message: error.ErrorMessage) as ErrorModel
                    )
                )
                .ToList();

            return new ValidationErrorResult(validationErrors);
        };
    });

    // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen();

    // Database
    builder.Services.AddScoped(typeof(DynamoDBRepository<,>));

    // Services
    builder.Services.AddScoped<ProjectService>();
    builder.Services.AddScoped<TaskService>();

    // DynamoDB
    builder.Services.AddSingleton<AmazonDynamoDBClient>((services) =>
    {
        var config = new AmazonDynamoDBConfig();
        string? localStackEndpoint = Configuration.Base.GetValue<string?>("LocalStackEndpoint");
        if (localStackEndpoint != null)
        {
            Log.Warning($"Using LocalStack: {localStackEndpoint}");
            config.ServiceURL = localStackEndpoint;
            return new AmazonDynamoDBClient(
                new BasicAWSCredentials("localstack", "localstack"),
                config
            );
        }
        else
        {
            return new AmazonDynamoDBClient(config);
        }

    });
    builder.Services.AddScoped<DynamoDBContext>((services) =>
    {
        var client = services.GetRequiredService<AmazonDynamoDBClient>();
        var config = new DynamoDBContextConfig
        {
            TableNamePrefix = $"{Configuration.ProjectId}_{Configuration.EnvironmentId}_",
        };

        // @NOTE always override table name to "local" when using Localstack
        if (Configuration.Get<string?>("LocalStackEndpoint") != null)
        {
            config.TableNamePrefix = $"{Configuration.ProjectId}_local_";
        }

        Log.Information($"DynamoDB table name prefix: {config.TableNamePrefix}");

        return new DynamoDBContext(client, config);
    });

    // Store data protection keys in AWS
    if (Configuration.Get<bool>("PersistDataProtectionKeysToSSM"))
    {
        builder.Services.AddDataProtection()
            .PersistKeysToAWSSystemsManager(Configuration.AWS_PARAMETER_STORE_DATA_PROTECTION_PATH);
    }

    builder.Services.AddAWSLambdaHosting(LambdaEventSource.HttpApi);
}

void ConfigureApp(WebApplication app)
{
    if (Configuration.Get<bool>("EnableDeveloperExceptionPage"))
    {
        app.UseDeveloperExceptionPage();
    }
    if (Configuration.Get<bool>("EnableDebugCors"))
    {
        app.UseCors(builder =>
        {
            builder.AllowAnyOrigin()
                    .AllowAnyMethod()
                    .AllowAnyHeader();
        });
    }
    if (Configuration.Get<bool>("EnableSwagger"))
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }

    // Capabilities
    app.UseSerilogRequestLogging();

    // app.UseRouting();
    app.MapControllers();
}
