import { Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup } from "effect/unstable/httpapi";

const StringValue = Schema.String;

const ShixunRequestParams = {
  shixunId: StringValue,
};

/*
Sample: GET /api/shixuns/3kwcsf5q/shixun_exec.json
{
  "game_identifier": "fa7sroyvzhcq"
}
*/
const ShixunExecResponse = Schema.Struct({
  game_identifier: StringValue,
});

export const Shixun = HttpApiGroup.make("Shixun").add(
  HttpApiEndpoint.get("exec", "/api/shixuns/:shixunId/shixun_exec.json", {
    params: ShixunRequestParams,
    query: {
      homework_common_id: StringValue,
      zzud: StringValue,
    },
    success: ShixunExecResponse,
  }),
);
