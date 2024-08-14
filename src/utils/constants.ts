import { SUBMISSION_RESULT } from "./types"

export enum SubmissionStatus {
  compile_error = -2,
  wrong_answer = -1,
  accepted = 0,
  time_limit_exceeded = 1 | 2,
  memory_limit_exceeded = 3,
  runtime_error = 4,
  system_error = 5,
  pending = 6,
  judging = 7,
  partial_accepted = 8,
  submitting = 9,
}

export enum ContestStatus {
  not_started = "1",
  underway = "0",
  finished = "-1",
}

export enum ContestType {
  public = "Public",
  private = "Password Protected",
}

export const JUDGE_STATUS: {
  [key in SUBMISSION_RESULT]: {
    name: string
    type: "error" | "success" | "warning" | "info"
  }
} = {
  "-2": {
    name: "编译失败",
    type: "warning",
  },
  "-1": {
    name: "答案错误",
    type: "error",
  },
  "0": {
    name: "答案正确",
    type: "success",
  },
  "1": {
    name: "运行超时",
    type: "error",
  },
  "2": {
    name: "运行超时",
    type: "error",
  },
  "3": {
    name: "内存超限",
    type: "error",
  },
  "4": {
    name: "运行时错误",
    type: "warning",
  },
  "5": {
    name: "系统错误",
    type: "error",
  },
  "6": {
    name: "等待评分",
    type: "warning",
  },
  "7": {
    name: "正在评分",
    type: "warning",
  },
  "8": {
    name: "部分正确",
    type: "warning",
  },
  "9": {
    name: "正在提交",
    type: "info",
  },
}

export const CONTEST_STATUS: {
  [key in ContestStatus]: {
    name: string
    type: "error" | "success" | "warning"
  }
} = {
  "1": {
    name: "未开始",
    type: "warning",
  },
  "0": {
    name: "进行中",
    type: "success",
  },
  "-1": {
    name: "已结束",
    type: "error",
  },
}

export const CONTEST_TYPE = {
  PUBLIC: "Public",
  PRIVATE: "Password Protected",
}

export const USER_TYPE = {
  REGULAR_USER: "Regular User",
  ADMIN: "Admin",
  SUPER_ADMIN: "Super Admin",
}

export const PROBLEM_PERMISSION = {
  NONE: "None",
  OWN: "Own",
  ALL: "All",
}

export const STORAGE_KEY = {
  AUTHED: "authed",
  LANGUAGE: "problemLanguage",
  ADMIN_PROBLEM: "adminProblem",
  ADMIN_PROBLEM_TAGS: "adminProblemTags",
}

export const DIFFICULTY = {
  Low: "简单",
  Mid: "中等",
  High: "困难",
}

const cSource =
  '#include<stdio.h>\r\n\r\nint main()\r\n{\r\n    printf("黄岩一职");\r\n    return 0;\r\n}'
const cppSource =
  '#include<iostream>\r\n\r\nusing namespace std;\r\n\r\nint main()\r\n{\r\n    cout<<"黄岩一职"<<endl;\r\n    return 0;\r\n}'
const pythonSource = 'print("黄岩一职")'
const javaSource =
  'public class Main {\r\n    public static void main(String[] args) {\r\n        System.out.println("黄岩一职");\r\n    }\r\n}'

export const SOURCES = {
  C: cSource,
  "C++": cppSource,
  Java: javaSource,
  Python3: pythonSource,
  Python2: "",
  JavaScript: "",
  Golang: "",
}

export const LANGUAGE_ID = {
  C: 50,
  "C++": 54,
  Java: 62,
  Python3: 71,
  Python2: 0,
  JavaScript: 0,
  Golang: 0,
}

