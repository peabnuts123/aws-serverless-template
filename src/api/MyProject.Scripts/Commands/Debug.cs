namespace MyProject.Scripts.Commands;

public class Debug : ICommand
{

    public Debug()
    {
    }

    public void PrintUsage()
    {
        Console.Error.WriteLine("This is just a test command for debugging");
    }

    public async Task Run()
    {
        Console.WriteLine("Henlo (:");

        await Task.CompletedTask;
    }
}