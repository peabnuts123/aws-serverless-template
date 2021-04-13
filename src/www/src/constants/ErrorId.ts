enum ErrorId {
  // Project
  Project_Get_NoProjectExistsWithId = 'Project_Get_NoProjectExistsWithId',
  Project_Delete_NoProjectExistsWithId = 'Project_Delete_NoProjectExistsWithId',
  Project_Save_NoProjectExistsWithId = 'Project_Save_NoProjectExistsWithId',

  // Task
  Task_Get_NoProjectExistsWithId = 'Task_Get_NoProjectExistsWithId',
  Task_Get_NoTaskExistsWithId = 'Task_Get_NoTaskExistsWithId',
  Task_Create_NoProjectExistsWithId = 'Task_Create_NoProjectExistsWithId',
  Task_Save_NoProjectExistsWithId = 'Task_Save_NoProjectExistsWithId',
  Task_Save_NoTaskExistsWithId = 'Task_Save_NoTaskExistsWithId',
  Task_Delete_NoProjectExistsWithId = 'Task_Delete_NoProjectExistsWithId',
  Task_Delete_NoTaskExistsWithId = 'Task_Delete_NoTaskExistsWithId',
}

export default ErrorId;
