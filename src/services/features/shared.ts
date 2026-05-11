import { Buffer } from "node:buffer";
import { Data, Effect } from "effect";
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

export class FeatureInputError extends Data.TaggedError("FeatureInputError")<{
  readonly message: string;
}> {}

export type JsonRecord = Record<string, unknown>;

export type CurrentUser = {
  readonly login: string;
  readonly userId: number;
};

export const decodeBase64 = (value: string) => Buffer.from(value, "base64").toString("utf8");

export const formatLabels = (labels: ReadonlyArray<string>) => labels.join(", ");

export const formatOperation = (operation: ReadonlyArray<unknown> | undefined) => {
  const action = operation?.[0];
  const path = operation?.[1];
  const resumed = operation?.[2];

  return {
    action: typeof action === "string" ? action : null,
    path: typeof path === "string" ? path : null,
    resumed: typeof resumed === "boolean" ? resumed : null,
  };
};

export const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const asRecord = (value: unknown): JsonRecord | null => (isRecord(value) ? value : null);

export const asArray = (value: unknown): ReadonlyArray<unknown> => (Array.isArray(value) ? value : []);

export const stringField = (record: JsonRecord | null, key: string) => {
  const value = record?.[key];

  return typeof value === "string" ? value : null;
};

export const numberField = (record: JsonRecord | null, key: string) => {
  const value = record?.[key];

  return typeof value === "number" ? value : null;
};

export const booleanField = (record: JsonRecord | null, key: string) => {
  const value = record?.[key];

  return typeof value === "boolean" ? value : null;
};

export const failInput = (message: string) => Effect.fail(new FeatureInputError({ message }));
