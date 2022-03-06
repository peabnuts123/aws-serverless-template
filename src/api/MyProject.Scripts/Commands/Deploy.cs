using MyProject.Scripts.Utils;
using System.Diagnostics;
using Amazon.Lambda;
using Amazon;
using System.IO.Compression;

namespace MyProject.Scripts.Commands;

public class Deploy : ICommand
{
    private string environmentId;
    private TerraformConfig terraform;

    public Deploy(IEnumerable<string> args)
    {
        if (args.Count() == 0)
        {
            Console.Error.WriteLine($"Missing environment name");
            PrintUsage();
            Environment.Exit(1);
        }
        else
        {
            string environmentName = args.ElementAt(0);

            if (environmentName.Equals("local", StringComparison.InvariantCultureIgnoreCase))
            {
                Console.Error.WriteLine("Cannot deploy to local environment - API does not run in localstack. Just run it locally instead (e.g. 'dotnet run')");
                Environment.Exit(1);
            }
            else
            {
                this.environmentId = environmentName;
                terraform = new TerraformConfig(environmentName);
            }
        }
    }

    public void PrintUsage()
    {
        Console.Error.WriteLine($"Usage: {Util.GetProgramInvocation()} deploy [environmentName]");
    }

    public async Task Run()
    {
        // Read from terraform config
        string? awsRegion = terraform.Config["aws_region:value"];
        string? lambdaFunctionName = terraform.Config["lambda_function:value:name"];

        // Validation
        if (string.IsNullOrEmpty(awsRegion))
        {
            throw new Exception($"Missing `aws_region.value` from terraform output for environment '{environmentId}' (has terraform been run?)");
        }
        else if (string.IsNullOrEmpty(lambdaFunctionName))
        {
            throw new Exception($"Missing `lambda_function.value.name` from terraform output for environment '{environmentId}' (has terraform been run?)");
        }

        // Empty output directory
        // Absurdly, .NET will not empty the files from here
        //  so we can easily get into scenarios where we publish problematic files
        Directory.Delete(Util.GetWebPublishOutputRoot(), recursive: true);

        // Run `dotnet publish`
        await BuildDotnetProject();

        string buildPublishRoot = Util.GetWebPublishOutputRoot();
        using (var zipFile = CreateZipFile(buildPublishRoot))
        {
            // Release docker container to lambda function
            await DeployLambdaFunction(awsRegion, lambdaFunctionName, zipFile);
        }

        Console.WriteLine("Successfully finished processing.");
    }

    private MemoryStream CreateZipFile(string buildPublishRoot)
    {
        string[] files = Directory.GetFiles(
            buildPublishRoot,
            "*",
            SearchOption.AllDirectories
        );

        Console.WriteLine("Zipping contents of build output...");
        var ms = new MemoryStream();
        using (var zip = new ZipArchive(ms, ZipArchiveMode.Create, leaveOpen: true))
        {
            foreach (string file in files)
            {
                string fileRelativePath = Path.GetRelativePath(buildPublishRoot, file);
                zip.CreateEntryFromFile(file, fileRelativePath);
                Console.WriteLine($"Added: {fileRelativePath}");
            }
        }
        return ms;
    }

    private Task BuildDotnetProject()
    {
        return Task.Run(() =>
        {
            Console.WriteLine($"Building project '{Util.GetWebCsprojName()}'...");
            using (Process process = new Process())
            {
                process.StartInfo = new ProcessStartInfo("dotnet", "publish --configuration Release")
                {
                    WorkingDirectory = Util.GetWebCsprojRoot(),
                };
                process.StartInfo.EnvironmentVariables["ENVIRONMENT_ID"] = environmentId;

                process.Start();
                process.WaitForExit();

                if (process.ExitCode != 0)
                {
                    Console.Error.WriteLine("Failed to build project.");
                    Environment.Exit(1);
                }
            }
        });
    }

    private async Task DeployLambdaFunction(string awsRegion, string lambdaFunctionName, MemoryStream zipFile)
    {
        Console.WriteLine($"Deploying code to Lambda function '{lambdaFunctionName}'...");

        var lambdaClient = new AmazonLambdaClient(region: RegionEndpoint.GetBySystemName(awsRegion));
        await lambdaClient.UpdateFunctionCodeAsync(new Amazon.Lambda.Model.UpdateFunctionCodeRequest
        {
            FunctionName = lambdaFunctionName,
            ZipFile = zipFile,
        });

        Console.WriteLine("Finished updating lambda function.");
    }
}