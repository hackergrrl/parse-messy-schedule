var parset = require('parse-messy-time')

var nums1to4 = '(1st|2nd|3rd|4th|first|second|third|fourth)'
var numNames = { first: '1st', second: '2nd', third: '3rd', fourth: '4th' }

var re = {}
re.every = RegExp(
  '(?:(\\d+:\\d+|\\d+(?::\\d+)?\\s*(?:pm|am))\\s+)?'
  + '(?:every|each)\\s+(?:(other)\\s+|'
  + nums1to4
    + '(?:(?:\\s*,\\s*|\\s+(and|through)\\s+)' + nums1to4 + ')?'
    + '\\s+)?'
  + '(?:(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\\b)'
  + '(?:\\s+(.+?))?'
  + '(?:\\s+(?:starting|from)\\s+(.+?))?'
  + '(?:\\s+(?:until|to)\\s+(.+?))?'
  + '\\s*$',
  'i'
)

function everyf (s) {
  var m = re.every.exec(s)
  if (!m) return m
  return {
    other: Boolean(m[2]),
    numbered: m[3] ? normNum(
      m[3] && m[4] === 'through' && m[5] ? thru(m[3], m[5]) :
        m[5] ? [ m[3], m[5] ] :
        [ m[3] ]
    ) : null,
    day: String(m[6]).toLowerCase(),
    time: m[1] ? parset(m[1]) : m[7] ? parset(m[7]) : null,
    starting: m[8] ? parset(m[8]) : null,
    until: m[9] ? parset(m[9] + (m[7] ? ' ' + m[7] : '')) : null,
    index: m.index
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
  this._every = everyf(str)
  this._created = opts.created
  this.title = this._every ? str.slice(0, this._every.index).trim() : null
  // for X weeks
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
    if (base <= x) base = x
    var p = countWeeks(x, base) % 2 === 0 ? 'this' : 'next'
    var tt = this._every.time ? ' at ' + this._every.time : ''
    var t = parset(p + ' ' + this._every.day + tt, { now: base })
    if (t <= base) t.setDate(t.getDate() + 14)
    if (this._every.until && t - 1000 > this._every.until) return null
    return t
  } else if (this._every) {
    var tt = this._every.time ? ' at ' + this._every.time : ''
    var t = parset('this ' + this._every.day + tt, { now: base })
    if (t <= base) t.setDate(t.getDate() + 7)
    if (this._every.until && t - 1000 > this._every.until) return null
    return t
  }
}

