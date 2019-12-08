<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
      <!-- <el-breadcrumb-item>活动详情</el-breadcrumb-item> -->
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <el-row :gutter="40">
        <el-col :span="10">
          <el-input
            @clear="getUserList()"
            v-model="queryInfo.query"
            clearable
            placeholder="请输入内容"
            class="input-with-select"
          >
            <el-button @click="getUserList()" slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4" style="float:right">
          <el-button type="primary" @click="addUserBtn">添加用户</el-button>
        </el-col>
      </el-row>
      <el-table :data="users" border style="width: 100%;margin-top:30px;">
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="username" label="姓名" width="180"></el-table-column>
        <el-table-column prop="email" label="邮箱" width="180"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="身份"></el-table-column>
        <el-table-column prop="mg_state" label="状态">
          <template slot-scope="scope">
            <el-switch
              @change="userStateChange(scope.row)"
              v-model="scope.row.mg_state"
              active-color="#409eff"
              inactive-color="#909399"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
            <el-button type="danger" icon="el-icon-share" size="mini"></el-button>
            <el-tooltip class="item" effect="dark" content="分配角色" placement="top">
              <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 3, 5]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加用户 -->
    <el-dialog @close="addDialogClosed" title="新增用户" :visible.sync="dialogFormVisible">
      <el-form ref="addFormRef" :model="addUser" :rules="addUserRules">
        <el-form-item prop="username" label="用户名" :label-width="formLabelWidth">
          <el-input v-model="addUser.username" autocomplete="off" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item prop="password" label="密码" :label-width="formLabelWidth">
          <el-input v-model="addUser.password" autocomplete="off" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item prop="email" label="邮箱" :label-width="formLabelWidth">
          <el-input v-model="addUser.email" autocomplete="off" placeholder="请输入邮箱账号"></el-input>
        </el-form-item>
        <el-form-item prop="mobile" label="电话" :label-width="formLabelWidth">
          <el-input v-model="addUser.mobile" autocomplete="off" placeholder="请输入电话号码"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUserSubmit(addUserRules)">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { async } from 'q'
export default {
  data() {
    return {
      users: [],
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      total: 0,
      dialogFormVisible: false,
      addUser: {
        username: '',
        email: '',
        mobile: '',
        role_name: '',
        password: ''
      },
      formLabelWidth: '80px',
      addUserRules: {
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' }
        ],
        email: [{ required: true, message: '请输入邮箱账号', trigger: 'blur' }],
        username: [
          { required: true, message: '请输入用户名称', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入手机号码', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    // 添加用户表单验证
    addUserSubmit() {
      this.$refs.addFormRef.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$http.post('users', this.addUser)
          if (res.meta.status !== 201) {
            this.$message({
              message: '用户创建失败',
              type: 'error'
            })
          } else {
            this.dialogFormVisible = false
            this.$message({
              message: '用户创建成功',
              type: 'success'
            })
            console.log(res,'========');
            
          }
        }
      })
    },
    // 添加用户弹框
    addUserBtn() {
      this.dialogFormVisible = true
    },
    // 关闭添加对话框
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 改变状态
    async userStateChange(userinfo) {
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      )
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('更新用户状态失败')
      } else {
        this.$message.success('更新用户状态成功')
      }
    },
    // 获取列表数据
    async getUserList() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      } else {
        this.users = res.data.users
        this.total = res.data.total
        console.log(res.data)
      }
    },
    handleSizeChange(val) {
      this.queryInfo.pagesize = val
      this.getUserList()
      console.log(`每页 ${val} 条`)
    },
    handleCurrentChange(pagenum) {
      this.queryInfo.pagenum = pagenum
      this.getUserList()
      console.log(`当前页: ${pagenum}`)
    }
  }
}
</script>

<style lang="less" scoped>
.el-select .el-input {
  width: 130px;
}
.input-with-select .el-input-group__prepend {
  background-color: #fff;
}
.text {
  font-size: 14px;
}
.clearfix:before,
.clearfix:after {
  display: table;
  content: '';
}
.clearfix:after {
  clear: both;
}

.box-card {
  width: 100%;
}
.el-pagination {
  float: left;
  margin: 20px;
}
</style>