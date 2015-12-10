var test = require('tape')
var parse = require('../')

test('one-off event', function (t) {
  var str = 'DMV tomorrow at 10:30'
  var ev = parse(str, { created: new Date('2015-12-10 03:00') })
  t.equal(ev.title, 'DMV')
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

test('thursdays', function (t) {
  var str = 'javascript study group thursdays at 7 pm'
  var ev = parse(str, { created: new Date('2015-12-10 03:00') })
  var n = '2015-12-10 03:00', outputs = []
  for (var i = 0; i < 3; i++) {
    n = ev.next(n)
    if (!n) break
    outputs.push(n.toString().replace(/ GMT.*/, ''))
  }
  t.deepEqual(outputs, [
    'Thu Dec 10 2015 19:00:00',
    'Thu Dec 17 2015 19:00:00',
    'Thu Dec 24 2015 19:00:00'
  ])
  t.end()
})

test('every other starting until', function (t) {
  var str = 'oakland wiki 18:30 every other wednesday'
    + ' starting dec 2 until dec 23'
  var ev = parse(str, { created: new Date('2015-12-10 03:00') })
  var n = '2015-12-10 03:00', outputs = []
  for (var i = 0; i < 3; i++) {
    n = ev.next(n)
    if (!n) break
    outputs.push(n.toString().replace(/ GMT.*/, ''))
  }
  t.deepEqual(outputs, [
    'Wed Dec 16 2015 18:30:00',
    'Wed Dec 23 2015 18:30:00'
  ])
  t.end()
})

test('every day', function (t) {
  var str = 'every day at 7 pm'
  var ev = parse(str, { created: new Date('2015-12-10 03:00') })
  var n = '2015-12-10 03:00', outputs = []
  for (var i = 0; i < 3; i++) {
    n = ev.next(n)
    if (!n) break
    outputs.push(n.toString().replace(/ GMT.*/, ''))
  }
  t.deepEqual(outputs, [
    'Thu Dec 10 2015 19:00:00',
    'Fri Dec 11 2015 19:00:00',
    'Sat Dec 12 2015 19:00:00'
  ])
  t.end()
})
