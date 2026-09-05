import type { ManifestEntry } from "@deep-spec-analysis/doctor-domain";

export interface HarnessFileClient {
  isInstalled(entry: ManifestEntry): boolean;
}
