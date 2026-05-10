import type { Schema } from "effect";

export type Version<F extends Version<any> = Version<any>, S extends Schema.Codec<any, any> = Schema.Codec<any, any>> =
  | {
      readonly from?: undefined;
      readonly schema: S;
      readonly init: S["Type"];
    }
  | {
      readonly from: F;
      readonly schema: S;
      readonly migrate: (previous: F["schema"]["Type"]) => S["Type"];
    };

export const defineVersion = <
  F extends Version<any> = Version<any>,
  S extends Schema.Codec<any, any> = Schema.Codec<any, any>,
>(
  version: Version<F, S>,
) => version;
