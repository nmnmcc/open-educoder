import type { Effect } from "effect";
import type { HttpApi, HttpApiEndpoint, HttpApiGroup } from "effect/unstable/httpapi";

import type { Interfaces } from "../educoder-api/interfaces/index.js";

export type FeatureResult<Raw, View> = {
  readonly raw: Raw;
  readonly view: View;
};

type EducoderApiGroups = typeof Interfaces extends HttpApi.HttpApi<string, infer Groups> ? Groups : never;
type EducoderApiGroupName = HttpApiGroup.Name<EducoderApiGroups>;
type EducoderApiGroup<GroupName extends EducoderApiGroupName> = HttpApiGroup.WithName<EducoderApiGroups, GroupName>;
type EducoderApiEndpoint<GroupName extends EducoderApiGroupName> = HttpApiGroup.Endpoints<EducoderApiGroup<GroupName>>;

export type EducoderApiResponse<
  GroupName extends EducoderApiGroupName,
  EndpointName extends HttpApiEndpoint.Name<EducoderApiEndpoint<GroupName>>,
> = HttpApiEndpoint.Success<HttpApiEndpoint.WithName<EducoderApiEndpoint<GroupName>, EndpointName>>["Type"];

export type FeatureWorkflow<Input, Raw, View, Error = unknown> = (
  input: Input,
) => Effect.Effect<FeatureResult<Raw, View>, Error>;

export type FeatureWorkflowWithoutInput<Raw, View, Error = unknown> = () => Effect.Effect<
  FeatureResult<Raw, View>,
  Error
>;
