import Vue from 'vue'
import Router from 'vue-router'


Vue.use(Router)

function route (path, file, name, children) {
  return {
    exact: true,
    path,
    name,
    children,
    component: () => import('../pages' + file)
  }
}

export default new Router({
  routes: [
    route("/login",'/Login',"Login"),
    {
      path:"/",
      component: () => import('../pages/Layout'),  //异步加载
      redirect:"/login",
      children:[
        route("/login","/Login","Login"),
        route("/index/dashboard","/Dashboard","Dashboard"),
        route("/item/category",'/item/Category',"Category"),
        route("/item/myBrand",'/item/MyBrand',"MyBrand"),
        route("/item/myGoods",'/item/MyGoods','MyGoods'),
        route("/item/specification",'/item/Specification',"Specification"),
        route("/user/statistics",'/item/Statistics',"Statistics"),
        route("/trade/promotion",'/trade/Promotion',"Promotion")
      ]
    }
  ]
})
