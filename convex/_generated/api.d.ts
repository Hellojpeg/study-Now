/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as functions_analysis from "../functions/analysis.js";
import type * as functions_assignments from "../functions/assignments.js";
import type * as functions_auth from "../functions/auth.js";
import type * as functions_authHelpers from "../functions/authHelpers.js";
import type * as functions_benchmarks from "../functions/benchmarks.js";
import type * as functions_classes from "../functions/classes.js";
import type * as functions_courses from "../functions/courses.js";
import type * as functions_lessons from "../functions/lessons.js";
import type * as functions_modules from "../functions/modules.js";
import type * as functions_progress from "../functions/progress.js";
import type * as functions_questions from "../functions/questions.js";
import type * as functions_scorm from "../functions/scorm.js";
import type * as functions_seed from "../functions/seed.js";
import type * as functions_users from "../functions/users.js";
import type * as functions_vocabulary from "../functions/vocabulary.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "functions/analysis": typeof functions_analysis;
  "functions/assignments": typeof functions_assignments;
  "functions/auth": typeof functions_auth;
  "functions/authHelpers": typeof functions_authHelpers;
  "functions/benchmarks": typeof functions_benchmarks;
  "functions/classes": typeof functions_classes;
  "functions/courses": typeof functions_courses;
  "functions/lessons": typeof functions_lessons;
  "functions/modules": typeof functions_modules;
  "functions/progress": typeof functions_progress;
  "functions/questions": typeof functions_questions;
  "functions/scorm": typeof functions_scorm;
  "functions/seed": typeof functions_seed;
  "functions/users": typeof functions_users;
  "functions/vocabulary": typeof functions_vocabulary;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
