<template>
  <el-container class="home_contanier">
    <el-header>
      <div @click="navClick" class="logo_name">
        <img class="logo" src="../assets/logo.png" alt />
        <span>后台管理系统</span>
      </div>
      <div class="exit">
        <el-button type="success" @click="logout">退出</el-button>
      </div>
    </el-header>
    <el-container>
      <el-aside :width="isCollapse?'64px':'201px'">
        <el-menu
          :default-active="acquire"
          class="el-menu-vertical-demo"
          @open="handleOpen"
          @close="handleClose"
          :collapse="isCollapse"
          active-text-color="#ffd04b"
          unique-opened
          router
        >

          <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
            <template slot="title">
              <i :class="item.icon"></i>
              <span slot="title" v-text="item.authName"></span>
            </template>
            <el-menu-item
              :index= "'/' + subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
              @click="gainPath"
            >
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span slot="title" v-text="subItem.authName"></span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
export default {
  data() {
    return {
      isCollapse: false, //导航栏显示
      menuList: [], //菜单栏列表
      iconObj: [
        'iconfont  icon-user',
        'iconfont  icon-tijikongjian',
        'iconfont icon-shangpin',
        'iconfont icon-danju',
        'iconfont icon-baobiao'
      ],
      acquire:'',
    }
  },
  created() {
    this.getMenuList()
  },
  methods: {
    // 获取路径设置导航高亮
    gainPath(){
      this.acquire = this.$route.path;  //获取当前路径
      console.log(this.acquire);
    },
    // 获取左侧菜单数据
    async getMenuList() {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      } else {
        this.menuList = res.data
        for (const key in this.menuList) {

          for (const i in this.iconObj) {
            if (key == i) {
              this.menuList[key].icon = this.iconObj[i]
            }
          }
        }

        console.log(this.menuList)
      }
    },
    // 退出
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    // 折叠菜单
    navClick() {
      this.isCollapse = !this.isCollapse
    },
    handleOpen(key, keyPath) {
      console.log(key, keyPath)
    },
    handleClose(key, keyPath) {
      console.log(key, keyPath)
    }
  }
}
</script>
<style lang="less" scoped>
.home_contanier {
  height: 100%;
}
.el-header {
  background-color: #b3c0d1;
  color: #333;
  line-height: 60px;
}

.el-aside {
  background-color: #d3dce6;
  color: #333;
  text-align: center;
}

.el-main {
  background-color: #e9eef3;
  color: #333;
  text-align: center;
}
.logo_name {
  cursor: pointer;
  float: left;
  display: flex;
  align-content: center;
}
.exit {
  float: right;
}
.logo {
  width: 50px;
}
.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
  min-height: 400px;
}
</style>