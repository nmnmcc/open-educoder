import { Buffer } from "node:buffer";
import { createDecipheriv, createHash, createHmac, randomUUID } from "node:crypto";
import path from "node:path";

import { Context, Effect, FileSystem, Layer } from "effect";
import { HttpBody, HttpClient, HttpClientResponse } from "effect/unstable/http";

import { AppContext } from "../../context/index.js";
import { EducoderApi } from "../../educoder-api/index.js";
import { type EducoderApiResponse, type FeatureWorkflow } from "../shared.js";
import {
  AssignmentInputError,
  type AssignmentSortBy,
  type AssignmentSortDirection,
  AssignmentTypeCode,
  failInput,
  formatLabels,
} from "./shared.js";

const resolveCategoryId = (homeworkId: string, categoryId?: string | undefined) => categoryId ?? homeworkId;
const AttachmentTokenKey = "bf3c199c2470cb477d907b1e0917c17b";
const AttachmentTokenIv = "5183666c72eec9e4";
const OssUserAgent = "aliyun-sdk-js/6.18.1 open-educoder";
const AttachmentPartSize = 1_002_400;

type AssignmentAttachmentRaw =
  | ReadonlyArray<{
      readonly id?: number | null | undefined;
      readonly title?: string | null | undefined;
      readonly filesize?: string | null | undefined;
      readonly is_pdf?: boolean | null | undefined;
      readonly file_type?: string | null | undefined;
      readonly url?: string | null | undefined;
      readonly file_sub?: string | null | undefined;
      readonly is_edit?: boolean | null | undefined;
      readonly download_url?: string | null | undefined;
    }>
  | null
  | undefined;

type AttachmentUploadToken = {
  readonly access_key_id: string;
  readonly access_key_secret: string;
  readonly end_point: string;
  readonly security_token: string;
  readonly bucket: string;
  readonly region: string;
  readonly callback_url: string;
  readonly bucket_host: string;
};

type AttachmentUploadRaw = {
  readonly status: number;
  readonly message: string;
  readonly url: string;
  readonly id: string;
  readonly content_type: string;
  readonly filename: string;
  readonly saved_file_path: string;
};

type OssQueryEntry = readonly [key: string, value?: string | undefined];

type UploadedPart = {
  readonly partNumber: number;
  readonly etag: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const readStringField = (record: Record<string, unknown>, field: string) => {
  const value = record[field];

  if (typeof value !== "string") {
    throw new Error(`Expected ${field} to be a string.`);
  }

  return value;
};

const readNumberField = (record: Record<string, unknown>, field: string) => {
  const value = record[field];

  if (typeof value !== "number") {
    throw new Error(`Expected ${field} to be a number.`);
  }

  return value;
};

const parseAttachmentUploadToken = (value: unknown): AttachmentUploadToken => {
  if (!isRecord(value)) {
    throw new Error("Expected decrypted upload token to be an object.");
  }

  return {
    access_key_id: readStringField(value, "access_key_id"),
    access_key_secret: readStringField(value, "access_key_secret"),
    end_point: readStringField(value, "end_point"),
    security_token: readStringField(value, "security_token"),
    bucket: readStringField(value, "bucket"),
    region: readStringField(value, "region"),
    callback_url: readStringField(value, "callback_url"),
    bucket_host: readStringField(value, "bucket_host"),
  };
};

const decryptAttachmentToken = (encrypted: string) =>
  Effect.try({
    try: () => {
      const decipher = createDecipheriv(
        "aes-256-cbc",
        Buffer.from(AttachmentTokenKey, "utf8"),
        Buffer.from(AttachmentTokenIv, "utf8"),
      );
      const plaintext = Buffer.concat([decipher.update(Buffer.from(encrypted, "base64")), decipher.final()]).toString(
        "utf8",
      );

      return parseAttachmentUploadToken(JSON.parse(plaintext));
    },
    catch: (error) =>
      new AssignmentInputError({
        message: `Failed to decrypt attachment upload token: ${error instanceof Error ? error.message : String(error)}`,
      }),
  });

const makeDiskDirectory = (date = new Date()) =>
  `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}`;

const makeObjectKey = (fileName: string, diskDirectory: string) =>
  `${diskDirectory}/${randomUUID()}${path.extname(fileName)}`;

const encodeObjectKey = (objectKey: string) => objectKey.split("/").map(encodeURIComponent).join("/");

const makeEndpointUrl = (token: AttachmentUploadToken) => {
  const endpoint = token.end_point.startsWith("http") ? token.end_point : `https://${token.end_point}`;
  const url = new URL(endpoint);

  url.hostname = `${token.bucket}.${url.hostname}`;

  return url;
};

const makeOssUrl = (token: AttachmentUploadToken, objectKey: string, query: ReadonlyArray<OssQueryEntry>) => {
  const url = makeEndpointUrl(token);

  url.pathname = `/${encodeObjectKey(objectKey)}`;
  for (const [key, value] of query) {
    url.searchParams.append(key, value ?? "");
  }

  return url.toString();
};

const makeCanonicalSubresource = (query: ReadonlyArray<OssQueryEntry>) => {
  if (query.length === 0) {
    return "";
  }

  const params = [...query]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => (value === undefined ? key : `${key}=${value}`))
    .join("&");

  return `?${params}`;
};

const normalizeHeaderValue = (value: string) => value.replace(/\s+/g, " ").trim();

