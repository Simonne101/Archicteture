import { apiRequest } from "./api";
import type { Envelope, Meta } from "./types";

let cached: Promise<Meta> | null = null;

export const metaService = {
  get(): Promise<Meta> {
    cached ??= apiRequest<Envelope<Meta>>("/meta").then((res) => res.data);
    return cached;
  },
};
