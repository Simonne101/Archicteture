import { apiRequest } from "./api";
import type { Envelope, Estimate } from "./types";

export const estimateService = {
  async create(projectId: string, analysisId: string): Promise<Estimate> {
    const res = await apiRequest<Envelope<Estimate>>(`/projects/${projectId}/estimates`, {
      method: "POST",
      body: JSON.stringify({ analysis_id: analysisId }),
    });
    return res.data;
  },

  async get(estimateId: string): Promise<Estimate> {
    const res = await apiRequest<Envelope<Estimate>>(`/estimates/${estimateId}`);
    return res.data;
  },
};
