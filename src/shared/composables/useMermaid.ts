import { getRandomId } from "utils/functions"

const mermaidThemeVariables = {
  primaryColor: "#e0f2fe",
  primaryTextColor: "#0f172a",
  primaryBorderColor: "#0284c7",
  lineColor: "#64748b",
  secondaryColor: "#f5f3ff",
  tertiaryColor: "#ecfdf5",
  background: "#ffffff",
  mainBkg: "#f8fafc",
  secondBkg: "#eef2ff",
  tertiaryBkg: "#f0fdfa",
  nodeBorder: "#2563eb",
  clusterBkg: "#f8fafc",
  clusterBorder: "#cbd5e1",
  edgeLabelBackground: "#ffffff",
  fontFamily:
    'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
}

const semanticNodeClasses = [
  "startNode",
  "endNode",
  "startEnd",
  "input",
  "output",
  "process",
  "decision",
  "loop",
]

const displayStyleId = "oj-mermaid-display-style"

const mermaidDisplayStyle = `
.oj-mermaid-flowchart {
  max-width: 100%;
  height: auto;
}

.oj-mermaid-flowchart g.node rect,
.oj-mermaid-flowchart g.node polygon,
.oj-mermaid-flowchart g.node ellipse,
.oj-mermaid-flowchart g.node circle,
.oj-mermaid-flowchart g.node path {
  stroke-width: 2px !important;
  filter: drop-shadow(0 6px 12px rgba(15, 23, 42, 0.12));
}

.oj-mermaid-flowchart g.node.startNode rect,
.oj-mermaid-flowchart g.node.startNode polygon,
.oj-mermaid-flowchart g.node.startNode ellipse,
.oj-mermaid-flowchart g.node.startNode circle,
.oj-mermaid-flowchart g.node.startNode path,
.oj-mermaid-flowchart g.node.startEnd rect,
.oj-mermaid-flowchart g.node.startEnd polygon,
.oj-mermaid-flowchart g.node.startEnd ellipse,
.oj-mermaid-flowchart g.node.startEnd circle,
.oj-mermaid-flowchart g.node.startEnd path {
  fill: #dcfce7 !important;
  stroke: #16a34a !important;
}

.oj-mermaid-flowchart g.node.endNode rect,
.oj-mermaid-flowchart g.node.endNode polygon,
.oj-mermaid-flowchart g.node.endNode ellipse,
.oj-mermaid-flowchart g.node.endNode circle,
.oj-mermaid-flowchart g.node.endNode path {
  fill: #fee2e2 !important;
  stroke: #dc2626 !important;
}

.oj-mermaid-flowchart g.node.input rect,
.oj-mermaid-flowchart g.node.input polygon,
.oj-mermaid-flowchart g.node.input ellipse,
.oj-mermaid-flowchart g.node.input circle,
.oj-mermaid-flowchart g.node.input path {
  fill: #dbeafe !important;
  stroke: #2563eb !important;
}

.oj-mermaid-flowchart g.node.output rect,
.oj-mermaid-flowchart g.node.output polygon,
.oj-mermaid-flowchart g.node.output ellipse,
.oj-mermaid-flowchart g.node.output circle,
.oj-mermaid-flowchart g.node.output path {
  fill: #ede9fe !important;
  stroke: #7c3aed !important;
}

.oj-mermaid-flowchart g.node.process rect,
.oj-mermaid-flowchart g.node.process polygon,
.oj-mermaid-flowchart g.node.process ellipse,
.oj-mermaid-flowchart g.node.process circle,
.oj-mermaid-flowchart g.node.process path {
  fill: #f0f9ff !important;
  stroke: #0284c7 !important;
}

.oj-mermaid-flowchart g.node.decision rect,
.oj-mermaid-flowchart g.node.decision polygon,
.oj-mermaid-flowchart g.node.decision ellipse,
.oj-mermaid-flowchart g.node.decision circle,
.oj-mermaid-flowchart g.node.decision path {
  fill: #fef3c7 !important;
  stroke: #d97706 !important;
}

.oj-mermaid-flowchart g.node.loop rect,
.oj-mermaid-flowchart g.node.loop polygon,
.oj-mermaid-flowchart g.node.loop ellipse,
.oj-mermaid-flowchart g.node.loop circle,
.oj-mermaid-flowchart g.node.loop path {
  fill: #fae8ff !important;
  stroke: #c026d3 !important;
}

.oj-mermaid-flowchart g.node.oj-node-palette-0 rect,
.oj-mermaid-flowchart g.node.oj-node-palette-0 polygon,
.oj-mermaid-flowchart g.node.oj-node-palette-0 ellipse,
.oj-mermaid-flowchart g.node.oj-node-palette-0 circle,
.oj-mermaid-flowchart g.node.oj-node-palette-0 path {
  fill: #dbeafe !important;
  stroke: #2563eb !important;
}

.oj-mermaid-flowchart g.node.oj-node-palette-1 rect,
.oj-mermaid-flowchart g.node.oj-node-palette-1 polygon,
.oj-mermaid-flowchart g.node.oj-node-palette-1 ellipse,
.oj-mermaid-flowchart g.node.oj-node-palette-1 circle,
.oj-mermaid-flowchart g.node.oj-node-palette-1 path {
  fill: #ccfbf1 !important;
  stroke: #0d9488 !important;
}

.oj-mermaid-flowchart g.node.oj-node-palette-2 rect,
.oj-mermaid-flowchart g.node.oj-node-palette-2 polygon,
.oj-mermaid-flowchart g.node.oj-node-palette-2 ellipse,
.oj-mermaid-flowchart g.node.oj-node-palette-2 circle,
.oj-mermaid-flowchart g.node.oj-node-palette-2 path {
  fill: #ede9fe !important;
  stroke: #7c3aed !important;
}

.oj-mermaid-flowchart g.node.oj-node-palette-3 rect,
.oj-mermaid-flowchart g.node.oj-node-palette-3 polygon,
.oj-mermaid-flowchart g.node.oj-node-palette-3 ellipse,
.oj-mermaid-flowchart g.node.oj-node-palette-3 circle,
.oj-mermaid-flowchart g.node.oj-node-palette-3 path {
  fill: #ffe4e6 !important;
  stroke: #e11d48 !important;
}

.oj-mermaid-flowchart g.node.oj-node-palette-4 rect,
.oj-mermaid-flowchart g.node.oj-node-palette-4 polygon,
.oj-mermaid-flowchart g.node.oj-node-palette-4 ellipse,
.oj-mermaid-flowchart g.node.oj-node-palette-4 circle,
.oj-mermaid-flowchart g.node.oj-node-palette-4 path {
  fill: #fef3c7 !important;
  stroke: #d97706 !important;
}

.oj-mermaid-flowchart g.node.oj-node-palette-5 rect,
.oj-mermaid-flowchart g.node.oj-node-palette-5 polygon,
.oj-mermaid-flowchart g.node.oj-node-palette-5 ellipse,
.oj-mermaid-flowchart g.node.oj-node-palette-5 circle,
.oj-mermaid-flowchart g.node.oj-node-palette-5 path {
  fill: #dcfce7 !important;
  stroke: #16a34a !important;
}

.oj-mermaid-flowchart g.node .label,
.oj-mermaid-flowchart g.node .nodeLabel,
.oj-mermaid-flowchart g.node .nodeLabel p,
.oj-mermaid-flowchart g.node .label span {
  color: #0f172a !important;
  fill: #0f172a !important;
  font-weight: 650 !important;
}

.oj-mermaid-flowchart .edgePaths path.path,
.oj-mermaid-flowchart .flowchart-link {
  stroke: #64748b !important;
  stroke-width: 2.4px !important;
}

.oj-mermaid-flowchart marker path,
.oj-mermaid-flowchart .marker {
  fill: #64748b !important;
  stroke: #64748b !important;
}

.oj-mermaid-flowchart .edgeLabel rect,
.oj-mermaid-flowchart .edgeLabel .labelBkg {
  fill: rgba(255, 255, 255, 0.94) !important;
  stroke: #cbd5e1 !important;
}

.oj-mermaid-flowchart .edgeLabel,
.oj-mermaid-flowchart .edgeLabel span,
.oj-mermaid-flowchart .edgeLabel p {
  color: #334155 !important;
  font-weight: 600 !important;
}
`

