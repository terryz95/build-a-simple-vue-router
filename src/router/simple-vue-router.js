let Vue, installed = false

class VueRouter {
  constructor(options) {
    this.$options = options
    // 保存路由path到路由配置对象的映射
    this.routeMap = Object.create(null)
    // 利用Vue建立一个响应式的地址变量
    this.app = new Vue({
      data: {
        current: '/'
      }
    })
  }
  // hashchange事件
  onHashChange() {
    this.app.current = location.hash.slice(1) || '/'
  }
  // 绑定hashchange事件
  bindEvent() {
    window.addEventListener('hashchange', this.onHashChange.bind(this))
  }
  // 创建路由path到路由配置对象的映射
  createRouteMap() {
    const routes = this.$options.routes
    routes.forEach((route) => {
      if (route.path) {
        this.routeMap[route.path] = route
      }
    })
  }
  // 注册router-link和router-view两个全局组件
  initComponents() {
    let _this = this
    Vue.component('router-link', {
      props: {
        to: String
      },
      render(h) {
        return h('a', {
          'class': {
            'router-link-exact-active': _this.app.current === this.to
          },
          attrs: {
            href: `#${this.to}`
          }
        }, [this.$slots.default])
      }
    })
    Vue.component('router-view', {
      render(h) {
        const Component = _this.routeMap[_this.app.current].component
        return h(Component)
      }
    })
  }
  // 初始化：执行上述流程
  init() {
    this.bindEvent()
    this.createRouteMap()
    this.initComponents()
  }
}

// 注册插件的install方法，利用全局混入，在根组件beforeCreate生命周期中执行router实例的init方法
VueRouter.install = function(_Vue) {
  if (installed && _Vue === Vue) return
  installed = true
  Vue = _Vue

  Vue.mixin({
    beforeCreate() {
      if (this.$options.router) {
        const router = this.$options.router
        Vue.prototype.$router = router
        router.init()
      }
    }
  })
}

export default VueRouter