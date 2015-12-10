var parset = require('parse-messy-time')

var nums1to4 = '(1st|2nd|3rd|4th|first|second|third|fourth)'
var numNames = { first: '1st', second: '2nd', third: '3rd', fourth: '4th' }

var re = {}
re.every = function (s) {
  var re = RegExp('every\\s+(?:(other)\\s+|'
    + nums1to4
      + '(?:(?:\\s*,\\s*|\\s+(and|through)\\s+)' + nums1to4 + ')?'
      + '\\s+)?'
    + '(?:(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\\b)'
    + '(?:\\s+starting\\s+(.+))?',
    'i'
  )
  var m = re.exec(s)
  if (!m) return m
  return {
    other: Boolean(m[1]),
    numbered: m[2] ? normNum(
      m[2] && m[3] === 'through' && m[4] ? thru(m[2], m[4]) :
        m[4] ? [ m[2], m[4] ] :
        [ m[2] ]
    ) : null,
    day: String(m[5]).toLowerCase(),
    starting: m[6] ? parset(m[6]) : null
  }
}

function normNum (xs) {
  return xs.map(function (x) {
    x = (x || '').toLowerCase()
    return numNames[x] || x
  })
}

function thru (a, b) {
  var m = normNum([ a, b ])
  var ns = Object.keys(numNames)
    .map(function (n) { return numNames[n] })
    .sort()
  ns.forEach(function (n) {
    if (n > m[m.length-2] && n < m[m.length-1]) {
      m.splice(m.length-1, 0, n)
    }
  })
  return m
}

function countWeeks (a, b) {
  return Math.round((b.getTime() - a.getTime()) / 1000 / 60 / 60 / 24 / 7)
}

module.exports = Mess

function Mess (str, opts) {
  if (!(this instanceof Mess)) return new Mess(str, opts)
  if (!opts) opts = {}
  this._every = re.every(str)
  this._created = opts.created
  // for X weeks
  // until X date
  // starting X until Y
  // starting X for Y weeks
}

Mess.prototype.next = function (base) {
  if (!base) base = new Date
  if (typeof base === 'string') base = parset(base)
  if (this._every && this._every.numbered) {
    //...
  } else if (this._every && this._every.other
  && (this._every.starting || this._created)) {
    var x = this._every.starting || this._created
    if (base < x) base = x
    var p = countWeeks(x, base) % 2 === 0 ? 'this' : 'next'
    var t = parset(p + ' ' + this._every.day, { now: base })
    if (t < base) t.setDate(t.getDate() + 14)
    return t
  } else if (this._every) {
    var t = parset('this ' + this._every.day, { now: base })
    if (t < base) t.setDate(t.getDate() + 7)
    return t
  }
}
