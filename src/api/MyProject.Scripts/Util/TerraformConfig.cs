using System.Diagnostics;
using Microsoft.Extensions.Configuration;

namespace MyProject.Scripts.Utils;

public class TerraformConfig
{
    public IConfiguration Config { get; set; }

    public TerraformConfig(string environmentName)
    {
        var config = new ConfigurationBuilder();

        string terraformEnvironmentDirectory = Path.Combine(Util.GetCsprojRoot(), "..", "..", "..", "terraform", "environments", $"{environmentName}");
        if (!Directory.Exists(terraformEnvironmentDirectory))
        {
            Console.Error.WriteLine($"No terraform environment named '{environmentName}'");
            Environment.Exit(1);
        }

        using (Process process = new Process())
        {
            process.StartInfo = new ProcessStartInfo("terraform", "output --json")
            {
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                WorkingDirectory = terraformEnvironmentDirectory,
            };

            process.Start();
            process.WaitForExit();

            if (process.ExitCode != 0)
            {
                Console.Error.WriteLine("Failed to read terraform output");
                Console.Error.WriteLine(process.StandardError.ReadToEnd());
                Environment.Exit(1);
            }

            config.AddJsonStream(process.StandardOutput.BaseStream);
        }

        Config = config.Build();
    }
}