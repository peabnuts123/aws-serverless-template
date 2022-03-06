using System.Reflection;

namespace MyProject.Scripts.Utils;

public static class Util
{
    public static string GetProgramInvocation()
    {
        return $"dotnet run --project {GetProjectName()}";
    }

    public static string GetProjectName()
    {
        return Assembly.GetExecutingAssembly().GetName().Name!;
    }

    public static string GetCsprojRoot()
    {
        // THERE'S GOT TO BE A BETTER WAY! *looks at camera* :/
        return AppContext.BaseDirectory.Substring(0, AppContext.BaseDirectory.LastIndexOf($"{Path.DirectorySeparatorChar}bin"));
    }

    public static string GetSlnRoot()
    {
        return Path.GetFullPath("..", GetCsprojRoot());
    }

    public static string GetWebCsprojName()
    {
        // THERE'S GOT TO BE A BETTER WAY! *looks at camera* :/
        return Assembly.GetAssembly(typeof(MyProject.Web.ApiError))?.GetName().Name!;
    }

    public static string GetWebCsprojRoot()
    {
        // THERE'S GOT TO BE A BETTER WAY! *looks at camera* :/
        return Path.GetFullPath(Path.Combine("..", GetWebCsprojName()), GetCsprojRoot());
    }

    public static string GetWebPublishOutputRoot()
    {
        return Path.Combine(GetWebCsprojRoot(), "bin", "Release", "net6.0", "publish");
    }
}