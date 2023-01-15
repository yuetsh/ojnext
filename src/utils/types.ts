export type LANGUAGE =
  | "C"
  | "C++"
  | "Python2"
  | "Python3"
  | "Java"
  | "JavaScript"
  | "Golang"

export type SUBMISSION_RESULT = -2 | -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

export type ProblemStatus = "passed" | "failed" | "not_test"

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

export interface Code {
  language: LANGUAGE
  value: string
}

export interface SubmitCodePayload {
  problem_id: number
  language: LANGUAGE
  code: string
  contest_id?: number
}

interface Info {
  err: string | null
  data: {
    error: number
    memory: number
    output: null
    result: SUBMISSION_RESULT
    signal: number
    cpu_time: number
    exit_code: number
    real_time: number
    test_case: string
    output_md5: string
  }[]
}

export interface Submission {
  id: string
  create_time: Date
  user_id: number
  username: string
  code: string
  result: SUBMISSION_RESULT
  info: Info
  language: string
  shared: boolean
  statistic_info: {
    score: number
    err_info: string
  }
  ip: string
  // TODO: 这里不知道是什么
  contest: null
  problem: number
  can_unshare: boolean
}

export interface SubmissionListPayload {
  myself?: "1" | "0"
  result?: SUBMISSION_RESULT
  username?: string
  contest_id?: string
  problem_id?: string
  page: number
  limit: number
  offset: number
}
