import Vue from 'vue'
import 'element-ui/lib/theme-chalk/index.css'
import { Form, FormItem, Button, Input, Message } from 'element-ui'

// 全局注册组件
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Button)
Vue.use(Input)
Vue.use(Message)
// 弹框组件需要全局挂载
Vue.prototype.$message = Message