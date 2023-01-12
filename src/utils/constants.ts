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

export const JUDGE_STATUS = {
  "-2": {
    name: "编译失败",
    type: "danger",
    alertType: "error",
  },
  "-1": {
    name: "答案错误",
    type: "danger",
    alertType: "error",
  },
  "0": {
    name: "答案正确",
    type: "success",
    alertType: "success",
  },
  "1": {
    name: "运行超时",
    type: "danger",
    alertType: "error",
  },
  "2": {
    name: "运行超时",
    type: "danger",
    alertType: "error",
  },
  "3": {
    name: "内存超限",
    type: "danger",
    alertType: "error",
  },
  "4": {
    name: "运行时错误",
    type: "danger",
    alertType: "error",
  },
  "5": {
    name: "系统错误",
    type: "danger",
    alertType: "error",
  },
  "6": {
    name: "等待评分",
    type: "warning",
    alertType: "warning",
  },
  "7": {
    name: "正在评分",
    type: "warning",
    alertType: "warning",
  },
  "8": {
    name: "部分正确",
    type: "warning",
    alertType: "warning",
  },
  "9": {
    name: "正在提交",
    type: "info",
    alertType: "info",
  },
}

export const CONTEST_STATUS = {
  NOT_START: "1",
  UNDERWAY: "0",
  ENDED: "-1",
}

export const CONTEST_STATUS_REVERSE = {
  "1": {
    name: "Not Started",
    color: "yellow",
  },
  "0": {
    name: "Underway",
    color: "green",
  },
  "-1": {
    name: "Ended",
    color: "red",
  },
}

export const RULE_TYPE = {
  ACM: "ACM",
  OI: "OI",
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
  PROBLEM_CODE: "problemCode",
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

export const LANGUAGE_LABEL = {
  C: "C",
  "C++": "C++",
  Java: "Java",
  Python2: "Python2",
  Python3: "Python",
  JavaScript: "JS",
  Golang: "Go",
}

export const LANGUAGE_VALUE = {
  C: "c",
  "C++": "cpp",
  Java: "java",
  Python2: "python",
  Python3: "python",
  JavaScript: "javascript",
  Golang: "go",
}
