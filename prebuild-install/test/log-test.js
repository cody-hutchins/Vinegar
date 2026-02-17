const test = require('tape')
const Logger = require('../log')

test('log.level defaults to notice if npm_config_loglevel is not set', function (t) {
  const log = Logger({}, {})
  t.is(log.level, 'notice')
  t.end()
})

test('log.level respects npm_config_loglevel', function (t) {
  const log = Logger({}, { npm_config_loglevel: 'info' })
  t.is(log.level, 'info')
  t.end()
})

test('log.level is verbose if rc.verbose', function (t) {
  const log = Logger({ verbose: true }, {})
  t.is(log.level, 'verbose')
  t.end()
})
