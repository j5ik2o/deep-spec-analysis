import type { ReleaseCatalog } from "@deep-spec-analysis/doctor-domain";
export interface ReleaseTagsClient {
  list(): Promise<ReleaseCatalog>;
}
