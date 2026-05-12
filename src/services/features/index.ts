import { Layer } from "effect";

import { CourseFeature } from "./course.js";
import { ExamFeature } from "./exam.js";
import { CommonAssignmentFeature } from "./assignments/common.js";
import { LabAssignmentFeature } from "./assignments/lab.js";
import { ProfileFeature } from "./profile.js";

export { CourseFeature } from "./course.js";
export { ExamFeature } from "./exam.js";
export { CommonAssignmentFeature } from "./assignments/common.js";
export { LabAssignmentFeature } from "./assignments/lab.js";
export { ProfileFeature } from "./profile.js";
export * from "./shared.js";

export const FeatureLayer = Layer.mergeAll(
  CourseFeature.layer,
  ExamFeature.layer,
  CommonAssignmentFeature.layer,
  LabAssignmentFeature.layer,
  ProfileFeature.layer,
);
