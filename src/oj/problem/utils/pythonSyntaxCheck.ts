// @ts-ignore - skulpt has no type definitions
import Sk from "skulpt"

export interface PythonSyntaxError {
  line: number
}

/**
 * 用 Skulpt 检测 Python 代码中的语法错误。
 * 只编译不执行，不受 input() 等 IO 调用影响。
 */
export function checkPythonSyntax(code: string): PythonSyntaxError | null {
  Sk.configure({ output: () => {} })
  try {
    Sk.compile(code, "prog.py", "exec")
    return null
  } catch (e: any) {
    const line: number = e?.traceback?.[0]?.lineno ?? 1
    return { line }
  }
}
