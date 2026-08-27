import { apiRequest } from "./api";
import type { Envelope, EstimateItem, Measurement } from "./types";

export interface DemoSummary {
  slug: string;
  name: string;
  description: string;
  project_type: string | null;
  location: string | null;
}

export interface DemoDetail {
  slug: string;
  name: string;
  description: string;
  project_type: string | null;
  location: string | null;
  plan: { original_filename: string; status: string } | null;
  analysis: {
    status: string;
    confidence_score: number | null;
    measurements: Measurement[];
  } | null;
  estimate: {
    status: string;
    items: EstimateItem[];
    certified: false;
    warning: string;
  } | null;
  report: { status: string; download_url: string | null } | null;
}

export const demoService = {
  async list(): Promise<DemoSummary[]> {
    const res = await apiRequest<Envelope<DemoSummary[]>>("/demos");
    return res.data;
  },

  async get(slug: string): Promise<DemoDetail> {
    const res = await apiRequest<Envelope<DemoDetail>>(`/demos/${slug}`);
    return res.data;
  },
};
