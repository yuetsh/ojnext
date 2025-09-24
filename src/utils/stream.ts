export interface JSONEventStreamHandlers<T = any> {
  onMessage: (data: T, event?: string) => void
  onEvent?: (event: string) => void
  signal?: AbortSignal | null
}

export async function consumeJSONEventStream<T = any>(
  response: Response,
  handlers: JSONEventStreamHandlers<T>,
) {
  if (!response.body) {
    throw new Error("当前环境不支持可读流")
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder("utf-8")
  let buffer = ""

  const { onMessage, onEvent, signal } = handlers

  const handleEvent = (raw: string) => {
    const lines = raw.split("\n")
    let eventName: string | undefined
    const dataLines: string[] = []

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue
      if (trimmed.startsWith("event:")) {
        eventName = trimmed.slice(6).trim()
      } else if (trimmed.startsWith("data:")) {
        dataLines.push(trimmed.slice(5).trim())
      }
    }

    if (dataLines.length === 0) {
      if (eventName && onEvent) {
        onEvent(eventName)
      }
      return
    }

    const payloadStr = dataLines.join("\n")

    let parsed: T
    try {
      parsed = JSON.parse(payloadStr)
    } catch (error) {
      throw new Error(`无法解析服务端事件数据: ${payloadStr}`)
    }

    onMessage(parsed, eventName)
  }

  const processBuffer = (flush = false) => {
    let idx = buffer.indexOf("\n\n")
    while (idx !== -1) {
      const rawEvent = buffer.slice(0, idx)
      buffer = buffer.slice(idx + 2)
      if (rawEvent.trim()) {
        handleEvent(rawEvent)
      }
      idx = buffer.indexOf("\n\n")
    }

    if (flush && buffer.trim()) {
      handleEvent(buffer.trim())
      buffer = ""
    }
  }

  try {
    while (true) {
      if (signal?.aborted) {
        await reader.cancel()
        break
      }

      const { value, done } = await reader.read()
      if (value) {
        buffer += decoder.decode(value, { stream: true })
        processBuffer()
      }

      if (done) {
        buffer += decoder.decode()
        processBuffer(true)
        break
      }
    }
  } finally {
    reader.releaseLock()
  }
}
