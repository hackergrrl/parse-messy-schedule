var test = require('tape')
var parse = require('../')

test('one-off event', function (t) {
  var str = 'DMV tomorrow at 10:30'
  var ev = parse(str, { created: new Date('2015-12-10 03:00') })
  t.equal(
    ev.next('2015-12-10 03:00').toString().replace(/ GMT.*/, ''),
    'Fri Dec 11 2015 10:30:00'
  )
  t.equal(
    ev.next('2015-12-11 10:00').toString().replace(/ GMT.*/, ''),
    'Fri Dec 11 2015 10:30:00'
  )
  t.equal(ev.next('2015-12-11 11:00'), null)
  t.end()
})
