export type LANGUAGE =
  | "C"
  | "C++"
  | "Python2"
  | "Python3"
  | "Java"
  | "JavaScript"
  | "Golang"

export interface Problem {
  _id: string
  id: number
  tags: string[]
  created_by: {
    id: number
    username: string
    real_name: null
  }
  template: { [key in LANGUAGE]?: string }
  title: string
  description: string
  input_description: string
  output_description: string
  samples: {
    input: string
    output: string
  }[]
  hint: string
  languages: Array<LANGUAGE>
  create_time: Date
  last_update_time: null
  time_limit: number
  memory_limit: number
  io_mode: {
    input: string
    output: string
    io_mode: string
  }
  spj: boolean
  spj_language: null
  rule_type: string
  difficulty: "Low" | "Mid" | "High"
  source: string
  total_score: number
  submission_number: number
  accepted_number: number
  statistic_info: {}
  share_submission: boolean
  contest: null
  my_status: number
}

export interface SubmitCodePayload {
  problem_id: number
  language: LANGUAGE
  code: string
  contest_id?: number
}
