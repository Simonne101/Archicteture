import { apiRequest } from "./api";
import type { Envelope, Measurement, PlanAnalysis } from "./types";

export const analysisService = {
  async start(planId: string): Promise<PlanAnalysis> {
    const res = await apiRequest<Envelope<PlanAnalysis>>(`/plans/${planId}/analyze`, {
      method: "POST",
    });
    return res.data;
  },

  /** Skips the plan upload entirely — derives a confirmed analysis directly from the technical form. */
  async startFromProjectInput(projectId: string): Promise<PlanAnalysis> {
    const res = await apiRequest<Envelope<PlanAnalysis>>(`/projects/${projectId}/input/analyze`, {
      method: "POST",
    });
    return res.data;
  },

  async get(analysisId: string): Promise<PlanAnalysis> {
    const res = await apiRequest<Envelope<PlanAnalysis>>(`/analyses/${analysisId}`);
    return res.data;
  },

  async confirm(analysisId: string): Promise<PlanAnalysis> {
    const res = await apiRequest<Envelope<PlanAnalysis>>(`/analyses/${analysisId}/confirm`, {
      method: "POST",
    });
    return res.data;
  },

  async updateMeasurement(
    analysisId: string,
    measurementId: string,
    payload: Partial<Pick<Measurement, "label" | "length" | "width" | "height" | "surface" | "thickness" | "volume" | "unit">>,
  ): Promise<Measurement> {
    const res = await apiRequest<Envelope<Measurement>>(
      `/analyses/${analysisId}/measurements/${measurementId}`,
      { method: "PATCH", body: JSON.stringify(payload) },
    );
    return res.data;
  },
};
