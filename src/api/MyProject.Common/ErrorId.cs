namespace MyProject.Common;

/// <summary>
/// A unique identifier for each error that the application can produce, for
/// dependent services to write code that can detect these errors.
/// </summary>
public enum ErrorId
{
    // @NOTE Suggested format: [Subject]_[Situation]_[Problem]
    // @NOTE Renaming: You cannot rename these without first checking that dependent
    //  code e.g. the frontend client isn't also updated + any logging / metrics / alerts.
    //  Ideally you would just never rename these.

    // Project
    Project_Get_NoProjectExistsWithId,
    Project_Delete_NoProjectExistsWithId,
    Project_Save_NoProjectExistsWithId,

    // Task
    Task_Get_NoProjectExistsWithId,
    Task_Get_NoTaskExistsWithId,
    Task_Create_NoProjectExistsWithId,
    Task_Save_NoProjectExistsWithId,
    Task_Save_NoTaskExistsWithId,
    Task_Delete_NoProjectExistsWithId,
    Task_Delete_NoTaskExistsWithId,
}
