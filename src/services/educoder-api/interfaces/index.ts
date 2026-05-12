import { HttpApi } from "effect/unstable/httpapi";

import { Account } from "./groups/account.js";
import { Course } from "./groups/course.js";
import { Exam } from "./groups/exam.js";
import { HomeworkCommon } from "./groups/homework-common.js";
import { Myshixun } from "./groups/myshixun.js";
import { Shixun } from "./groups/shixun.js";
import { Task } from "./groups/task.js";
import { UserGroup } from "./groups/user.js";

export const Interfaces = HttpApi.make("educoder").add(
  Account,
  UserGroup,
  Course,
  Exam,
  Shixun,
  Task,
  Myshixun,
  HomeworkCommon,
);
