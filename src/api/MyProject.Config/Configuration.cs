using Microsoft.Extensions.Configuration;
using Serilog;

namespace MyProject.Config;
public static class Configuration
{
    /// <summary>
    /// Path to read config from in AWS Parameter Store (when available)
    /// </summary>
    public static readonly string AWS_PARAMETER_STORE_CONFIGURATION_PATH = $"/{ProjectId}/{EnvironmentId}/API/Configuration";
    /// <summary>
    /// Path to read/write data-protection data from in AWS Parameter Store (when available)
    /// </summary>
    public static readonly string AWS_PARAMETER_STORE_DATA_PROTECTION_PATH = $"/{ProjectId}/{EnvironmentId}/API/DataProtection";

    private static IConfiguration? _Base;

    /// <summary>
    /// Setup base config for application
    /// </summary>
    public static IConfiguration Base
    {
        get
        {
            if (_Base == null)
            {
                // Create general-purpose configuration
                var config = new ConfigurationBuilder()
                    .SetBasePath(Directory.GetCurrentDirectory())
                    // Read non-sensitive configuration
                    .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                    // Override base configuration with environment specific config
                    .AddJsonFile($"appsettings.{EnvironmentId}.json", optional: true, reloadOnChange: true)
                    // Read secrets (not in source control), mostly used for debugging locally
                    .AddJsonFile($"_secrets.{EnvironmentId}.json", optional: true, reloadOnChange: true)
                    // Override previous configuration with environment variables
                    .AddEnvironmentVariables();


                // Read config from AWS parameter store
                // @NOTE cheekily build the configuration object momentarily to check this value
                if (config.Build().GetValue<bool>("ReadConfigFromSSMParameterStore"))
                {
                    config.AddSystemsManager(configureSource =>
                    {
                        configureSource.Path = AWS_PARAMETER_STORE_CONFIGURATION_PATH;
                        // Log errors if can't read from parameter store
                        configureSource.OnLoadException += exceptionContext =>
                        {
                            Log.Error(exceptionContext.Exception, "Error loading configuration from Parameter Store.");
                        };
                    });
                }

                _Base = config.Build();
            }

            return _Base;
        }
    }

    public static T Get<T>(string key)
    {
        return Base.GetValue<T>(key);
    }

    public static string ProjectId
    {
        get
        {
            string? projectId = Environment.GetEnvironmentVariable("PROJECT_ID");
            if (string.IsNullOrEmpty(projectId))
            {
                throw new Exception("No PROJECT_ID environment variable specified.");
            }
            else
            {
                return projectId;
            }
        }
    }

    public static string EnvironmentId
    {
        get
        {
            string? environmentId = Environment.GetEnvironmentVariable("ENVIRONMENT_ID");
            if (string.IsNullOrEmpty(environmentId))
            {
                throw new Exception("No ENVIRONMENT_ID environment variable specified.");
            }
            else
            {
                return environmentId;
            }
        }
    }
}
