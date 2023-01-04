import { getACRate } from "./../utils/functions";
import http from "./../utils/http";

const difficultDict = {
  Low: "简单",
  Mid: "中等",
  High: "困难",
};

function filterResult(result: any) {
  const newResult = {
    displayID: result._id,
    title: result.title,
    difficulty: difficultDict[<"Low" | "Mid" | "High">result.difficulty],
    tags: result.tags,
    submission: result.submission_number,
    rate: getACRate(result.accepted_number, result.submission_number),
  };
  return newResult;
}

export async function getProblemList(
  offset = 0,
  limit = 10,
  searchParams: any = {}
) {
  let params: any = {
    paging: true,
    offset,
    limit,
  };
  Object.keys(searchParams).forEach((element) => {
    if (searchParams[element]) {
      params[element] = searchParams[element];
    }
  });
  const res = await http.get("problem", {
    params,
  });
  return {
    results: res.data.results.map(filterResult),
    total: res.data.total,
  };
}

export function getProblemTagList() {
  return http.get("problem/tags");
}

export function getProblem(id: number) {
  return http.get("problem", {
    params: { problem_id: id },
  });
}

export function getWebsite() {
  return http.get("website");
}
