/*
能发送ajax请求的函数模块
封装axios
函数的返回值是promise

使用Promise封装axios的作用?
    1. 统一处理请求异常
    2. 异步返回的不是reponse, 而直接是response.data
 */
import axios from 'axios'
import {Toast} from 'mint-ui'
import router from '../router'
import store from '../vuex/store'

// 默认全局配置
// axios.defaults.timeout = 12000 

const instance = axios.create({
  timeout: 12000
})

instance.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'

/** 
 * 请求拦截器 
 * 每次请求前，如果存在token则在请求头中携带token 
 */
instance.interceptors.request.use(
  config => {
    const token = store.state.user.token
    if (token) {
      config.headers.Authorization = token
    }
    return config
  }
)

/* 
响应拦截器
*/
instance.interceptors.response.use(
  response => response,
  // 请求失败
  error => {
    const { response } = error
    if (response) {
      const status = response.status
      // 没有权限(很可能是权限过期了)
      if (status===401) {
        // 提示
        hint('登录过期，请重新登录')
        // 更新数据
        store.dispatch('logout')
        // 跳转到登陆界面
        router.replace({
          path: '/login',
          query: {
            redirect: router.currentRoute.fullPath
          }
        })
      } else if (status===404) {
        hint('请求的资源不存在')
      } else {
        hint('请求服务器异常')
      }
    } else {
      hint('网络异常!!!')
    }
    // return error
    return new Promise(() => {})
  }
)


/*
错误提示
*/
function hint(message) {
  Toast({
    message,
    position: 'top',
    duration: 2000,
    iconClass: 'icon icon-error'
  });
}

export default instance