import type { InstallationProvenance } from "@deep-spec-analysis/doctor-domain";
export interface InstallationProvenanceClient {
  read(): InstallationProvenance;
}
