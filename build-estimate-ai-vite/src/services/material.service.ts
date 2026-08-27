import { apiRequest } from "./api";
import type { Envelope } from "./types";

export interface Material {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  default_price: number;
  currency: string;
  active: boolean;
}

let cached: Promise<Material[]> | null = null;

export const materialService = {
  list(): Promise<Material[]> {
    cached ??= apiRequest<Envelope<Material[]>>("/materials").then((res) => res.data);
    return cached;
  },
};
