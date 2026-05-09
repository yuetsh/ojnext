import { tags as t } from "@lezer/highlight"
import { EditorView } from "@codemirror/view"
import type { Extension } from "@codemirror/state"
import { createTheme } from "./createTheme"

const tooltipTheme = EditorView.theme({
  ".cm-tooltip": {
    border: "1px solid #e0e0e0",
    backgroundColor: "#f8f8f8",
  },
  ".cm-tooltip-autocomplete": {
    "& > ul > li[aria-selected]": {
      backgroundColor: "#e8e8e8",
      color: "#000000",
    },
  },
})

// Author: Kenneth Reitz
const smoothyBase = createTheme({
  variant: "light",
  settings: {
    background: "#FFFFFF",
    foreground: "#000000",
    caret: "#000000",
    selection: "#FFFD0054",
    gutterBackground: "#FFFFFF",
    gutterForeground: "#00000070",
    gutterBorderRight: "none",
    lineHighlight: "#00000008",
  },
  styles: [
    {
      tag: t.comment,
      color: "#CFCFCF",
    },
    {
      tag: [t.number, t.bool, t.null],
      color: "#E66C29",
    },
    {
      tag: [
        t.className,
        t.definition(t.propertyName),
        t.function(t.variableName),
        t.labelName,
        t.definition(t.typeName),
      ],
      color: "#2EB43B",
    },
    {
      tag: t.keyword,
      color: "#D8B229",
    },
    {
      tag: t.operator,
      color: "#4EA44E",
      fontWeight: "bold",
    },
    {
      tag: [t.definitionKeyword, t.modifier],
      color: "#925A47",
    },
    {
      tag: t.string,
      color: "#704D3D",
    },
    {
      tag: t.typeName,
      color: "#2F8996",
    },
    {
      tag: [t.variableName, t.propertyName],
      color: "#77ACB0",
    },
    {
      tag: t.self,
      color: "#77ACB0",
      fontWeight: "bold",
    },
    {
      tag: t.regexp,
      color: "#E3965E",
    },
    {
      tag: [t.tagName, t.angleBracket],
      color: "#BAA827",
    },
    {
      tag: t.attributeName,
      color: "#B06520",
    },
    {
      tag: t.derefOperator,
      color: "#000",
    },
  ],
})

export const smoothy: Extension = [smoothyBase, tooltipTheme]
