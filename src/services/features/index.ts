import { Layer } from "effect";

import { AccountFeature } from "./account.js";
import { CommonAssignmentFeature } from "./assignments/common.js";
import { LabAssignmentFeature } from "./assignments/lab.js";
import { CourseFeature } from "./course.js";
import { ExamFeature } from "./exam.js";

export { AccountFeature } from "./account.js";
export { CourseFeature } from "./course.js";
export { ExamFeature } from "./exam.js";
export { CommonAssignmentFeature } from "./assignments/common.js";
export { LabAssignmentFeature } from "./assignments/lab.js";
export * from "./shared.js";

export const FeatureLayer = Layer.mergeAll(
  AccountFeature.layer,
  CourseFeature.layer,
  ExamFeature.layer,
  CommonAssignmentFeature.layer,
  LabAssignmentFeature.layer,
);
