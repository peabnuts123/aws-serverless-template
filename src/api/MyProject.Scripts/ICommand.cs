namespace MyProject.Scripts;

public interface ICommand
{
    Task Run();
    void PrintUsage();
}