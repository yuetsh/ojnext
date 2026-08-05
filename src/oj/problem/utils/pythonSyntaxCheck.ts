export interface PythonSyntaxError {
  line: number
}

let skulptPromise: Promise<any> | null = null

/**
 * 按需加载 Skulpt（约 233KB gzip），只在提交 Python3 代码时才下载。
 * 结果缓存，同一页面只加载一次。
 */
function loadSkulpt(): Promise<any> {
  if (!skulptPromise) {
    // @ts-ignore - skulpt has no type definitions
    skulptPromise = import("skulpt").then((m) => m.default ?? m)
  }
  return skulptPromise
}

/**
 * 提前把 Skulpt 拉下来，避免点提交时才开始下载。
 * 失败不影响功能，提交时会再试一次。
 */
export function prefetchPythonSyntaxChecker() {
  loadSkulpt().catch(() => {
    skulptPromise = null
  })
}

/**
 * 用 Skulpt 检测 Python 代码中的语法错误。
 * 只编译不执行，不受 input() 等 IO 调用影响。
 * 加载失败时返回 null（放行提交），交给后端判题兜底。
 */
export async function checkPythonSyntax(
  code: string,
): Promise<PythonSyntaxError | null> {
  let Sk: any
  try {
    Sk = await loadSkulpt()
  } catch {
    skulptPromise = null
    return null
  }

  Sk.configure({ output: () => {} })
  try {
    Sk.compile(code, "prog.py", "exec")
    return null
  } catch (e: any) {
    const line: number = e?.traceback?.[0]?.lineno ?? 1
    return { line }
  }
}
