import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { action } from "mobx";
import { navigate } from "gatsby";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  XSquare as CancelIcon,
  PlusSquare as CreateIcon,
} from 'react-feather';

import { useStores } from "@app/stores";
import Spinner from "@app/components/spinner";
import Project from "@app/models/Project";
import AutoSizeTextarea from "@app/components/auto-size-textarea";
import classNames from "classnames";

const IndexPage: FunctionComponent = observer(() => {
  const { TodoStore } = useStores();

  useEffect(action(() => {
    void TodoStore.ensureProjectsLoaded();
  }), []);

  // State
  const [currentEditedProject, setCurrentEditedProject] = useState<Project | undefined>(undefined);
  const [tempProjectName, setTempProjectName] = useState<string>("");
  const [newProjectName, setNewProjectName] = useState<string>("");

  // Functions
  const onAttemptToNavigate = (e: React.MouseEvent<HTMLTableRowElement, MouseEvent>, project: Project): void => {
    if (e.target instanceof HTMLTableCellElement && !project.isBeingCreated) {
      void navigate(`/project?id=${project.id}`);
    }
  };
  const onBeginEditingProject = (project: Project): void => {
    setCurrentEditedProject(project);
    setTempProjectName(project.name);
  };
  const onCancelEditingProject = (): void => {
    setCurrentEditedProject(undefined);
    setTempProjectName("");
  };
  const onSaveEditingProject = (): void => {
    if (currentEditedProject === undefined) throw new Error("Attempted to save while no project was being edited");

    currentEditedProject.name = tempProjectName;
    void TodoStore.saveProject(currentEditedProject);
    setCurrentEditedProject(undefined);
    setTempProjectName("");
  };
  const onRequestDeleteProject = (project: Project): void => {
    if (confirm(`Are you sure you wish to delete the following Project?\n\n"${project.name}"`)) {
      void TodoStore.deleteProject(project);
    }
  };
  const onCreateNewProject = (): void => {
    if (newProjectName.trim() !== '') {
      void TodoStore.createProject(newProjectName);
      setNewProjectName("");
    }
  };

  return (
    <section className="section">
      <h1 className="is-size-2">All projects</h1>

      <p>Click a project to view its tasks.</p>

      {TodoStore.HasLoaded && (
        <table className="table project-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Project</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {TodoStore.Projects.map((project, index) => (
              <tr key={project.id}
                className={classNames("project-table__row", {
                  'is-loading': project.isBeingCreated,
                  'is-clickable': !project.isBeingCreated,
                })}
                onClick={(e) => onAttemptToNavigate(e, project)}
              >
                <td>{index + 1}</td>

                {/* Name */}
                <td>
                  {/* Not editing this project */}
                  {currentEditedProject?.id !== project.id && (
                    project.name
                  )}

                  {/* Editing this project */}
                  {currentEditedProject?.id === project.id && (
                    <AutoSizeTextarea
                      className="textarea"
                      minRows={1}
                      onChange={(e) => setTempProjectName(e.target.value)}
                      value={tempProjectName}
                    />
                  )}
                </td>

                {/* Controls */}
                <td className="project-table__edit-column">
                  {project.isBeingCreated && (
                    <Spinner />
                  )}

                  {!project.isBeingCreated && (
                    <>
                      {currentEditedProject === undefined && (
                        // Not editing any projects
                        <>
                          <button className="button is-warning" onClick={action(() => onBeginEditingProject(project))}><EditIcon className="mr-2" /> Edit</button>
                          <button className="button is-danger" onClick={action(() => onRequestDeleteProject(project))}><DeleteIcon className="mr-2" /> Delete</button>
                        </>
                      )}

                      {currentEditedProject !== undefined && (
                        currentEditedProject.id === project.id ? (
                          // Editing this project
                          <>
                            <button className="button is-success" onClick={action(() => onSaveEditingProject())}><SaveIcon className="mr-2" /> Save</button>
                            <button className="button is-warning" onClick={action(() => onCancelEditingProject())}><CancelIcon className="mr-2" /> Cancel</button>
                          </>
                        ) : (
                          // Editing another project
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
              <td>
                <AutoSizeTextarea
                  className="textarea"
                  minRows={1}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  value={newProjectName}
                />
              </td>
              <td>
                <button className="button is-primary" onClick={action(() => onCreateNewProject())}><CreateIcon className="mr-2" /> Add new</button>
              </td>
            </tr>
          </tbody>
        </table>
      )}

      {!TodoStore.HasLoaded && (
        <div className="has-text-centered is-flex is-align-items-center is-justify-content-center mt-4">
          Loading&hellip; <Spinner />
        </div>
      )}
    </section>
  );
}) as FunctionComponent;

export default IndexPage;
