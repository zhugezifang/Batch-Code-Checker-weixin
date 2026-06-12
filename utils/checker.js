function normalizeCodes(input) {
  return String(input || '')
    .split(/[\n,，;；\s]+/)
    .map((code) => code.trim())
    .filter(Boolean)
}

function checkCode(code, index, seen) {
  const formatOk = /^[A-Za-z0-9_-]{4,32}$/.test(code)
  const duplicate = seen.has(code)

  if (!duplicate) {
    seen.add(code)
  }

  return {
    id: `${index}-${code}`,
    code,
    status: formatOk && !duplicate ? 'pass' : 'fail',
    message: duplicate ? '重复' : formatOk ? '格式正确' : '格式异常'
  }
}

function checkCodes(input) {
  const seen = new Set()
  return normalizeCodes(input).map((code, index) => checkCode(code, index, seen))
}

function summarize(results) {
  return results.reduce(
    (summary, item) => {
      summary.total += 1
      if (item.status === 'pass') {
        summary.pass += 1
      } else {
        summary.fail += 1
      }
      return summary
    },
    { total: 0, pass: 0, fail: 0 }
  )
}

module.exports = {
  normalizeCodes,
  checkCodes,
  summarize
}
