import { createHash, randomUUID } from "node:crypto";

const EduAccessKey = "e9dd5b4322f9f7d83d009de9bfa100c3" as const;
const EduSecretKey = "2e3da06ae26ba9f76a5d8d355746f2fe" as const;

const makeEduSignature = (method: string, timestamp: string) => {
  const plaintext = `method=${method.toUpperCase()}&ak=${EduAccessKey}&sk=${EduSecretKey}&time=${timestamp}`;
  const encoded = Buffer.from(plaintext).toString("base64");

  return createHash("md5").update(encoded).digest("hex");
};

export const makeEducoderHeaders = (method: string) => {
  const timestamp = Date.now().toString();

  return {
    "X-EDU-Type": "pc",
    "X-EDU-Timestamp": timestamp,
    "X-EDU-Signature": makeEduSignature(method, timestamp),
    "Pc-Authorization": "",
    "X-Original-Protocol": "https:",
    "X-Original-Host": "www.educoder.net",
    "X-Request-Id": randomUUID(),
  };
};
