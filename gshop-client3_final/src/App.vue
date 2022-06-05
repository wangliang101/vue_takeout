<template>
  <div>
    <router-view/>
    <FooterGuide v-show="$route.meta.isShowFoot"/>
  </div>
</template>

<script type="text/ecmascript-6">
  import FooterGuide from './components/FooterGuide/FooterGuide'

  export default {
    name: 'App',

    async mounted () {

      // this.$store.dispatch('xxx') // 触发所有对应action调用
      // this.$store.commit('yyy') // 触发所有对应的mutation调用

      // 异步获取地址
      this.$store.dispatch('getAddress')
      // 请求获取用户信息
      this.$store.dispatch('getUser')
    },

    components: {
      FooterGuide
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>

</style>

