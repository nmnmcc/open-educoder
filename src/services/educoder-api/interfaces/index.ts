import { HttpApi } from "effect/unstable/httpapi";
import { Account } from "./groups/account.js";
import { Course } from "./groups/course.js";
import { User } from "./groups/user.js";

export const Interfaces = HttpApi.make("educoder").add(Account, User, Course);
