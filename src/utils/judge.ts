import axios from "axios"
import { decode, encode } from "./functions"
import { Code } from "./types"

const http = axios.create({ baseURL: `https://judge0api.xuyue.cc` })

export async function createTestSubmission(code: Code, input: string) {
  const encodedCode = encode(code.value)
  const id = {
    C: 50,
    "C++": 54,
    Java: 62,
    Golang: 60,
    JavaScript: 63,
    Python2: 70,
    Python3: 71,
  }[code.language]
  let compilerOptions = ""
  if (id === 50) compilerOptions = "-lm" // 解决 GCC 的链接问题
  const payload = {
    source_code: encodedCode,
    language_id: id,
    stdin: encode(input),
    redirect_stderr_to_stdout: true,
    compiler_options: compilerOptions,
  }
  const response = await http.post("/submissions", payload, {
    params: { base64_encoded: true, wait: true },
  })
  const data = response.data
  return {
    status: data.status && data.status.id,
    output: [decode(data.compile_output), decode(data.stdout)]
      .join("\n")
      .trim(),
  }
}