const svgNamespace = "http://www.w3.org/2000/svg"

function getNodeLabel(node: SVGGElement): string {
  const el =
    node.querySelector(".nodeLabel p") ||
    node.querySelector(".nodeLabel") ||
    node.querySelector(".label span") ||
    node.querySelector(".label")
  return el?.textContent?.trim() ?? ""
}

function applyFlowchartDisplayStyle(container: HTMLElement) {
  container.classList.add("oj-mermaid-surface")

  const svg = container.querySelector("svg")
  if (!svg) return

  svg.classList.add("oj-mermaid-flowchart")

  const nodes = Array.from(svg.querySelectorAll<SVGGElement>("g.node"))

  // Assign palette indices by label so same label → same color, different labels → different colors
  const labelPaletteMap = new Map<string, number>()
  let paletteCounter = 0

  nodes.forEach((node) => {
    const hasSemanticClass = semanticNodeClasses.some((className) =>
      node.classList.contains(className),
    )
    if (!hasSemanticClass) {
      const label = getNodeLabel(node)
      if (!labelPaletteMap.has(label)) {
        labelPaletteMap.set(label, paletteCounter % 6)
        paletteCounter++
      }
      node.classList.add(`oj-node-palette-${labelPaletteMap.get(label)}`)
    }
  })

  svg.querySelector(`#${displayStyleId}`)?.remove()
  const style = document.createElementNS(svgNamespace, "style")
  style.setAttribute("id", displayStyleId)
  style.textContent = mermaidDisplayStyle
  svg.insertBefore(style, svg.firstChild)
}

function getChromeVersion(): number {
  const match = navigator.userAgent.match(/Chrome\/(\d+)/)
  return match ? parseInt(match[1]) : Infinity
}

let mermaidInstance: any = null

async function loadMermaid() {
  if (!mermaidInstance) {
    const mermaidModule =
      getChromeVersion() < 94
        ? await import("mermaid-legacy")
        : await import("mermaid")
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
  let renderGeneration = 0

  const renderFlowchart = async (
    container: HTMLElement | null,
    mermaidCode: string,
  ) => {
    renderError.value = null
    renderSuccess.value = false

    if (container) container.innerHTML = ""

    if (!container || !mermaidCode?.trim()) return

    const gen = ++renderGeneration
    try {
      const m = await loadMermaid()
      const id = `mermaid-${getRandomId()}`
      const { svg } = await m.render(id, mermaidCode)
      if (gen !== renderGeneration) return
      container.innerHTML = svg
      applyFlowchartDisplayStyle(container)
      renderSuccess.value = true
    } catch (error) {
      if (gen !== renderGeneration) return
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
