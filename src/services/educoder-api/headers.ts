import { createHash, randomUUID } from "node:crypto";
import { Cookies } from "effect/unstable/http";

const EduAccessKey = "e9dd5b4322f9f7d83d009de9bfa100c3" as const;
const EduSecretKey = "2e3da06ae26ba9f76a5d8d355746f2fe" as const;

const makeEduSignature = (method: string, timestamp: string) => {
  const plaintext = `method=${method.toUpperCase()}&ak=${EduAccessKey}&sk=${EduSecretKey}&time=${timestamp}`;
  const encoded = Buffer.from(plaintext).toString("base64");

  return createHash("md5").update(encoded).digest("hex");
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const readCookieValue = (cookies: Cookies.Cookies, name: string) => {
  const cookieHeader = Cookies.toCookieHeader(cookies);
  const match = cookieHeader.match(RegExp(`(^| )${escapeRegExp(name)}=([^;]+)(;|$)`));

  return match?.[2] === undefined ? null : decodeURIComponent(match[2]);
};

const makePcAuthorization = (cookies: Cookies.Cookies) => {
  const authorization = readCookieValue(cookies, "_educoder_session");

  return authorization === null || authorization === "" ? "logout" : authorization;
};

export const makeEducoderHeaders = (method: string, cookies: Cookies.Cookies = Cookies.empty) => {
  const timestamp = Date.now().toString();

  return {
    Accept: "application/json",
    Origin: "https://www.educoder.net",
    "X-EDU-Type": "pc",
    "X-EDU-Timestamp": timestamp,
    "X-EDU-Signature": makeEduSignature(method, timestamp),
    "Pc-Authorization": makePcAuthorization(cookies),
    "X-Original-Protocol": "https:",
    "X-Original-Host": "www.educoder.net",
    "X-Original-Origin": "https://www.educoder.net",
    "X-Request-Id": randomUUID(),
  };
};
