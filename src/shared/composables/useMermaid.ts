import { getRandomId } from "utils/functions"

const mermaidThemeVariables = {
  primaryColor: "#e4e8eb",
  primaryTextColor: "#1e2a35",
  primaryBorderColor: "#6b8096",
  lineColor: "#7a8a96",
  secondaryColor: "#e8e4eb",
  tertiaryColor: "#e4ebe6",
  background: "#ffffff",
  mainBkg: "#f5f5f4",
  secondBkg: "#f0f0ef",
  tertiaryBkg: "#f0f2f0",
  nodeBorder: "#6b8096",
  clusterBkg: "#f5f5f4",
  clusterBorder: "#c8cdd2",
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
  filter: drop-shadow(0 3px 6px rgba(15, 23, 42, 0.07));
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
  fill: #e2ebe4 !important;
  stroke: #527557 !important;
}

.oj-mermaid-flowchart g.node.endNode rect,
.oj-mermaid-flowchart g.node.endNode polygon,
.oj-mermaid-flowchart g.node.endNode ellipse,
.oj-mermaid-flowchart g.node.endNode circle,
.oj-mermaid-flowchart g.node.endNode path {
  fill: #ebe2e2 !important;
  stroke: #755252 !important;
}

.oj-mermaid-flowchart g.node.input rect,
.oj-mermaid-flowchart g.node.input polygon,
.oj-mermaid-flowchart g.node.input ellipse,
.oj-mermaid-flowchart g.node.input circle,
.oj-mermaid-flowchart g.node.input path {
  fill: #e2e6eb !important;
  stroke: #526075 !important;
}

.oj-mermaid-flowchart g.node.output rect,
.oj-mermaid-flowchart g.node.output polygon,
.oj-mermaid-flowchart g.node.output ellipse,
.oj-mermaid-flowchart g.node.output circle,
.oj-mermaid-flowchart g.node.output path {
  fill: #e8e2eb !important;
  stroke: #665275 !important;
}

.oj-mermaid-flowchart g.node.process rect,
.oj-mermaid-flowchart g.node.process polygon,
.oj-mermaid-flowchart g.node.process ellipse,
.oj-mermaid-flowchart g.node.process circle,
.oj-mermaid-flowchart g.node.process path {
  fill: #e2e9eb !important;
  stroke: #526b75 !important;
}

.oj-mermaid-flowchart g.node.decision rect,
.oj-mermaid-flowchart g.node.decision polygon,
.oj-mermaid-flowchart g.node.decision ellipse,
.oj-mermaid-flowchart g.node.decision circle,
.oj-mermaid-flowchart g.node.decision path {
  fill: #ebe7e2 !important;
  stroke: #75695a !important;
}

.oj-mermaid-flowchart g.node.loop rect,
.oj-mermaid-flowchart g.node.loop polygon,
.oj-mermaid-flowchart g.node.loop ellipse,
.oj-mermaid-flowchart g.node.loop circle,
.oj-mermaid-flowchart g.node.loop path {
  fill: #e7e2eb !important;
  stroke: #63527a !important;
}

.oj-mermaid-flowchart g.node.oj-node-palette-0 rect,
.oj-mermaid-flowchart g.node.oj-node-palette-0 polygon,
.oj-mermaid-flowchart g.node.oj-node-palette-0 ellipse,
.oj-mermaid-flowchart g.node.oj-node-palette-0 circle,
.oj-mermaid-flowchart g.node.oj-node-palette-0 path {
  fill: #e2e6eb !important;
  stroke: #526075 !important;
}

.oj-mermaid-flowchart g.node.oj-node-palette-1 rect,
.oj-mermaid-flowchart g.node.oj-node-palette-1 polygon,
.oj-mermaid-flowchart g.node.oj-node-palette-1 ellipse,
.oj-mermaid-flowchart g.node.oj-node-palette-1 circle,
.oj-mermaid-flowchart g.node.oj-node-palette-1 path {
  fill: #e2ebe6 !important;
  stroke: #527563 !important;
}

.oj-mermaid-flowchart g.node.oj-node-palette-2 rect,
.oj-mermaid-flowchart g.node.oj-node-palette-2 polygon,
.oj-mermaid-flowchart g.node.oj-node-palette-2 ellipse,
.oj-mermaid-flowchart g.node.oj-node-palette-2 circle,
.oj-mermaid-flowchart g.node.oj-node-palette-2 path {
  fill: #e8e2eb !important;
  stroke: #665275 !important;
}

.oj-mermaid-flowchart g.node.oj-node-palette-3 rect,
.oj-mermaid-flowchart g.node.oj-node-palette-3 polygon,
.oj-mermaid-flowchart g.node.oj-node-palette-3 ellipse,
.oj-mermaid-flowchart g.node.oj-node-palette-3 circle,
.oj-mermaid-flowchart g.node.oj-node-palette-3 path {
  fill: #ebe2e6 !important;
  stroke: #75606a !important;
}

.oj-mermaid-flowchart g.node.oj-node-palette-4 rect,
.oj-mermaid-flowchart g.node.oj-node-palette-4 polygon,
.oj-mermaid-flowchart g.node.oj-node-palette-4 ellipse,
.oj-mermaid-flowchart g.node.oj-node-palette-4 circle,
.oj-mermaid-flowchart g.node.oj-node-palette-4 path {
  fill: #ebe7e2 !important;
  stroke: #75695a !important;
}

.oj-mermaid-flowchart g.node.oj-node-palette-5 rect,
.oj-mermaid-flowchart g.node.oj-node-palette-5 polygon,
.oj-mermaid-flowchart g.node.oj-node-palette-5 ellipse,
.oj-mermaid-flowchart g.node.oj-node-palette-5 circle,
.oj-mermaid-flowchart g.node.oj-node-palette-5 path {
  fill: #e4ebe2 !important;
  stroke: #5a7552 !important;
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
