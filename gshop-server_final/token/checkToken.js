// 监测 token 是否过期
const jwt = require('jsonwebtoken')
module.exports = function (req, res, next) {

	const user_id = req.cookies.user_id
	if (!user_id) {
		next()
		return
	}
	// console.log(req.headers)
	const authorization = req.headers['authorization']
	if (!authorization) {
		res.status(401)
		return res.json({ message: '无token，请重新登录111' })
	}
	let token = req.headers['authorization'].split(' ')[1]
	// 解构 token，生成一个对象 { name: xx, iat: xx, exp: xx }
	let decoded = jwt.decode(token, 'secret')
	// console.log(decoded.exp)
	// console.log(Date.now() / 1000)
	// 监测 token 是否过期
	if(token && decoded.exp <= Date.now() / 1000) {
		res.status(401)
		return res.json({ message: 'token过期，请重新登录222' })
	}
	next();
}