export const DEAD_RESULTS = {
  C: {
    encoded:
      "I2luY2x1ZGU8c3RkaW8uaD4NCg0KaW50IG1haW4oKQ0Kew0KICAgIHByaW50Zigi6buE5bKp5LiA6IGMIik7DQogICAgcmV0dXJuIDA7DQp9",
    result: {
      status: 3,
      output: "黄岩一职",
    },
  },
  "C++": {
    encoded:
      "I2luY2x1ZGU8aW9zdHJlYW0+DQoNCnVzaW5nIG5hbWVzcGFjZSBzdGQ7DQoNCmludCBtYWluKCkNCnsNCiAgICBjb3V0PDwi6buE5bKp5LiA6IGMIjw8ZW5kbDsNCiAgICByZXR1cm4gMDsNCn0=",
    result: {
      status: 3,
      output: "黄岩一职",
    },
  },
  Java: {
    encoded:
      "cHVibGljIGNsYXNzIE1haW4gew0KICAgIHB1YmxpYyBzdGF0aWMgdm9pZCBtYWluKFN0cmluZ1tdIGFyZ3MpIHsNCiAgICAgICAgU3lzdGVtLm91dC5wcmludGxuKCLpu4TlsqnkuIDogYwiKTsNCiAgICB9DQp9",
    result: {
      status: 3,
      output: "黄岩一职",
    },
  },
  Python3: {
    encoded: "cHJpbnQoIum7hOWyqeS4gOiBjCIp",
    result: {
      status: 3,
      output: "黄岩一职",
    },
  },
  Python2: {
    encoded: "",
    result: {
      status: 3,
      output: "黄岩一职",
    },
  },
  Golang: {
    encoded: "",
    result: {
      status: 3,
      output: "黄岩一职",
    },
  },
  JavaScript: {
    encoded: "",
    result: {
      status: 3,
      output: "黄岩一职",
    },
  },
}

export const LANGUAGE_FORMAT_VALUE = {
  C: "c",
  "C++": "cpp",
  Java: "java",
  Python2: "python",
  Python3: "python",
  JavaScript: "javascript",
  Golang: "go",
}

export const LANGUAGE_SHOW_VALUE = {
  C: "C",
  "C++": "C++",
  Java: "Java",
  Python2: "Python",
  Python3: "Python",
  JavaScript: "JS",
  Golang: "Go",
}

const cTemplate = `//TEMPLATE BEGIN
#include <stdio.h>

int main() {
  printf("黄岩一职");
  return 0;
}
//TEMPLATE END`

const cppTemplate = `//TEMPLATE BEGIN
#include <iostream>

int main() {
  return 0;
}
//TEMPLATE END`

const blankTemplate = `//PREPEND BEGIN
//PREPEND END

//TEMPLATE BEGIN
//TEMPLATE END

//APPEND BEGIN
//APPEND END`

export const CODE_TEMPLATES = {
  C: cTemplate,
  "C++": cppTemplate,
  Python2: blankTemplate,
  Python3: blankTemplate,
  Java: blankTemplate,
  JavaScript: blankTemplate,
  Golang: blankTemplate,
}

export enum ScreenMode {
  both = "题目 | 自测",
  code = "仅自测",
  problem = "仅题目",
}

const AVATARS = [
  "streamline-emojis:man-with-chinese-cap-1",
  "streamline-emojis:cat-face",
  "streamline-emojis:china",
  "streamline-emojis:chicken",
  "streamline-emojis:eyes",
  "streamline-emojis:elephant",
  "streamline-emojis:hear-no-evil-monkey",
  "streamline-emojis:panda-face",
  "streamline-emojis:penguin-1",
  "streamline-emojis:rooster",
  "streamline-emojis:star-struck-1",
  "streamline-emojis:tomato",
  "streamline-emojis:rocket",
  "streamline-emojis:sparkles",
  "streamline-emojis:money-bag",
  "streamline-emojis:ghost",
  "streamline-emojis:game-dice",
  "streamline-emojis:ewe-1",
  "streamline-emojis:artist-palette",
  "streamline-emojis:baby-bottle",
]

export const avatar = ref(AVATARS[Math.floor(Math.random() * AVATARS.length)])

export function getRandomAvatar() {
  avatar.value = AVATARS[Math.floor(Math.random() * AVATARS.length)]
}

export enum ChartType {
  Rank,
  Activity,
}
