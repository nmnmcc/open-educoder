import { Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup } from "effect/unstable/httpapi";

const NonEmptyString = Schema.String.pipe(Schema.check(Schema.isMinLength(1)));

const ShixunRequestParams = {
  shixunId: NonEmptyString,
};

/*
Sample: GET /api/shixuns/3kwcsf5q/shixun_exec.json
{
  "game_identifier": "fa7sroyvzhcq"
}
*/
const ShixunExecResponse = Schema.Struct({
  game_identifier: NonEmptyString,
});

export const Shixun = HttpApiGroup.make("Shixun").add(
  HttpApiEndpoint.get("exec", "/api/shixuns/:shixunId/shixun_exec.json", {
    params: ShixunRequestParams,
    query: {
      homework_common_id: NonEmptyString,
      zzud: NonEmptyString,
    },
    success: ShixunExecResponse,
  }),
);
