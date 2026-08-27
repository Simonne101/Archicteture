import { apiRequest } from "./api";
import type { Envelope, Report } from "./types";

export const reportService = {
  async create(estimateId: string): Promise<Report> {
    const res = await apiRequest<Envelope<Report>>(`/estimates/${estimateId}/reports`, {
      method: "POST",
    });
    return res.data;
  },

  async get(reportId: string): Promise<Report> {
    const res = await apiRequest<Envelope<Report>>(`/reports/${reportId}`);
    return res.data;
  },
};
