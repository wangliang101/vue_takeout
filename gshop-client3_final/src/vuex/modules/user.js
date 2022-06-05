/*
管理user模块相关状态数据的模块
*/

import Cookies from 'js-cookie'
import {
  RECEIVE_USER,
  RESET_USER,
} from '../mutation-types'

import {
  reqUser,
} from '../../api'

const state = {
  user: {}, // 登陆用户信息对象
  token: localStorage.getItem('token_key'), // 登陆用户的授权token
}

const mutations = {
  [RECEIVE_USER](state, user) {
    state.user = user
    state.token = user.token
    localStorage.setItem('token_key', user.token)
  },
  [RESET_USER](state) {
    state.user = {}
    state.token = ''
  },
}

const actions = {

  /*
   获取当前用户的异步action
    */
  async getUser ({commit}) {
    const response = await reqUser()
    const result = response.data
    if (result.code === 0) {
      const user = result.data
      commit(RECEIVE_USER, user)
    }
  },
  
  /*
  退出登陆的异步action
   */
  async logout ({commit}) {
    localStorage.removeItem('token_key')
    Cookies.remove('user_id')
    commit(RESET_USER)
  },
}
const getters = {}

export default {
  state,
  mutations,
  actions,
  getters,
}