const Endpoints = {
  Project: {
    create: (): string => `/api/project`,
    delete: (id: string): string => `/api/project/${id}`,
    getById: (id: string): string => `/api/project/${id}`,
    getAll: (): string => `/api/project`,
    save: (id: string): string => `/api/project/${id}`,
  },
  Task: {
    create: (projectId: string): string => `/api/project/${projectId}/task`,
    delete: (projectId: string, id: string): string => `/api/project/${projectId}/task/${id}`,
    getById: (projectId: string, id: string): string => `/api/project/${projectId}/task/${id}`,
    getAll: (projectId: string): string => `/api/project/${projectId}/task`,
    save: (projectId: string, id: string): string => `/api/project/${projectId}/task/${id}`,
  },
};

export default Endpoints;
