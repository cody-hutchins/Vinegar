const hasOwnProperty = Object.prototype.hasOwnProperty

module.exports = function (env) {
  const clean = {}

  for (const k in env) {
    if (!hasOwnProperty.call(env, k)) continue
    if (/^npm_/i.test(k)) continue

    clean[k] = env[k]
  }

  return clean
}
