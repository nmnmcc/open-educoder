import { HttpApi } from "effect/unstable/httpapi";
import { Account } from "./groups/account.js";
import { Course } from "./groups/course.js";
import { Exam } from "./groups/exam.js";
import { Myshixun } from "./groups/myshixun.js";
import { Task } from "./groups/task.js";
import { User } from "./groups/user.js";

export const Interfaces = HttpApi.make("educoder").add(Account, User, Course, Exam, Task, Myshixun);
