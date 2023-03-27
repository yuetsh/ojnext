import { ContestStatus, ContestType } from "./constants"

export interface Profile {
  id: number
  user: User
  real_name: string
  acm_problems_status: {
    problems: {
      [key: string]: {
        _id: string
        status: number
      }
    }
  }
  oi_problems_status: {
    problems: {
      [key: string]: {
        _id: string
        score: number
        status: number
      }
    }
  }
  avatar: string
  blog: null
  mood: string
  github: string
  school: string
  major: string
  language: string
  accepted_number: number
  total_score: number
  submission_number: number
}

export interface User {
  id: number
  username: string
  real_name: string
  email: string
  admin_type: "Regular User" | "Super Admin" | "Admin"
  problem_permission: string
  create_time: Date
  last_login: Date
  two_factor_auth: boolean
  open_api: boolean
  is_disabled: boolean
  password?: string
}

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

interface SampleUser {
  id: number
  username: string
  real_name: string | null
}

export interface Tag {
  id: number
  name: string
}

export interface Problem {
  _id: string
  id: number
  tags: string[]
  created_by: SampleUser
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
  spj_language: string
  rule_type: string
  difficulty: "Low" | "Mid" | "High"
  source: string
  total_score: number
  submission_number: number
  accepted_number: number
  statistic_info: { [key in string]: number }
  share_submission: boolean
  contest: null
  my_status: number
  visible: boolean
}

export interface ProblemFiltered {
  _id: string
  id: number
  title: string
  difficulty: "简单" | "中等" | "困难"
  tags: string[]
  submission: number
  rate: string
  status: "not_test" | "passed" | "failed"
}

export interface AdminProblemFiltered {
  _id: string
  id: number
  title: string
  visible: boolean
  username: string
  create_time: string
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
  language: LANGUAGE
  shared: boolean
  show_link: boolean
  statistic_info: {
    score?: number
    err_info?: string
    time_cost?: number
    memory_cost?: number
  }
  ip: string
  // TODO: 这里不知道是什么
  contest: null
  problem: number
  can_unshare: boolean
}

export interface SubmissionListPayload {
  myself?: "1" | "0"
  result?: string
  username?: string
  contest_id?: string
  problem_id?: string
  page: number
  limit: number
  offset: number
}

export interface Rank {
  id: number
  user: SampleUser
  acm_problems_status: {
    problems: {
      [key: string]: {
        _id: string
        status: number
      }
    }
    contest_problems?: {
      [key: string]: {
        [key: string]: {
          _id: string
          status: number
        }
      }
    }
  }
  oi_problems_status: {}
  real_name: null | string
  avatar: string
  blog: null
  mood: null | string
  github: null
  school: null | string
  major: null | string
  language: null | string
  accepted_number: number
  total_score: number
  submission_number: number
}

export interface Contest {
  id: number
  created_by: SampleUser
  status: ContestStatus
  contest_type: ContestType
  title: string
  description: string
  real_time_rank: boolean
  rule_type: "ACM"
  start_time: string
  end_time: string
  create_time: string
  now: string
  last_update_time: string
  visible: boolean
}

interface SubmissionInfo {
  is_ac: boolean
  ac_time: number
  is_first_ac: boolean
  error_number: number
  checked?: boolean
}

export interface ContestRank {
  id: number
  user: SampleUser
  submission_number: number
  accepted_number: number
  total_time: number
  submission_info: { [key: string]: SubmissionInfo }
  contest: number
}
