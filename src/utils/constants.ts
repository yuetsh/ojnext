export const JUDGE_STATUS = {
  "-2": {
    name: "Compile Error",
    short: "CE",
    color: "yellow",
    type: "warning",
  },
  "-1": {
    name: "Wrong Answer",
    short: "WA",
    color: "red",
    type: "error",
  },
  "0": {
    name: "Accepted",
    short: "AC",
    color: "green",
    type: "success",
  },
  "1": {
    name: "Time Limit Exceeded",
    short: "TLE",
    color: "red",
    type: "error",
  },
  "2": {
    name: "Time Limit Exceeded",
    short: "TLE",
    color: "red",
    type: "error",
  },
  "3": {
    name: "Memory Limit Exceeded",
    short: "MLE",
    color: "red",
    type: "error",
  },
  "4": {
    name: "Runtime Error",
    short: "RE",
    color: "red",
    type: "error",
  },
  "5": {
    name: "System Error",
    short: "SE",
    color: "red",
    type: "error",
  },
  "6": {
    name: "Pending",
    color: "yellow",
    type: "warning",
  },
  "7": {
    name: "Judging",
    color: "blue",
    type: "info",
  },
  "8": {
    name: "Partial Accepted",
    short: "PAC",
    color: "blue",
    type: "info",
  },
  "9": {
    name: "Submitting",
    color: "yellow",
    type: "warning",
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
