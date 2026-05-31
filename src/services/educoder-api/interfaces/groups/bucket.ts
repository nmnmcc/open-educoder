import { Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup } from "effect/unstable/httpapi";

const StringValue = Schema.String;

/*
Sample: GET /api/buckets/get_attachment_token.json
{ "status": 0, "message": "success", "data": "<encrypted-upload-token>" }
*/
const AttachmentTokenResponse = Schema.Struct({
  status: Schema.Int,
  message: Schema.String,
  data: Schema.String,
});

export const Bucket = HttpApiGroup.make("Bucket").add(
  HttpApiEndpoint.get("getAttachmentToken", "/api/buckets/get_attachment_token.json", {
    query: {
      zzud: StringValue,
    },
    success: AttachmentTokenResponse,
  }),
);
