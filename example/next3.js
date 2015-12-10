var parse = require('../')
var str = process.argv.slice(2).join(' ')
var ev = parse(str)

var n = undefined
for (var i = 0; i < 3; i++) {
	n = ev.next(n)
	console.log(n)
}
