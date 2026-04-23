import { Exercise } from "utils/types"

type Segment =
  | { type: "md"; content: string }
  | { type: "exercise"; exercise: Exercise }

export function parseExercises(content: string, exercises: Exercise[]): Segment[] {
  const exerciseMap = new Map(exercises.map((e) => [e.id, e]))
  const segments: Segment[] = []
  const regex = /\[\[exercise:(\d+)\]\]/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "md", content: content.slice(lastIndex, match.index) })
    }
    const id = parseInt(match[1])
    const exercise = exerciseMap.get(id)
    if (exercise) {
      segments.push({ type: "exercise", exercise })
    }
    lastIndex = regex.lastIndex
  }

  if (lastIndex < content.length) {
    segments.push({ type: "md", content: content.slice(lastIndex) })
  }

  return segments
}
