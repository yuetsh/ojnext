import { getRandomId } from "utils/functions"

const mermaidThemeVariables = {
  primaryColor: "#eff6ff",
  primaryTextColor: "#1d4ed8",
  primaryBorderColor: "#3b82f6",
  lineColor: "#94a3b8",
  background: "#ffffff",
  mainBkg: "#eff6ff",
  fontFamily:
    'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
}

const displayStyleId = "oj-mermaid-display-style"

const shapes = ["rect", "polygon", "ellipse", "circle", "path"]

function nodeShapeRule(cls: string, fill: string, stroke: string) {
  const sel = shapes
    .map((s) => `.oj-mermaid-flowchart g.node.${cls} ${s}`)
    .join(",\n")
  return `${sel} { fill: ${fill} !important; stroke: ${stroke} !important; }`
}

function nodeLabelRule(cls: string, color: string) {
  const bases = [".label", ".nodeLabel", ".nodeLabel p", ".label span"]
  const sel = bases
    .map((b) => `.oj-mermaid-flowchart g.node.${cls} ${b}`)
    .join(",\n")
  return `${sel} { color: ${color} !important; fill: ${color} !important; }`
}

const mermaidDisplayStyle = `
.oj-mermaid-flowchart {
  max-width: 100%;
  height: auto;
}

/* Default node */
.oj-mermaid-flowchart g.node rect,
.oj-mermaid-flowchart g.node polygon,
.oj-mermaid-flowchart g.node ellipse,
.oj-mermaid-flowchart g.node circle,
.oj-mermaid-flowchart g.node path {
  fill: #eff6ff !important;
  stroke: #3b82f6 !important;
  stroke-width: 1.8px !important;
}

/* Default node text */
.oj-mermaid-flowchart g.node .label,
.oj-mermaid-flowchart g.node .nodeLabel,
.oj-mermaid-flowchart g.node .nodeLabel p,
.oj-mermaid-flowchart g.node .label span {
  color: #1d4ed8 !important;
  fill: #1d4ed8 !important;
  font-weight: 600 !important;
}

/* startNode / startEnd */
${nodeShapeRule("startNode", "#dcfce7", "#16a34a")}
${nodeShapeRule("startEnd", "#dcfce7", "#16a34a")}
${nodeLabelRule("startNode", "#166534")}
${nodeLabelRule("startEnd", "#166534")}

/* endNode */
${nodeShapeRule("endNode", "#fee2e2", "#dc2626")}
${nodeLabelRule("endNode", "#991b1b")}

/* input */
${nodeShapeRule("input", "#dbeafe", "#2563eb")}
${nodeLabelRule("input", "#1e40af")}

/* output */
${nodeShapeRule("output", "#ede9fe", "#7c3aed")}
${nodeLabelRule("output", "#5b21b6")}

/* process */
${nodeShapeRule("process", "#f1f5f9", "#64748b")}
${nodeLabelRule("process", "#334155")}

/* decision */
${nodeShapeRule("decision", "#fef9c3", "#ca8a04")}
${nodeLabelRule("decision", "#92400e")}

/* loop */
${nodeShapeRule("loop", "#fae8ff", "#c026d3")}
${nodeLabelRule("loop", "#7e22ce")}

/* Edges */
.oj-mermaid-flowchart .edgePaths path.path,
.oj-mermaid-flowchart .flowchart-link {
  stroke: #94a3b8 !important;
  stroke-width: 1.8px !important;
}

/* Arrowheads */
.oj-mermaid-flowchart marker path,
.oj-mermaid-flowchart .marker {
  fill: #94a3b8 !important;
  stroke: #94a3b8 !important;
}

/* Edge label background */
.oj-mermaid-flowchart .edgeLabel rect,
.oj-mermaid-flowchart .edgeLabel .labelBkg {
  fill: rgba(255, 255, 255, 0.9) !important;
  stroke: #e2e8f0 !important;
}

/* Edge label text */
.oj-mermaid-flowchart .edgeLabel,
.oj-mermaid-flowchart .edgeLabel span,
.oj-mermaid-flowchart .edgeLabel p {
  color: #475569 !important;
  font-weight: 600 !important;
}
`

const svgNamespace = "http://www.w3.org/2000/svg"

function applyFlowchartDisplayStyle(container: HTMLElement) {
  container.classList.add("oj-mermaid-surface")

  const svg = container.querySelector("svg")
  if (!svg) return

  svg.classList.add("oj-mermaid-flowchart")

  svg.querySelector(`#${displayStyleId}`)?.remove()
  const style = document.createElementNS(svgNamespace, "style")
  style.setAttribute("id", displayStyleId)
  style.textContent = mermaidDisplayStyle
  svg.insertBefore(style, svg.firstChild)
}

let mermaidInstance: any = null

async function loadMermaid() {
  if (!mermaidInstance) {
    const mermaidModule = await import("mermaid")
    mermaidInstance = mermaidModule.default
    mermaidInstance.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      theme: "base",
      themeVariables: mermaidThemeVariables,
    })
  }
  return mermaidInstance
}

export function useMermaid() {
  const renderError = ref<string | null>(null)
  const renderSuccess = ref(false)

  const renderFlowchart = async (
    container: HTMLElement | null,
    mermaidCode: string,
  ) => {
    renderError.value = null
    renderSuccess.value = false

    if (container) container.innerHTML = ""

    if (!container || !mermaidCode?.trim()) return

    try {
      const m = await loadMermaid()
      const id = `mermaid-${getRandomId()}`
      const { svg } = await m.render(id, mermaidCode)
      container.innerHTML = svg
      applyFlowchartDisplayStyle(container)
      renderSuccess.value = true
    } catch (error) {
      renderError.value =
        error instanceof Error
          ? error.message
          : "流程图渲染失败，请检查代码格式"
    }
  }

  const clearError = () => {
    renderError.value = null
  }

  return {
    renderError: readonly(renderError),
    renderSuccess: readonly(renderSuccess),
    renderFlowchart,
    clearError,
  }
}
