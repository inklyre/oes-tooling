import { isOpfPoolEntry } from "@inklyre/oes-core";
import type {
  OpfSet,
  ResolvedCourse,
  ResolvedLesson,
  ResolvedModule,
  ResolvedQuestion,
  ResolveError,
} from "@inklyre/oes-core";
import type { LintIssue } from "./types.js";
import { lintQuestion } from "./question.js";
import { checkPoolBounds } from "./rules/pool-bounds.js";
import { checkUniqueIds } from "./rules/unique-ids.js";

/** `resolveCourse`/`resolveSet`'s own errors (dangling references, `content_hash` mismatches) — already-detected issues, just relabeled into this package's shape. */
export function resolveErrorsToIssues(errors: ResolveError[]): LintIssue[] {
  return errors.map(
    (error): LintIssue => ({
      rule: error.message.includes("content_hash mismatch") ? "content-hash-mismatch" : "dangling-reference",
      severity: "error",
      at: error.at,
      message: error.message,
    })
  );
}

export async function lintSetContent(set: OpfSet, questions: ResolvedQuestion[], at: string, issues: LintIssue[]): Promise<void> {
  checkUniqueIds(set.questions, `${at}.questions`, issues);
  set.questions.forEach((entry, i) => {
    if (isOpfPoolEntry(entry)) checkPoolBounds(entry, `${at}.questions[${i}]`, issues);
  });
  for (const question of questions) {
    await lintQuestion(question, `${at}.questions[id=${question.id}]`, issues);
  }
}

export async function lintResolvedLesson(lesson: ResolvedLesson, at: string, issues: LintIssue[]): Promise<void> {
  checkUniqueIds(lesson.lesson.items ?? [], `${at}.items`, issues);
  for (const [i, item] of lesson.items.entries()) {
    if (item.type === "practice_set") {
      await lintSetContent(item.set, item.questions, `${at}.items[${i}]`, issues);
    }
  }
}

export async function lintResolvedModule(module_: ResolvedModule, at: string, issues: LintIssue[]): Promise<void> {
  checkUniqueIds(module_.module.lessons, `${at}.lessons`, issues);
  for (const [i, lesson] of module_.lessons.entries()) {
    await lintResolvedLesson(lesson, `${at}.lessons[${i}]`, issues);
  }
}

export async function lintResolvedCourse(course: ResolvedCourse, issues: LintIssue[]): Promise<void> {
  checkUniqueIds(course.course.modules, "course.modules", issues);
  for (const [i, module_] of course.modules.entries()) {
    await lintResolvedModule(module_, `course.modules[${i}]`, issues);
  }
}
