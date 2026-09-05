import type { ArtifactPath } from "@deep-spec-analysis/kernel-domain";
import type { FormalModelIdentifier } from "@deep-spec-analysis/requirements-domain";

export interface VerifyRequirementsSatisfiabilityModuloTheoriesInput {
  readonly modelId: FormalModelIdentifier;
  readonly verifyDirectory: ArtifactPath;
}
