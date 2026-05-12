import { Layer } from "effect";

import { CourseFeature } from "./course.js";
import { ExamFeature } from "./exam.js";
import { HomeworkCommonFeature } from "./homework/common.js";
import { HomeworkShixunFeature } from "./homework/shixun.js";
import { ProfileFeature } from "./profile.js";

export { CourseFeature } from "./course.js";
export { ExamFeature } from "./exam.js";
export { HomeworkCommonFeature } from "./homework/common.js";
export { HomeworkShixunFeature } from "./homework/shixun.js";
export { ProfileFeature } from "./profile.js";
export * from "./shared.js";

export const FeatureLayer = Layer.mergeAll(
  CourseFeature.layer,
  ExamFeature.layer,
  HomeworkCommonFeature.layer,
  HomeworkShixunFeature.layer,
  ProfileFeature.layer,
);
