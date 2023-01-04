export function getACRate(acCount: number, totalCount: number) {
  let rate = totalCount === 0 ? 0.0 : ((acCount / totalCount) * 100).toFixed(2)
  return `${rate}%`
}

export function filterEmptyValue(object: any) {
  let query: any = {}
  Object.keys(object).forEach((key) => {
    if (object[key] || object[key] === 0 || object[key] === false) {
      query[key] = object[key]
    }
  })
  return query
}
