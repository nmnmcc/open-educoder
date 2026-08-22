import type { Effect } from "effect";
import type { HttpApiEndpoint, HttpApiGroup } from "effect/unstable/httpapi";

import type { Interfaces } from "../educoder-api/interfaces/index.js";

export type FeatureResult<Raw, View> = {
  readonly raw: Raw;
  readonly view: View;
};

type EducoderApiGroups = (typeof Interfaces.groups)[keyof typeof Interfaces.groups];
type EducoderApiGroupIdentifier = HttpApiGroup.Identifier<EducoderApiGroups>;
type EducoderApiGroup<GroupIdentifier extends EducoderApiGroupIdentifier> = HttpApiGroup.WithIdentifier<
  EducoderApiGroups,
  GroupIdentifier
>;
type EducoderApiEndpoint<GroupIdentifier extends EducoderApiGroupIdentifier> = HttpApiGroup.Endpoints<
  EducoderApiGroup<GroupIdentifier>
>;

export type EducoderApiResponse<
  GroupIdentifier extends EducoderApiGroupIdentifier,
  EndpointIdentifier extends HttpApiEndpoint.Identifier<EducoderApiEndpoint<GroupIdentifier>>,
> = HttpApiEndpoint.SuccessWithIdentifier<EducoderApiEndpoint<GroupIdentifier>, EndpointIdentifier>;

export type FeatureWorkflow<Input, Raw, View, Error = unknown> = (
  input: Input,
) => Effect.Effect<FeatureResult<Raw, View>, Error>;

export type FeatureWorkflowWithoutInput<Raw, View, Error = unknown> = () => Effect.Effect<
  FeatureResult<Raw, View>,
  Error
>;
