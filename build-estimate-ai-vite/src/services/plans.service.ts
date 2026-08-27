import { apiRequest } from "./api";
import type { Envelope, PaginatedData, Plan } from "./types";

export const plansService = {
  async list(projectId: string): Promise<Plan[]> {
    const res = await apiRequest<Envelope<PaginatedData<Plan>>>(`/projects/${projectId}/plans`);
    return res.data.data;
  },

  async upload(projectId: string, file: File): Promise<Plan> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await apiRequest<Envelope<Plan>>(`/projects/${projectId}/plans`, {
      method: "POST",
      body: formData,
    });
    return res.data;
  },

  async get(planId: string): Promise<Plan> {
    const res = await apiRequest<Envelope<Plan>>(`/plans/${planId}`);
    return res.data;
  },
};
