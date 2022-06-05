var express = require('express');
var router = express.Router();
const md5 = require('blueimp-md5')
const UserModel = require('../models/UserModel')
const _filter = {'pwd': 0, '__v': 0} // 查询时过滤掉
const sms_util = require('../util/sms_util')
const users = {}
const ajax = require('../api/ajax')
var svgCaptcha = require('svg-captcha')
const createToken = require('../token/createToken')
const checkToken = require('../token/checkToken')

/*
密码登陆
 */
router.post('/login_pwd', function (req, res) {
  const name = req.body.name
  const pwd = md5(req.body.pwd)
  const captcha = req.body.captcha.toLowerCase()
  // console.log('/login_pwd', name, pwd, captcha)

  // 可以对用户名/密码格式进行检查, 如果非法, 返回提示信息
  if (captcha !== req.session.captcha) {
    return res.send({code: 1, msg: '验证码不正确'})
  }
  // 删除保存的验证码
  delete req.session.captcha

  UserModel.findOne({name})
    .then((user) => {
      if (user) {
        if (user.pwd !== pwd) {
          res.send({code: 1, msg: '用户名或密码不正确!'})
        } else {
          res.cookie('user_id', user._id, {maxAge: 1000 * 60 * 60 * 24 * 7})
          res.send({
            code: 0, 
            data: {
              _id: user._id, 
              name: user.name, 
              phone: user.phone,
              token: createToken(name)
            }
          })
        }
        return new Promise(() => {

        }) // 返回一个pending状态的promise对象
      } else {
        return UserModel.create({name, pwd})
      }
    })
    .then((user) => {
      res.cookie('user_id', user._id, {
        maxAge: 1000 * 60 * 60 * 24 * 7
      })
      const data = {
        _id: user._id,
        name: user.name,
        token: createToken(name)
      }
      // 3.2. 返回数据(新的user)
      res.send({code: 0, data})
    })
    .catch(error => {
      console.error('/login_pwd', error)
    })
})

/*
一次性图形验证码
 */
router.get('/captcha', function (req, res) {
  var captcha = svgCaptcha.create({
    ignoreChars: '0o1l',
    noise: 2,
    color: true
  });
  req.session.captcha = captcha.text.toLowerCase()
  console.log('/captcha', req.session.captcha)
  res.type('svg');
  res.send(captcha.data)
});

/*
发送验证码短信
*/
router.get('/sendcode', function (req, res, next) {
  //1. 获取请求参数数据
  var phone = req.query.phone;
  //2. 处理数据
  //生成验证码(6位随机数)
  var code = sms_util.randomCode(6);
  //发送给指定的手机号
  console.log(`向${phone}发送验证码短信: ${code}`);
  sms_util.sendCode(phone, code, function (success) {//success表示是否成功
    if (success) {
      users[phone] = code
      console.log('保存验证码: ', phone, code)
      res.send({"code": 0})
    } else {
      //3. 返回响应数据
      res.send({"code": 1, msg: '短信验证码发送失败'})
    }
  })
})

/*
短信登陆
*/
router.post('/login_sms', function (req, res, next) {
  var phone = req.body.phone;
  var code = req.body.code;
  console.log('/login_sms', phone, code);
  if (users[phone] != code) {
    res.send({code: 1, msg: '手机号或验证码不正确'});
    return;
  }
  //删除保存的code
  delete users[phone];


  UserModel.findOne({phone})
    .then(user => {
      if (user) {
        req.session.userid = user._id
        res.send({code: 0, data: user})
      } else {
        //存储数据
        return new UserModel({phone}).save()
      }
    })
    .then(user => {
      req.session.userid = user._id
      res.send({code: 0, data: user})
    })
    .catch(error => {
      console.error('/login_sms', error)
    })

})

/*
根据sesion中的userid, 查询对应的user
 */
router.get('/userinfo', checkToken, function(req, res) {
  // 取出userid
  const userid = req.cookies.user_id
  if (!userid) {
    res.send({code: 1, msg: '请先登陆'})
    return
  }
  // 查询
  UserModel.findOne({_id: userid}, _filter)
    .then(user => {
      // 如果没有, 返回错误提示
      if (!user) {
        // 清除浏览器保存的user_id的cookie
        res.cookie('user_id', user._id, {
          maxAge: 0
        })
        res.send({code: 1, msg: '请先登陆'})
      } else {
        // 如果有, 返回user
        user._doc.token = createToken(user.name)
        res.send({code: 0, data: user})
      }
    })
})

/*
根据经纬度获取位置详情
 */
router.get('/position/:geohash', checkToken, function(req, res) {
  const {geohash} = req.params
  ajax(`http://cangdu.org:8001/v2/pois/${geohash}`)
    .then(data => {
      res.send({code: 0, data})
    })
})

/*
获取首页分类列表
 */
router.get('/index_category', checkToken, function(req, res) {
  setTimeout(function () {
    const data = require('../data/index_category.json')
    res.send({code: 0, data})
  }, 300)
})

/*
根据经纬度获取商铺列表
?latitude=40.10038&longitude=116.36867
 */
router.get('/shops', checkToken, function(req, res) {
  setTimeout(function () {
    const data = require('../data/shops.json')
    res.send({code: 0, data})
  }, 300)
})

router.get('/search_shops', checkToken, function(req, res) {
  const {geohash, keyword} = req.query
  ajax('http://cangdu.org:8001/v4/restaurants', {
    'extras[]': 'restaurant_activity',
    geohash,
    keyword,
    type: 'search'
  }).then(data => {
    res.send({code: 0, data})
  })
})

module.exports = router;