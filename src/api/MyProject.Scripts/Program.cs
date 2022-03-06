using MyProject.Scripts.Commands;
using MyProject.Scripts.Utils;

if (args.Length == 0)
{
    Console.Error.WriteLine("Missing command name.");
    Console.Error.WriteLine($"Usage: {Util.GetProgramInvocation()} [command] (...arguments)");
    Environment.Exit(1);
}
else
{
    Command? command = GetCommand(args.First());
    var commandArgs = args.Skip(1).ToList();

    switch (command)
    {
        case Command.deploy:
            await new Deploy(commandArgs).Run();
            break;
        case Command.debug:
            await new Debug().Run();
            break;
        default:
            Console.WriteLine($"Unrecognised command: {command}");
            Console.WriteLine($"Must be one of: {string.Join(", ", Enum.GetNames<Command>())}");
            Console.WriteLine($"Usage: {Util.GetProgramInvocation()} [command] (...arguments)");
            Environment.Exit(1);
            break;
    }
}

Command? GetCommand(string arg)
{
    Command command;
    var success = Enum.TryParse(arg, true, out command);
    if (success)
    {
        return command;
    }
    else
    {
        return null;
    }
}

enum Command
{
    deploy,
    debug,
}