import type { ResolvedQuestion } from "@inklyre/oes-core";
import type { LintIssue } from "../types.js";

/**
 * When `answer_key.file` is set, confirm the file actually exists —
 * independent of whether `resolve()` ever fetches it, since it
 * deliberately doesn't (a public/student-facing consumer built on
 * `resolveCourse`/`resolveSet` must never gain a path to the answer
 * through the shared resolver). Uses the question's own re-rooted
 * `source`, exposed on {@link ResolvedQuestion} for exactly this purpose.
 */
export async function checkAnswerKeyFile(resolved: ResolvedQuestion, at: string, issues: LintIssue[]): Promise<void> {
  const file = resolved.question.answer_key?.file;
  if (file === undefined) return;
  try {
    await resolved.source.fetch(file);
  } catch (cause) {
    issues.push({
      rule: "answer-key-file-missing",
      severity: "error",
      at: `${at}.answer_key`,
      message: `answer_key.file "${file}" could not be read: ${cause instanceof Error ? cause.message : String(cause)}`,
    });
  }
}
