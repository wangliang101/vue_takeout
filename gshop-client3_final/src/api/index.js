/*
包含n个接口请求函数的模块
调用ajax函数发请求
函数的返回值是promise
 */
import ajax from './ajax'

// const BASE = 'http://localhost:5000'
const BASE = '/api'

// 1、根据经纬度获取位置详情
export const reqAddress = (longitude, latitude) => ajax.get(BASE + `/position/${latitude},${longitude}`)

// 2、获取食品分类列表
export const reqCategorys = () => ajax(BASE + '/index_category')

// 3. 根据经纬度获取商铺列表
export const reqShops = ({longitude, latitude}) => ajax({
  url: BASE + '/shops',
  params: {longitude, latitude}
})

// 发送短信验证码
export const reqSendCode = (phone) => ajax.get(BASE + '/sendcode', {
  params: { phone }
})

// 用户名密码登陆
export const reqPwdLogin = ({name, pwd, captcha}) => ajax.post(BASE + '/login_pwd', { name, pwd, captcha })

// 手机号验证码登陆
export const reqSmsLogin = ({phone, code}) => ajax({
  url: BASE + '/login_sms', 
  data: { phone, code }
})

// 根据会话获取用户信息
export const reqUser = () => ajax(BASE + '/userinfo')


/* 请求mock的接口 */
export const reqGoods = () => ajax('/goods')
export const reqRatings = () => ajax('/ratings')
export const reqInfo = () => ajax('/info')
