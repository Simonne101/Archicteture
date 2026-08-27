export interface Envelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedData<T> {
  data: T[];
  links: { first: string | null; last: string | null; prev: string | null; next: string | null };
  meta: { current_page: number; last_page: number; per_page: number; total: number };
}

export type ProjectStatus = "draft" | "active" | "completed" | "archived";

export interface Project {
  id: string;
  organization_id: string;
  organization_name: string | null;
  created_by: { id: number; name: string } | null;
  name: string;
  description: string | null;
  project_type: string | null;
  location: string | null;
  country_code: string | null;
  currency: string;
  status: ProjectStatus;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export type PlanStatus = "ready" | "processing" | "analyzed" | "failed";

export interface Plan {
  id: string;
  project_id: string;
  uploaded_by: { id: number; name: string } | null;
  original_filename: string;
  mime_type: string;
  file_size: number;
  status: PlanStatus;
  page_count: number | null;
  created_at: string;
}

export type AnalysisStatus = "queued" | "processing" | "completed" | "needs_review" | "failed";

export interface Measurement {
  id: string;
  category: "room" | "wall" | "opening" | "level" | "area" | "structure";
  label: string | null;
  length: number | null;
  width: number | null;
  height: number | null;
  surface: number | null;
  thickness: number | null;
  volume: number | null;
  unit: string;
  source: "ai" | "user";
  confidence: number | null;
}

export interface PlanAnalysis {
  id: string;
  plan_id: string;
  status: AnalysisStatus;
  provider: string;
  model: string | null;
  confidence_score: number | null;
  calculation_version: string;
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
  measurements: Measurement[];
  reviewed_at: string | null;
  confirmed_at: string | null;
  is_confirmed: boolean;
  created_at: string;
}

export type EstimateStatus = "processing" | "completed" | "failed";

export interface AvailableDisplayUnit {
  unit: string;
  label: string;
  quantity: number;
  verified: boolean;
}

export interface EstimateItem {
  id: string;
  material_code: string | null;
  description: string;
  quantity: number;
  unit: string;
  quantity_base: number | null;
  base_unit: string | null;
  calculation_method: string | null;
  assumptions: Record<string, string> | null;
  available_display_units: AvailableDisplayUnit[];
}

export interface Estimate {
  id: string;
  project_id: string;
  plan_id: string;
  analysis_id: string;
  status: EstimateStatus;
  country_code: string | null;
  calculation_version: string;
  error_message: string | null;
  items: EstimateItem[];
  certified: false;
  warning: string;
  created_at: string;
}

export type ReportStatus = "processing" | "completed" | "failed";

export interface Report {
  id: string;
  estimate_id: string;
  status: ReportStatus;
  file_size: number | null;
  download_url: string | null;
  error_message: string | null;
  created_at: string;
}

export interface ProjectInput {
  id: string | null;
  project_id: string;
  dimensions: {
    land_length?: number;
    land_width?: number;
    building_length?: number;
    building_width?: number;
    approximate_surface?: number;
  };
  structure: {
    levels?: number;
    ceiling_height?: number;
    foundation_type?: string;
    slab_type?: string;
    roof_type?: string;
  };
  foundations: {
    footing_type?: string;
    depth?: number;
    width?: number;
    length?: number;
  };
  walls: {
    thickness?: number;
    height?: number;
    block_type?: string;
  };
  openings: {
    door_count?: number;
    doors?: { width: number; height: number }[];
    window_count?: number;
    windows?: { width: number; height: number }[];
  };
  reinforced_concrete: {
    columns?: { count: number; section?: string }[];
    beams?: { count: number; section?: string }[];
    slabs?: { thickness: number }[];
    rebar_diameter_mm?: number;
  };
  roofing: {
    type?: string;
    surface?: number;
    pitch?: number;
    covering?: string;
  };
  materials: { material_code: string }[];
  notes: string | null;
  can_estimate: boolean;
  missing_fields: string[];
  updated_at: string | null;
}

export interface Country {
  code: string;
  name: string;
  currency_code: string;
}

export interface Meta {
  construction_types: string[];
  supported_plan_formats: string[];
  max_upload_size_kb: number;
  countries: Country[];
}