const makeCanonicalOssHeaders = (headers: Readonly<Record<string, string>>) =>
  Object.entries(headers)
    .filter(([key]) => key.toLowerCase().startsWith("x-oss-"))
    .map(([key, value]) => [key.toLowerCase(), normalizeHeaderValue(value)] as const)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}:${value}`)
    .join("\n");

const makeOssAuthorization = (input: {
  readonly token: AttachmentUploadToken;
  readonly method: string;
  readonly objectKey: string;
  readonly query: ReadonlyArray<OssQueryEntry>;
  readonly date: string;
  readonly contentType: string;
  readonly contentMd5?: string | undefined;
  readonly xHeaders: Readonly<Record<string, string>>;
}) => {
  const canonicalHeaders = makeCanonicalOssHeaders(input.xHeaders);
  const canonicalResource = `/${input.token.bucket}/${input.objectKey}${makeCanonicalSubresource(input.query)}`;
  const canonicalString = [
    input.method,
    input.contentMd5 ?? "",
    input.contentType,
    input.date,
    canonicalHeaders === "" ? canonicalResource : `${canonicalHeaders}\n${canonicalResource}`,
  ].join("\n");
  const signature = createHmac("sha1", input.token.access_key_secret).update(canonicalString).digest("base64");

  return `OSS ${input.token.access_key_id}:${signature}`;
};

const makeOssHeaders = (input: {
  readonly token: AttachmentUploadToken;
  readonly method: string;
  readonly objectKey: string;
  readonly query: ReadonlyArray<OssQueryEntry>;
  readonly contentType: string;
  readonly contentMd5?: string | undefined;
  readonly extraXHeaders?: Readonly<Record<string, string>> | undefined;
}) => {
  const date = new Date().toUTCString();
  const xHeaders = {
    "x-oss-date": date,
    "x-oss-security-token": input.token.security_token,
    "x-oss-user-agent": OssUserAgent,
    ...(input.extraXHeaders ?? {}),
  };
  const authorization = makeOssAuthorization({
    token: input.token,
    method: input.method,
    objectKey: input.objectKey,
    query: input.query,
    date,
    contentType: input.contentType,
    contentMd5: input.contentMd5,
    xHeaders,
  });
  const headers: Record<string, string> = {
    Accept: "*/*",
    Date: date,
    ...xHeaders,
    Authorization: authorization,
  };

  if (input.contentType !== "") {
    headers["Content-Type"] = input.contentType;
  }

  if (input.contentMd5 !== undefined) {
    headers["Content-MD5"] = input.contentMd5;
  }

  return headers;
};

const makeMimeType = (fileName: string) => {
  switch (path.extname(fileName).toLowerCase()) {
    case ".doc":
      return "application/msword";
    case ".docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case ".pdf":
      return "application/pdf";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".txt":
      return "text/plain";
    case ".zip":
      return "application/zip";
    default:
      return "application/octet-stream";
  }
};

const encodeQuery = (params: Readonly<Record<string, string | number | boolean | null | undefined>>) =>
  Object.entries(params)
    .filter((entry): entry is [string, string | number | boolean] => entry[1] != null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join("&");

const base64Json = (value: unknown) => Buffer.from(JSON.stringify(value), "utf8").toString("base64");

const makeCallbackHeaders = (input: {
  readonly token: AttachmentUploadToken;
  readonly login: string;
  readonly fileName: string;
  readonly diskDirectory: string;
}) => {
  const callbackBody = [
    "bucket=${bucket}&object=${object}&etag=${etag}&size=${size}&mimeType=${mimeType}&my_var=${x:my_var}",
    encodeQuery({
      container_type: "Attachment",
      login: input.login,
      description: "",
      realFileName: false,
      file_name: input.fileName,
      disk_directory: input.diskDirectory,
    }),
  ].join("&");

  return {
    "x-oss-callback": base64Json({
      callbackUrl: input.token.callback_url,
      callbackBody,
      callbackHost: input.token.bucket_host,
    }),
    "x-oss-callback-var": base64Json({
      "x:id": input.fileName,
    }),
  };
};

const parseUploadId = (xml: string) =>
  Effect.try({
    try: () => {
      const match = /<UploadId>([^<]+)<\/UploadId>/.exec(xml);
      const uploadId = match?.[1];

      if (uploadId === undefined || uploadId.length === 0) {
        throw new Error("UploadId is missing.");
      }

      return uploadId;
    },
    catch: (error) =>
      new AssignmentInputError({
        message: `Failed to read OSS multipart upload id: ${error instanceof Error ? error.message : String(error)}`,
      }),
  });

const redactOssErrorBody = (text: string) =>
  text
    .replace(/(x-oss-security-token:)[^\n<]+/gi, "$1<redacted>")
    .replace(/(<StringToSignBytes>)[^<]+(<\/StringToSignBytes>)/gi, "$1<redacted>$2")
    .slice(0, 4_000);

const readResponseText = (response: HttpClientResponse.HttpClientResponse) =>
  response.text.pipe(
    Effect.flatMap((text) =>
      response.status >= 200 && response.status < 300
        ? Effect.succeed(text)
        : Effect.fail(
            new AssignmentInputError({
              message: `OSS request failed: ${response.status} ${response.request.method} ${response.request.url}\n${redactOssErrorBody(text)}`,
            }),
          ),
    ),
  );

const readResponseHeader = (response: HttpClientResponse.HttpClientResponse, header: string) =>
  response.headers[header.toLowerCase()] ?? response.headers[header];

const escapeXml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

const makeCompleteMultipartXml = (parts: ReadonlyArray<UploadedPart>) =>
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    "<CompleteMultipartUpload>",
    ...parts.map(
      (part) => `<Part><PartNumber>${part.partNumber}</PartNumber><ETag>${escapeXml(part.etag)}</ETag></Part>`,
    ),
    "</CompleteMultipartUpload>",
  ].join("");

const parseAttachmentUploadResponse = (text: string) =>
  Effect.try({
    try: () => {
      const value = JSON.parse(text);

      if (!isRecord(value)) {
        throw new Error("Expected attachment callback response to be an object.");
      }

      return {
        status: readNumberField(value, "status"),
        message: readStringField(value, "message"),
        url: readStringField(value, "url"),
        id: readStringField(value, "id"),
        content_type: readStringField(value, "content_type"),
        filename: readStringField(value, "filename"),
        saved_file_path: readStringField(value, "saved_file_path"),
      } satisfies AttachmentUploadRaw;
    },
    catch: (error) =>
      new AssignmentInputError({
        message: `Failed to decode attachment upload response: ${
          error instanceof Error ? error.message : String(error)
        }`,
      }),
  });

const splitFileParts = (bytes: Uint8Array) => {
  const parts: Array<Uint8Array> = [];

  for (let offset = 0; offset < bytes.length; offset += AttachmentPartSize) {
    parts.push(bytes.slice(offset, offset + AttachmentPartSize));
  }

  return parts;
};

type HomeworkCommonsRaw = EducoderApiResponse<"Course", "homeworkCommons">;
type CommonHomeworkInfoRaw = EducoderApiResponse<"HomeworkCommon", "info">;
type CommonHomeworkWorksRaw = EducoderApiResponse<"HomeworkCommon", "worksList">;
type CommonHomeworkDraftRaw = EducoderApiResponse<"HomeworkCommon", "studentWorkNew">;
type CommonHomeworkMembersRaw = EducoderApiResponse<"HomeworkCommon", "searchMemberList">;
type CommonHomeworkCommentsRaw = EducoderApiResponse<"HomeworkCommon", "showComment">;
type CommonHomeworkSettingsRaw = EducoderApiResponse<"HomeworkCommon", "settings">;
type CommonHomeworkRedoLogsRaw = EducoderApiResponse<"HomeworkCommon", "redoLogs">;
type SubmitStudentWorkResponseRaw = EducoderApiResponse<"HomeworkCommon", "submitStudentWork">;
type StudentWorkDetailRaw = EducoderApiResponse<"StudentWork", "info">;
type StudentWorkSupplyAttachmentsRaw = EducoderApiResponse<"StudentWork", "supplyAttachments">;
type StudentWorkCommentsRaw = EducoderApiResponse<"StudentWork", "commentList">;

type CommonHomeworkSubmitRaw = {
  readonly attachments: ReadonlyArray<AttachmentUploadRaw>;
  readonly submit: SubmitStudentWorkResponseRaw;
};
type CommonHomeworkAttachmentUploadRaw = {
  readonly attachments: ReadonlyArray<AttachmentUploadRaw>;
};

type CommonHomeworkBaseRaw = {
  readonly course_id: number;
  readonly course_name: string;
  readonly is_end: boolean;
  readonly course_end_date?: string | null | undefined;
  readonly category: {
    readonly category_id: number;
    readonly category_name: string;
    readonly main: number;
  };
  readonly homework_status: ReadonlyArray<string>;
  readonly time_status: number;
  readonly open_evaluate?: boolean | null | undefined;
  readonly homework_name: string;
  readonly homework_id: number;
  readonly homework_type: string;
};

const formatBaseAssignment = (value: CommonHomeworkBaseRaw) => {
  return {
    id: value.homework_id,
    name: value.homework_name,
    type: value.homework_type,
    course: {
      id: value.course_id,
      name: value.course_name,
      ended: value.is_end,
      endDate: value.course_end_date ?? null,
    },
    category: {
      id: value.category.category_id,
      name: value.category.category_name,
      main: value.category.main,
    },
    status: formatLabels(value.homework_status),
    timeStatus: value.time_status,
    openEvaluate: value.open_evaluate ?? null,
  };
};

const formatAttachments = (value: AssignmentAttachmentRaw) =>
  Object.fromEntries(
    (value ?? []).map((attachment, index) => {
      const id = attachment.id ?? index + 1;

      return [
        id,
        {
          title: attachment.title ?? null,
          size: attachment.filesize ?? null,
          type: attachment.file_type ?? null,
          subtype: attachment.file_sub ?? null,
          pdf: attachment.is_pdf ?? null,
          editable: attachment.is_edit ?? null,
          url: attachment.download_url ?? attachment.url ?? null,
        },
      ];
    }),
  );

const formatInfoResponse = (value: CommonHomeworkInfoRaw) => {
  return {
    assignment: {
      ...formatBaseAssignment(value),
      workId: value.work_id ?? null,
      workStatus: value.work_statuses == null ? null : formatLabels(value.work_statuses),
      canSubmit: value.can_submit ?? null,
      answerPublic: value.answer_public ?? null,
      viewAnswer: value.view_answer ?? null,
      description: value.description ?? null,
      submit: {
        size: value.submit_size ?? null,
        limit: value.submit_limit ?? null,
        limitNum: value.submit_limit_num ?? null,
        mustFile: value.must_file ?? null,
      },
      attachments: formatAttachments(value.attachments),
    },
  };
};

const formatWorksResponse = (value: CommonHomeworkWorksRaw) => {
  return {
    assignment: formatBaseAssignment(value),
    work: {
      id: value.work_id ?? value.id ?? null,
      status: value.work_status ?? null,
      updateTime: value.update_time ?? null,
      scores: {
        work: value.work_score ?? null,
        final: value.final_score ?? null,
        teacher: value.teacher_score ?? null,
        student: value.student_score ?? null,
        assistant: value.teaching_asistant_score ?? null,
        groupLeader: value.group_leader_score ?? null,
      },
      submit: {
        canSubmit: value.can_submit ?? null,
        submitNum: value.submit_num ?? null,
        submitCount: value.submit_count ?? null,
        redoCount: value.redo_count ?? null,
        size: value.submit_size ?? null,
        commitCount: value.commit_count ?? null,
        uncommitCount: value.uncommit_count ?? null,
        leftTime:
          value.left_time == null
            ? null
            : {
                status: value.left_time.status,
                time: value.left_time.time,
              },
      },
      user: {
        login: value.user_login ?? null,
        name: value.user_name ?? null,
        studentId: value.student_id ?? null,
        group: value.group_name ?? null,
      },
      taCommentCount: value.ta_comment_count ?? null,
      groupData: value.group_data ?? null,
      studentWorksCount: null,
    },
  };
};

const formatUploadedAttachment = (value: AttachmentUploadRaw) => ({
  id: value.id,
  filename: value.filename,
  contentType: value.content_type,
  url: value.url,
  savedFilePath: value.saved_file_path,
});

const formatSubmitResponse = (value: CommonHomeworkSubmitRaw) => {
  return {
    submit: {
      status: value.submit.status,
      message: value.submit.message,
      workId: value.submit.work_id,
      attachments: Object.fromEntries(
        value.attachments.map((attachment) => [attachment.id, formatUploadedAttachment(attachment)]),
      ),
    },
  };
};

const formatAttachmentUploadResponse = (value: CommonHomeworkAttachmentUploadRaw) => {
  return {
    attachments: Object.fromEntries(
      value.attachments.map((attachment) => [attachment.id, formatUploadedAttachment(attachment)]),
    ),
  };
};

const formatStudentWorkResponse = (value: StudentWorkDetailRaw, workId: string) => {
  const parsedWorkId = Number(workId);

  return {
    assignment: formatBaseAssignment(value),
    work: {
      id: value.work_id ?? (Number.isFinite(parsedWorkId) ? parsedWorkId : null),
      description: value.description ?? null,
      status: value.work_status ?? null,
      commitTime: value.commit_time ?? null,
      updateTime: value.update_time ?? null,
      redoCount: value.redo_count ?? null,
      canFeedback: value.can_feedback ?? null,
      scores: {
        work: value.work_score ?? null,
        final: value.final_score ?? null,
        teacher: value.teacher_score ?? null,
        student: value.student_score ?? null,
        assistant: value.teaching_asistant_score ?? null,
        groupLeader: value.group_leader_score ?? null,
      },
      penalties: {
        late: value.late_penalty ?? null,
        absence: value.absence_penalty ?? null,
        appeal: value.appeal_penalty ?? null,
        repeat: value.repeat_minus_score ?? null,
      },
      submit: {
        canSubmit: value.can_submit ?? null,
        size: value.submit_size ?? null,
        commitCount: value.commit_count ?? null,
      },
      author: {
        name: value.author_name ?? null,
        studentId: value.student_id ?? null,
        group: value.group_name ?? null,
        imageUrl: value.image_url ?? null,
        currentUser: value.is_author ?? null,
      },
      operators: {
        commitUser: value.commit_user_name ?? null,
        updateUser: value.update_user_name ?? null,
      },
      review: {
        anonymousComment: value.anonymous_comment ?? null,
        allCommentedFinished: value.all_commented_finished ?? null,
        labStatus: value.lab_status ?? null,
        showEvaluation: value.show_evaluation ?? null,
      },
      navigation: {
        nextWorkId: value.next_work_id ?? null,
        previousWorkId: value.prev_work_id ?? null,
      },
      attachments: formatAttachments(value.attachments),
    },
  };
};

const formatSupplyAttachmentsResponse = (value: StudentWorkSupplyAttachmentsRaw) => {
  return {
    supply: {
      reviseReason: value.revise_reason ?? null,
      updateTime: value.atta_update_time ?? null,
      updateUser: {
        name: value.atta_update_user ?? null,
        login: value.atta_update_user_login ?? null,
      },
      attachments: formatAttachments(value.revise_attachments),
    },
  };
};

const formatWorkCommentsResponse = (value: StudentWorkCommentsRaw) => {
  return {
    comments: {
      count: value.comment_count,
      allowScore: value.allow_score,
      ultimate: value.ultimate,
      singleScore: value.single_score,
      author: value.is_author,
      lastComment: {
        content: value.last_comment.last_content ?? null,
        score: value.last_comment.last_score ?? null,
      },
      lastHiddenComment: {
        content: value.last_hidden_comment.last_content ?? null,
        score: value.last_hidden_comment.last_score ?? null,
      },
      lists: {
        teachers: value.teacher_list.length,
        assistants: value.teaching_assistant_list.length,
        students: value.student_list.length,
        scores: value.comment_scores.length,
      },
    },
  };
};

const formatMember = (member: CommonHomeworkMembersRaw["members"][number]) => {
  return {
    name: member.user_name,
    studentId: member.student_id ?? null,
    group: member.group_name ?? null,
    committed: member.commit_status ?? null,
    team: member.is_team ?? null,
  };
};

const formatSettingsResponse = (value: CommonHomeworkSettingsRaw) => {
  return {
    assignment: formatBaseAssignment(value),
    schedule: {
      publishTime: value.publish_time ?? null,
      endTime: value.end_time ?? null,
      lateTime: value.late_time ?? null,
      allowLate: value.allow_late ?? null,
      latePenalty: value.late_penalty ?? null,
    },
    submit: {
      canSubmit: value.can_submit ?? null,
      canMakeUp: value.can_make_up ?? null,
      submitNum: value.submit_num ?? null,
      submitSize: value.submit_size ?? null,
      limit: value.submit_limit ?? null,
      limitNum: value.submit_limit_num ?? null,
      mustFile: value.must_file ?? null,
    },
    score: {
      total: value.total_score ?? null,
      open: value.score_open ?? null,
      workPublic: value.work_public ?? null,
      answerPublic: value.answer_public ?? null,
      commentPublic: value.comment_public ?? null,
      details: value.score_details ?? [],
    },
    groups: {
      allUsers: value.all_user_size ?? null,
      settingsCount: value.group_settings == null ? null : value.group_settings.length,
      allowLateSettingsCount: value.allow_late_settings == null ? null : value.allow_late_settings.length,
    },
    anonymous: {
      comment: value.anonymous_comment ?? null,
      appeal: value.anonymous_appeal ?? null,
    },
    canEdit: value.can_edit ?? null,
    studentWorks: value.student_works ?? null,
  };
};

type ListCommonAssignmentsInput = {
  readonly courseId: string;
  readonly category?: number | undefined;
  readonly status: number;
  readonly page: number;
  readonly limit: number;
  readonly order?: number | undefined;
  readonly search?: string | undefined;
  readonly sortBy?: AssignmentSortBy | undefined;
  readonly sortDirection?: AssignmentSortDirection | undefined;
};

type AssignmentIdInput = {
  readonly homeworkId: string;
};

type CommonHomeworkWithCourseInput = {
  readonly courseId: string;
  readonly homeworkId: string;
  readonly categoryId?: string | undefined;
};

type CommonHomeworkDraftInput = {
  readonly courseId: string;
  readonly homeworkId: string;
  readonly type: number;
};

type SearchCommonHomeworkMembersInput = {
  readonly courseId: string;
  readonly homeworkId: string;
  readonly page: number;
  readonly limit: number;
  readonly search: string;
};

type CommonHomeworkCommentsInput = {
  readonly courseId: string;
  readonly homeworkId: string;
  readonly categoryId?: string | undefined;
  readonly pageSize: number;
};

type CommonHomeworkRedoLogsInput = {
  readonly homeworkId: string;
  readonly type: number;
  readonly page: number;
  readonly limit: number;
};

type SubmitCommonHomeworkInput = {
  readonly courseId: string;
  readonly homeworkId: string;
  readonly description: string;
  readonly files: ReadonlyArray<string>;
  readonly type: number;
};

type UploadCommonHomeworkAttachmentsInput = {
  readonly files: ReadonlyArray<string>;
};

type StudentWorkWithCourseInput = {
  readonly courseId: string;
  readonly homeworkId: string;
  readonly workId: string;
  readonly userId?: string | undefined;
};

type StudentWorkDetailInput = StudentWorkWithCourseInput & {
  readonly historyId?: string | undefined;
};

type StudentWorkCommentsInput = StudentWorkWithCourseInput & {
  readonly invalid: boolean;
};

type ListCommonAssignmentsView = {
  readonly total: number;
  readonly order: ReadonlyArray<string>;
  readonly filters: {
    readonly status: number;
    readonly order: number;
    readonly search: string | null;
    readonly sortBy: AssignmentSortBy | null;
    readonly sortDirection: AssignmentSortDirection | null;
  };
  readonly category: {
    readonly id: number | null;
    readonly name: string;
    readonly total: number;
    readonly published: number;
    readonly unpublished: number;
  };
  readonly assignments: Record<
    string,
    {
      readonly name: string;
      readonly category: string | null;
      readonly status: string;
      readonly statusTime: string;
      readonly timeStatus: number;
      readonly allowLate: boolean;
      readonly author: string;
      readonly created: string;
      readonly publishTime: string;
      readonly endTime: string;
      readonly lateTime: string;
      readonly studentWorkId: number;
      readonly workId: number | null;
      readonly workStatus: string | null;
      readonly uncommitted: boolean | null;
      readonly labStatus: string | null;
    }
  >;
};

type CommonHomeworkInfoView = ReturnType<typeof formatInfoResponse>;
type CommonHomeworkWorksView = ReturnType<typeof formatWorksResponse>;
type CommonHomeworkDraftView = {
  readonly draft: ReturnType<typeof formatBaseAssignment>;
};
type CommonHomeworkMembersView = {
  readonly ai: boolean;
  readonly members: Record<string, ReturnType<typeof formatMember>>;
};
type CommonHomeworkCommentsView = {
  readonly comments: {
    readonly assignmentUserId: number;
    readonly messagesCount: number;
    readonly parentMessagesCount: number;
    readonly items: ReadonlyArray<never>;
  };
};
type CommonHomeworkSettingsView = ReturnType<typeof formatSettingsResponse>;
type CommonHomeworkRedoLogsView = {
  readonly redoLogs: {
    readonly status: number;
    readonly message: string;
    readonly assignmentType: string | undefined;
    readonly count: number | undefined;
    readonly list: ReadonlyArray<unknown>;
  };
};
type CommonHomeworkSubmitView = ReturnType<typeof formatSubmitResponse>;
type CommonHomeworkAttachmentUploadView = ReturnType<typeof formatAttachmentUploadResponse>;
type StudentWorkDetailView = ReturnType<typeof formatStudentWorkResponse>;
type StudentWorkSupplyAttachmentsView = ReturnType<typeof formatSupplyAttachmentsResponse>;
type StudentWorkCommentsView = ReturnType<typeof formatWorkCommentsResponse>;

export type CommonAssignmentFeatureShape = {
  readonly list: FeatureWorkflow<ListCommonAssignmentsInput, HomeworkCommonsRaw, ListCommonAssignmentsView>;
  readonly getInfo: FeatureWorkflow<AssignmentIdInput, CommonHomeworkInfoRaw, CommonHomeworkInfoView>;
  readonly getWork: FeatureWorkflow<CommonHomeworkWithCourseInput, CommonHomeworkWorksRaw, CommonHomeworkWorksView>;
  readonly getDraft: FeatureWorkflow<CommonHomeworkDraftInput, CommonHomeworkDraftRaw, CommonHomeworkDraftView>;
  readonly searchMembers: FeatureWorkflow<
    SearchCommonHomeworkMembersInput,
    CommonHomeworkMembersRaw,
    CommonHomeworkMembersView
  >;
  readonly getComments: FeatureWorkflow<
    CommonHomeworkCommentsInput,
    CommonHomeworkCommentsRaw,
    CommonHomeworkCommentsView
  >;
  readonly getSettings: FeatureWorkflow<
    CommonHomeworkWithCourseInput,
    CommonHomeworkSettingsRaw,
    CommonHomeworkSettingsView
  >;
  readonly getRedoLogs: FeatureWorkflow<
    CommonHomeworkRedoLogsInput,
    CommonHomeworkRedoLogsRaw,
    CommonHomeworkRedoLogsView
  >;
  readonly uploadAttachments: FeatureWorkflow<
    UploadCommonHomeworkAttachmentsInput,
    CommonHomeworkAttachmentUploadRaw,
    CommonHomeworkAttachmentUploadView
  >;
  readonly submit: FeatureWorkflow<SubmitCommonHomeworkInput, CommonHomeworkSubmitRaw, CommonHomeworkSubmitView>;
  readonly getStudentWork: FeatureWorkflow<StudentWorkDetailInput, StudentWorkDetailRaw, StudentWorkDetailView>;
  readonly getSupplyAttachments: FeatureWorkflow<
    StudentWorkWithCourseInput,
    StudentWorkSupplyAttachmentsRaw,
    StudentWorkSupplyAttachmentsView
  >;
  readonly getWorkComments: FeatureWorkflow<StudentWorkCommentsInput, StudentWorkCommentsRaw, StudentWorkCommentsView>;
};

export class CommonAssignmentFeature extends Context.Service<CommonAssignmentFeature, CommonAssignmentFeatureShape>()(
  "open-educoder/services/features/CommonAssignmentFeature",
) {
  public static readonly layer = Layer.effect(
    CommonAssignmentFeature,
    Effect.gen(function* () {
      const ctx = yield* AppContext;
      const educoder = yield* EducoderApi;
      const fs = yield* FileSystem.FileSystem;
      const httpClient = yield* HttpClient.HttpClient;

      const resolveLogin = Effect.fn("features.assignments.common.resolveLogin")(function* () {
        const user = yield* ctx.user;

        return user.login;
      });

      const initiateMultipartUpload = Effect.fn("features.assignments.common.attachments.initiateMultipartUpload")(
        function* (token: AttachmentUploadToken, objectKey: string) {
          const query: ReadonlyArray<OssQueryEntry> = [["uploads"]];
          const response = yield* httpClient.post(makeOssUrl(token, objectKey, query), {
            headers: makeOssHeaders({
              token,
              method: "POST",
              objectKey,
              query,
              contentType: "",
            }),
            body: HttpBody.empty,
          });
          const xml = yield* readResponseText(response);

          return yield* parseUploadId(xml);
        },
      );

      const uploadMultipartPart = Effect.fn("features.assignments.common.attachments.uploadMultipartPart")(function* (
        token: AttachmentUploadToken,
        objectKey: string,
        uploadId: string,
        partNumber: number,
        bytes: Uint8Array,
        contentType: string,
      ) {
        const query: ReadonlyArray<OssQueryEntry> = [
          ["partNumber", String(partNumber)],
          ["uploadId", uploadId],
        ];
        const response = yield* httpClient.put(makeOssUrl(token, objectKey, query), {
          headers: makeOssHeaders({
            token,
            method: "PUT",
            objectKey,
            query,
            contentType,
          }),
          body: HttpBody.uint8Array(bytes, contentType),
        });
        const ok = yield* HttpClientResponse.filterStatusOk(response);
        const etag = readResponseHeader(ok, "etag");

        if (etag === undefined || etag.length === 0) {
          return yield* failInput("OSS multipart upload did not return an ETag.");
        }

        return {
          partNumber,
          etag,
        };
      });

      const completeMultipartUpload = Effect.fn("features.assignments.common.attachments.completeMultipartUpload")(
        function* (
          token: AttachmentUploadToken,
          objectKey: string,
          uploadId: string,
          parts: ReadonlyArray<UploadedPart>,
          login: string,
          fileName: string,
          diskDirectory: string,
        ) {
          const query: ReadonlyArray<OssQueryEntry> = [["uploadId", uploadId]];
          const xml = makeCompleteMultipartXml([...parts].sort((left, right) => left.partNumber - right.partNumber));
          const contentMd5 = createHash("md5").update(xml, "utf8").digest("base64");
          const response = yield* httpClient.post(makeOssUrl(token, objectKey, query), {
            headers: makeOssHeaders({
              token,
              method: "POST",
              objectKey,
              query,
              contentType: "application/xml",
              contentMd5,
              extraXHeaders: makeCallbackHeaders({
                token,
                login,
                fileName,
                diskDirectory,
              }),
            }),
            body: HttpBody.text(xml, "application/xml"),
          });
          const text = yield* readResponseText(response);

          return yield* parseAttachmentUploadResponse(text);
        },
      );

      const uploadAttachment = Effect.fn("features.assignments.common.attachments.upload")(function* (
        filePath: string,
        login: string,
      ) {
        const fileName = path.basename(filePath);
        const bytes = yield* fs.readFile(filePath);

        if (bytes.length === 0) {
          return yield* failInput(`Attachment file is empty: ${filePath}`);
        }

        const tokenResponse = yield* educoder.Bucket.getAttachmentToken({
          query: {
            zzud: login,
          },
        });
        const token = yield* decryptAttachmentToken(tokenResponse.data);
        const contentType = makeMimeType(fileName);
        const diskDirectory = makeDiskDirectory();
        const objectKey = makeObjectKey(fileName, diskDirectory);
        const uploadId = yield* initiateMultipartUpload(token, objectKey);
        const parts = yield* Effect.forEach(splitFileParts(bytes), (part, index) =>
          uploadMultipartPart(token, objectKey, uploadId, index + 1, part, contentType),
        );
        const attachment = yield* completeMultipartUpload(
          token,
          objectKey,
          uploadId,
          parts,
          login,
          fileName,
          diskDirectory,
        );

        return attachment;
      });

      const list: CommonAssignmentFeatureShape["list"] = Effect.fn("features.assignments.common.list")(
        function* (input) {
          const login = yield* resolveLogin();
          const order = input.order ?? input.status;
          const raw = yield* educoder.Course.homeworkCommons({
            params: {
              courseId: input.courseId,
            },
            query: {
              coursesId: input.courseId,
              id: input.courseId,
              limit: input.limit,
              type: AssignmentTypeCode.common,
              status: input.status,
              category: input.category,
              page: input.page,
              order,
              search: input.search,
              sort_by: input.sortBy,
              sort_direction: input.sortDirection,
              zzud: login,
            },
          });

          return {
            raw,
            view: {
              total: raw.query_total_count,
              order: raw.homeworks.map((item) => String(item.homework_id)),
              filters: {
                status: input.status,
                order,
                search: input.search ?? null,
                sortBy: input.sortBy ?? null,
                sortDirection: input.sortDirection ?? null,
              },
              category: {
                id: raw.category_id ?? null,
                name: raw.category_name ?? raw.main_category_name,
                total: raw.query_total_count,
                published: raw.published_count,
                unpublished: raw.unpublished_count,
              },
              assignments: Object.fromEntries(
                raw.homeworks.map((item) => [
                  item.homework_id,
                  {
                    name: item.name,
                    category: item.upper_category_name ?? raw.category_name ?? null,
                    status: formatLabels(item.status),
                    statusTime: item.status_time,
                    timeStatus: item.time_status,
                    allowLate: item.allow_late,
                    author: item.author,
                    created: item.created_at,
                    publishTime: item.publish_time,
                    endTime: item.end_time,
                    lateTime: item.late_time,
                    studentWorkId: item.student_work_id,
                    workId: item.work_id ?? null,
                    workStatus: item.work_status == null ? null : formatLabels(item.work_status),
                    uncommitted: item.un_commit_work ?? null,
                    labStatus: item.lab_status ?? null,
                  },
                ]),
              ),
            },
          };
        },
      );

      const getInfo: CommonAssignmentFeatureShape["getInfo"] = Effect.fn("features.assignments.common.info")(
        function* (input) {
          const login = yield* resolveLogin();
          const raw = yield* educoder.HomeworkCommon.info({
            params: {
              homeworkId: input.homeworkId,
            },
            query: {
              zzud: login,
            },
          });

          return {
            raw,
            view: formatInfoResponse(raw),
          };
        },
      );

      const getWork: CommonAssignmentFeatureShape["getWork"] = Effect.fn("features.assignments.common.work")(
        function* (input) {
          const login = yield* resolveLogin();
          const categoryId = resolveCategoryId(input.homeworkId, input.categoryId);
          const raw = yield* educoder.HomeworkCommon.worksList({
            params: {
              homeworkId: input.homeworkId,
            },
            query: {
              zzud: login,
            },
            payload: {
              coursesId: input.courseId,
              categoryId,
            },
          });

          return {
            raw,
            view: formatWorksResponse(raw),
          };
        },
      );

      const getDraft: CommonAssignmentFeatureShape["getDraft"] = Effect.fn("features.assignments.common.draft")(
        function* (input) {
          const login = yield* resolveLogin();
          const raw = yield* educoder.HomeworkCommon.studentWorkNew({
            params: {
              homeworkId: input.homeworkId,
            },
            query: {
              coursesId: input.courseId,
              commonHomeworkId: input.homeworkId,
              type: input.type,
              zzud: login,
            },
          });

          return {
            raw,
            view: {
              draft: formatBaseAssignment(raw),
            },
          };
        },
      );

      const searchMembers: CommonAssignmentFeatureShape["searchMembers"] = Effect.fn(
        "features.assignments.common.members",
      )(function* (input) {
        const login = yield* resolveLogin();
        const raw = yield* educoder.HomeworkCommon.searchMemberList({
          params: {
            homeworkId: input.homeworkId,
          },
          query: {
            coursesId: input.courseId,
            commonHomeworkId: input.homeworkId,
            page: input.page,
            limit: input.limit,
            search: input.search,
            zzud: login,
          },
        });

        return {
          raw,
          view: {
            ai: raw.is_ai,
            members: Object.fromEntries(raw.members.map((member) => [member.user_id, formatMember(member)])),
          },
        };
      });

      const getComments: CommonAssignmentFeatureShape["getComments"] = Effect.fn(
        "features.assignments.common.comments",
      )(function* (input) {
        const login = yield* resolveLogin();
        const categoryId = resolveCategoryId(input.homeworkId, input.categoryId);
        const raw = yield* educoder.HomeworkCommon.showComment({
          params: {
            homeworkId: input.homeworkId,
          },
          query: {
            coursesId: input.courseId,
            categoryId,
            page_size: input.pageSize,
            zzud: login,
          },
        });

        return {
          raw,
          view: {
            comments: {
              assignmentUserId: raw.homework_user_id,
              messagesCount: raw.messages_count,
              parentMessagesCount: raw.parent_messages_count,
              items: [],
            },
          },
        };
      });

      const getSettings: CommonAssignmentFeatureShape["getSettings"] = Effect.fn(
        "features.assignments.common.settings",
      )(function* (input) {
        const login = yield* resolveLogin();
        const categoryId = resolveCategoryId(input.homeworkId, input.categoryId);
        const raw = yield* educoder.HomeworkCommon.settings({
          params: {
            homeworkId: input.homeworkId,
          },
          query: {
            coursesId: input.courseId,
            categoryId,
            zzud: login,
          },
        });

        return {
          raw,
          view: formatSettingsResponse(raw),
        };
      });

      const getRedoLogs: CommonAssignmentFeatureShape["getRedoLogs"] = Effect.fn(
        "features.assignments.common.redoLogs",
      )(function* (input) {
        const login = yield* resolveLogin();
        const raw = yield* educoder.HomeworkCommon.redoLogs({
          params: {
            homeworkId: input.homeworkId,
          },
          query: {
            type: input.type,
            limit: input.limit,
            page: input.page,
            zzud: login,
          },
        });

        return {
          raw,
          view: {
            redoLogs: {
              status: raw.status,
              message: raw.message,
              assignmentType: raw.data.homework_type,
              count: raw.data.count,
              list: [],
            },
          },
        };
      });

      const uploadAttachments: CommonAssignmentFeatureShape["uploadAttachments"] = Effect.fn(
        "features.assignments.common.uploadAttachments",
      )(function* (input) {
        const login = yield* resolveLogin();
        const attachments = yield* Effect.forEach(input.files, (file) => uploadAttachment(file, login), {
          concurrency: 1,
        });
        const result = {
          attachments,
        };

        return {
          raw: result,
          view: formatAttachmentUploadResponse(result),
        };
      });

      const submit: CommonAssignmentFeatureShape["submit"] = Effect.fn("features.assignments.common.submit")(
        function* (input) {
          const login = yield* resolveLogin();
          const uploads = yield* Effect.forEach(input.files, (file) => uploadAttachment(file, login), {
            concurrency: 1,
          });
          const raw = yield* educoder.HomeworkCommon.submitStudentWork({
            params: {
              homeworkId: input.homeworkId,
            },
            query: {
              zzud: login,
            },
            payload: {
              coursesId: input.courseId,
              commonHomeworkId: input.homeworkId,
              description: input.description,
              attachment_ids: uploads.map((attachment) => attachment.id),
              type: input.type,
            },
          });
          const result = {
            attachments: uploads,
            submit: raw,
          };

          return {
            raw: result,
            view: formatSubmitResponse(result),
          };
        },
      );

      const getStudentWork: CommonAssignmentFeatureShape["getStudentWork"] = Effect.fn(
        "features.assignments.common.studentWork",
      )(function* (input) {
        const login = yield* resolveLogin();
        const raw = yield* educoder.StudentWork.info({
          params: {
            workId: input.workId,
          },
          query: {
            coursesId: input.courseId,
            categoryId: input.homeworkId,
            userId: input.userId ?? input.workId,
            history_id: input.historyId ?? "",
            zzud: login,
          },
        });

        return {
          raw,
          view: formatStudentWorkResponse(raw, input.workId),
        };
      });

      const getSupplyAttachments: CommonAssignmentFeatureShape["getSupplyAttachments"] = Effect.fn(
        "features.assignments.common.supplyAttachments",
      )(function* (input) {
        const login = yield* resolveLogin();
        const raw = yield* educoder.StudentWork.supplyAttachments({
          params: {
            workId: input.workId,
          },
          query: {
            coursesId: input.courseId,
            categoryId: input.homeworkId,
            userId: input.userId ?? input.workId,
            zzud: login,
          },
        });

        return {
          raw,
          view: formatSupplyAttachmentsResponse(raw),
        };
      });

      const getWorkComments: CommonAssignmentFeatureShape["getWorkComments"] = Effect.fn(
        "features.assignments.common.workComments",
      )(function* (input) {
        const login = yield* resolveLogin();
        const raw = yield* educoder.StudentWork.commentList({
          params: {
            workId: input.workId,
          },
          query: {
            is_invalid: input.invalid ? "true" : "false",
            coursesId: input.courseId,
            categoryId: input.homeworkId,
            userId: input.userId ?? input.workId,
            zzud: login,
          },
        });

        return {
          raw,
          view: formatWorkCommentsResponse(raw),
        };
      });

      return CommonAssignmentFeature.of({
        list,
        getInfo,
        getWork,
        getDraft,
        searchMembers,
        getComments,
        getSettings,
        getRedoLogs,
        uploadAttachments,
        submit,
        getStudentWork,
        getSupplyAttachments,
        getWorkComments,
      });
    }),
  );
}
