import type { DesignModelIdentifier } from "@deep-spec-analysis/design-domain";
import type { ArtifactPath } from "@deep-spec-analysis/kernel-domain";

export interface VerifyDesignInput {
  readonly modelId: DesignModelIdentifier;
  readonly verifyDirectory: ArtifactPath;
}
