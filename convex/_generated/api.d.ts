/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as ai from "../ai.js";
import type * as constants from "../constants.js";
import type * as crons from "../crons.js";
import type * as game from "../game.js";
import type * as helpers from "../helpers.js";
import type * as lib_helper from "../lib/helper.js";
import type * as lib_six_letter_words from "../lib/six_letter_words.js";
import type * as records from "../records.js";
import type * as reminders from "../reminders.js";
import type * as slackNotifier from "../slackNotifier.js";
import type * as utils from "../utils.js";
import type * as winners from "../winners.js";
import type * as words_fillWords from "../words/fillWords.js";
import type * as words from "../words.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  ai: typeof ai;
  constants: typeof constants;
  crons: typeof crons;
  game: typeof game;
  helpers: typeof helpers;
  "lib/helper": typeof lib_helper;
  "lib/six_letter_words": typeof lib_six_letter_words;
  records: typeof records;
  reminders: typeof reminders;
  slackNotifier: typeof slackNotifier;
  utils: typeof utils;
  winners: typeof winners;
  "words/fillWords": typeof words_fillWords;
  words: typeof words;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
