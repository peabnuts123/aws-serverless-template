import { Link, navigate } from "gatsby";
import React, { FunctionComponent, useEffect, useState } from "react";
import { action } from "mobx";
import { observer } from "mobx-react-lite";
import {
  ArrowLeftCircle as BackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  XSquare as CancelIcon,
  PlusSquare as CreateIcon,
} from 'react-feather';

import { useStores } from "@app/stores";
import Logger from "@app/util/Logger";
import Spinner from "@app/components/spinner";
import Task from "@app/models/Task";
import AutoSizeTextarea from "@app/components/auto-size-textarea";
import classNames from "classnames";

interface Props {
  location: Location;
}

const ProjectPage = observer(((props) => {
  const { TodoStore } = useStores();

  useEffect(() => {
    if (!TodoStore.HasLoaded) {
      void TodoStore.refreshAllProjects();
    }
  });

  return (
    <section className="section">
      {/* Back button */}
      <Link to="/" className="button is-info" role="button"><BackIcon className="mr-2" /> Return to project list</Link>

      {/* Page content */}
      {TodoStore.HasLoaded && (
        <ProjectPageContent {...props} />
      )}

      {/* "Loading..." */}
      {!TodoStore.HasLoaded && (
        <ProjectPageLoading />
      )}
    </section>
  );
}) as FunctionComponent<Props>);

const ProjectPageContent = observer((({ location }) => {
  const { TodoStore } = useStores();

  // Get ID from URL
  const url = new URL(location.href);
  const projectId = url.searchParams.get('id');
  if (projectId === null) {
    Logger.logWarning("No `id` param supplied");
    return navigate('/');
  }
  // Get Project from ID
  const project = TodoStore.getProjectById(projectId);
  if (project === undefined) {
    Logger.logWarning(`No project exists with id: ${projectId}`);
    return navigate('/');
  }

  // State
  const [currentEditedTask, setCurrentEditedTask] = useState<Task | undefined>(undefined);
  const [tempTaskDescription, setTempTaskDescription] = useState<string>("");
  const [newTaskDescription, setNewTaskDescription] = useState<string>("");

  // Functions
  const onTaskIsDoneChange = (task: Task, isDone: boolean): void => {
    task.isDone = isDone;
    void TodoStore.saveTask(project, task);
  };
  const onBeginEditingTask = (task: Task): void => {
    setCurrentEditedTask(task);
    setTempTaskDescription(task.description);
  };
  const onCancelEditingTask = (): void => {
    setCurrentEditedTask(undefined);
    setTempTaskDescription("");
  };
  const onSaveEditingTask = (): void => {
    if (currentEditedTask === undefined) throw new Error("Attempted to save while no task was being edited");

    currentEditedTask.description = tempTaskDescription;
    void TodoStore.saveTask(project, currentEditedTask);
    setCurrentEditedTask(undefined);
    setTempTaskDescription("");
  };
  const onRequestDeleteTask = (task: Task): void => {
    if (confirm(`Are you sure you wish to delete the following task?\n\n"${task.description}"`)) {
      void TodoStore.deleteTask(project, task);
    }
  };
  const onCreateNewTask = (): void => {
    if (newTaskDescription.trim() !== '') {
      void TodoStore.createTask(project, newTaskDescription);
      setNewTaskDescription("");
    }
  };

  return (
    <div>
      <h1 className="is-size-2 mb-3">{project.name}</h1>

      <table className="table project-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Task</th>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {project.tasks.map((task, index) => (
            <tr key={task.id}
              className={classNames("project-table__row", {
                'is-loading': task.isBeingCreated,
                'is-done': task.isDone,
              })
              }
            >
              <td>{index + 1}</td>

              {/* Description */}
              <td>
                {/* Not editing this task */}
                {currentEditedTask?.id !== task.id && (
                  task.description
                )}

                {/* Editing this task */}
                {currentEditedTask?.id === task.id && (
                  <AutoSizeTextarea
                    className="textarea"
                    minRows={1}
                    onChange={(e) => setTempTaskDescription(e.target.value)}
                    value={tempTaskDescription}
                  />
                )}
              </td>

              {/* IsDone */}
              <td>
                {currentEditedTask !== undefined || task.isBeingCreated ? (
                  // Editing any task or task is loading
                  <input type="checkbox" checked={task.isDone} disabled={true} />
                ) : (
                  // Not editing any tasks and task is not loading
                  <input type="checkbox" checked={task.isDone} onChange={action((e) => onTaskIsDoneChange(task, e.target.checked))} />
                )}
              </td>

              {/* Controls */}
              <td className="project-table__edit-column">
                {task.isBeingCreated && (
                  <Spinner />
                )}

                {!task.isBeingCreated && (
                  <>
                    {/* Not editing any tasks */}
                    {currentEditedTask === undefined && (
                      <>
                        <button className="button is-warning" onClick={action(() => onBeginEditingTask(task))}><EditIcon className="mr-2" /> Edit</button>
                        <button className="button is-danger" onClick={action(() => onRequestDeleteTask(task))}><DeleteIcon className="mr-2" /> Delete</button>
                      </>
                    )}

                    {currentEditedTask !== undefined && (
                      currentEditedTask.id === task.id ? (
                        // Editing this task
                        <>
                          <button className="button is-success" onClick={action(() => onSaveEditingTask())}><SaveIcon className="mr-2" /> Save</button>
                          <button className="button is-warning" onClick={action(() => onCancelEditingTask())}><CancelIcon className="mr-2" /> Cancel</button>
                        </>
                      ) : (
                        // Editing another task
                        <>
                          &nbsp;
                        </>
                      )
                    )}
                  </>
                )}
              </td>
            </tr>
          ))}
          <tr>
            <td></td>
            <td colSpan={2}>
              <AutoSizeTextarea
                className="textarea"
                minRows={1}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                value={newTaskDescription}
              />
            </td>
            <td>
              <button className="button is-primary" onClick={action(() => onCreateNewTask())}><CreateIcon className="mr-2" /> Add new</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}) as FunctionComponent<Props>);

const ProjectPageLoading = observer(() => {
  return (
    <div className="has-text-centered is-flex is-align-items-center is-justify-content-center mt-4">
      Loading&hellip; <Spinner />
    </div>
  );
});

export default ProjectPage;
