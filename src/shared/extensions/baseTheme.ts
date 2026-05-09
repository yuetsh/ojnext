import { EditorView } from "@codemirror/view"

export const styleTheme = EditorView.baseTheme({
  "& .cm-scroller": { "font-family": "Monaco" },
  "&.cm-editor.cm-focused": { outline: "none" },
  "&.cm-editor .cm-tooltip.cm-tooltip-autocomplete ul": {
    "font-family": "Monaco",
  },
})
