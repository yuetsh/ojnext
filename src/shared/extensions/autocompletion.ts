import type {
  Completion,
  CompletionContext,
  CompletionResult,
  CompletionSource,
} from "@codemirror/autocomplete"
import type { EditorView } from "@codemirror/view"
import { useProblemStore } from "oj/store/problem"
import type { LANGUAGE } from "utils/types"
import { c } from "./c"
import { python } from "./python"
import { sql } from "./sql"

type ChineseCompletion = Pick<
  Completion,
  "label" | "detail" | "type" | "info" | "boost" | "apply"
> & { apply?: string | Completion["apply"] }

// 中文注释提示
const chineseAnnotations: Record<string, ChineseCompletion[]> = {
  python,
  c,
  sql,
}

// SQL 题：当前题目的表名和字段名补全，数据来自 sql_display
function sqlSchemaCompletions(): Completion[] {
  const tables = useProblemStore().problem?.sql_display?.tables ?? []
  return tables.flatMap((table) => [
    {
      label: table.name,
      detail: "数据表",
      type: "class",
      info: `字段：${table.columns
        .map((col) => (col.type ? `${col.name} ${col.type}` : col.name))
        .join(", ")}`,
      boost: 110,
    },
    ...table.columns.map((col) => ({
      label: col.name,
      detail: col.type
        ? `${table.name} 的字段 · ${col.type}`
        : `${table.name} 的字段`,
      type: "property",
      boost: 105,
    })),
  ])
}

export function enhanceCompletion(language: LANGUAGE): CompletionSource {
  return async function (
    context: CompletionContext,
  ): Promise<CompletionResult | null> {
    const word = context.matchBefore(/\w+/)
    if (!word && !context.explicit) return null

    const trulyLanguage =
      language === "SQL"
        ? "sql"
        : language.startsWith("Python")
          ? "python"
          : "c"
    const completions: Completion[] = (
      chineseAnnotations[trulyLanguage] || []
    ).map((completion) => {
      const insertText =
        typeof completion.apply === "string"
          ? completion.apply
          : completion.label
      const cursorOffset = insertText.includes("(")
        ? insertText.indexOf("(") + 1
        : insertText.length

      if (
        (completion.type === "function" || completion.type === "method") &&
        insertText.includes(")")
      ) {
        return {
          ...completion,
          apply: (
            view: EditorView,
            _c: Completion,
            from: number,
            to: number,
          ) => {
            view.dispatch({
              changes: { from, to, insert: insertText },
              selection: { anchor: from + cursorOffset },
            })
          },
        }
      }

      return completion
    })

    if (trulyLanguage === "sql") {
      completions.push(...sqlSchemaCompletions())
    }

    return {
      from: word ? word.from : context.pos,
      options: completions,
      validFor: /^\w+$/,
    }
  }
}
