var parse = require('../')
var str = process.argv.slice(2).join(' ')
var ev = parse(str)
console.log('NEXT:', ev.next())
