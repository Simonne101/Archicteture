import { apiRequest } from "./api";
import type { Envelope, ProjectInput } from "./types";

export const projectInputService = {
  async get(projectId: string): Promise<ProjectInput> {
    const res = await apiRequest<Envelope<ProjectInput>>(`/projects/${projectId}/input`);
    return res.data;
  },

  async save(projectId: string, section: Partial<ProjectInput>): Promise<ProjectInput> {
    const res = await apiRequest<Envelope<ProjectInput>>(`/projects/${projectId}/input`, {
      method: "PUT",
      body: JSON.stringify(section),
    });
    return res.data;
  },
};
