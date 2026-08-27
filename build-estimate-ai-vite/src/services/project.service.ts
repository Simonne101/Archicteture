import { apiRequest } from "./api";
import type { Envelope, PaginatedData, Project } from "./types";

export interface CreateProjectPayload {
  name: string;
  description?: string;
  project_type?: string;
  location?: string;
  country_code: string;
  currency?: string;
}

export const projectService = {
  async list(): Promise<Project[]> {
    const res = await apiRequest<Envelope<PaginatedData<Project>>>("/projects?per_page=50");
    return res.data.data;
  },

  async create(payload: CreateProjectPayload): Promise<Project> {
    const res = await apiRequest<Envelope<Project>>("/projects", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async get(projectId: string): Promise<Project> {
    const res = await apiRequest<Envelope<Project>>(`/projects/${projectId}`);
    return res.data;
  },

  async update(projectId: string, payload: Record<string, unknown>): Promise<Project> {
    const res = await apiRequest<Envelope<Project>>(`/projects/${projectId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return res.data;
  },
};
