import type { ArtifactPath } from "@deep-spec-analysis/kernel-domain";
import type { FormalModelIdentifier } from "@deep-spec-analysis/requirements-domain";

export interface VerifyRequirementsQuintInput {
  readonly modelId: FormalModelIdentifier;
  readonly verifyDirectory: ArtifactPath;
}
