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
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editorClick(scope.row.id)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteUser(scope.row.id)"
            ></el-button>
            <el-tooltip class="item" effect="dark" content="分配角色" placement="top">
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="assignRoles(scope.row)"
              ></el-button>
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
    <!-- 编辑用户 -->
    <el-dialog @close="editorDialogClosed" title="修改用户信息" :visible.sync="editorFormVisible">
      <el-form ref="editorFrom" :model="editorFrom" :rules="addUserRules">
        <el-form-item prop="username" label="用户名" :label-width="formLabelWidth">
          <el-input v-model="editorFrom.username" autocomplete="off" disabled></el-input>
        </el-form-item>
        <el-form-item prop="email" label="邮箱" :label-width="formLabelWidth">
          <el-input v-model="editorFrom.email" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item prop="mobile" label="手机" :label-width="formLabelWidth">
          <el-input v-model="editorFrom.mobile" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editorFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="editorSubmit">确 定</el-button>
      </div>
    </el-dialog>
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
        <el-form-item prop="mobile" label="身份" :label-width="formLabelWidth">
          <el-input v-model="addUser.role_name" autocomplete="off" placeholder="请输入用户身份"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUserSubmit(addUserRules)">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 分配权限 -->

    <el-dialog title="提示" :visible.sync="rolesDialogVisible" width="30%">
      <p>当前的用户：{{userInfo.username}}</p>
      <p>当前的角色：{{userInfo.role_name}}</p>
      <el-select v-model="selectedRoleID" placeholder="选择要替换的角色">
        <el-option
          v-for="item in assignRolesSelect"
          :key="item.roleName"
          :label="item.label"
          :value="item.roleName"
        ></el-option>
      </el-select>
      <span slot="footer" class="dialog-footer">
        <el-button @click="rolesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
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
      editorFormVisible: false,
      rolesDialogVisible: false,
      editorFrom: {},
      addUser: {
        username: '',
        email: '',
        mobile: '',
        role_name: '',
        password: '',
        role_name: ''
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
      },
      // 分配权限
      userInfo: {},
      assignRolesSelect: [],
      selectedRoleID: '' //当前选中的ID
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    // 点击按钮分配角色
    async saveRoleInfo() {
      if (!this.selectedRoleID) {
        return this.$message.error('请选择新的角色')
      } 
        const { data :res  } = await this.$http.put(
          `users/${this.userInfo.id}/role`,
          {
            rid: this.selectedRoleID
          }
        )
        if(res.meta.status !== 200){
          return this.$message.error('分配新角色失败')
        }
          this.$message.success('新角色分配成功')
          this.getUserList()
          this.rolesDialogVisible = false
      
      
    },
    // 分配角色弹框
    async assignRoles(userInfo) {
      this.rolesDialogVisible = true
      this.userInfo = userInfo
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status != 200) {
        return this.$message.error('获取角色列表失败！')
      } else {
        this.assignRolesSelect = res.data
        console.log(this.assignRolesSelect, '=========this.assignRolesSelect ')
      }
    },
    // 删除用户
    async deleteUser(id) {
      await this.$confirm('确定要删除当前用户吗', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const { data: res } = this.$http.delete('users/' + id)
        if (res.meta.status !== 200) {
          this.$message({
            message: '删除失败',
            type: 'error'
          })
        } else {
          this.$message({
            message: '删除成功',
            type: 'success'
          })
          this.getUserList()
        }
      })

      // this.users.splice(1, id)
    },
    // 编辑submit
    editorSubmit() {
      this.$refs.editorFrom.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$http.put(
            'users/' + this.editorFrom.id,
            {
              email: this.editorFrom.email,
              mobile: this.editorFrom.mobile
            }
          )
          if (res.meta.status !== 200) {
            this.$message({
              message: '用户编辑失败',
              type: 'error'
            })
          } else {
            this.editorFormVisible = false
            this.getUserList()
            this.$message({
              message: '用户编辑成功',
              type: 'success'
            })
          }
        }
      })
    },
    // 编辑用户
    async editorClick(id) {
      this.editorFormVisible = true
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        this.$message({
          message: '查询用户信息失败',
          type: 'error'
        })
      }
      this.editorFrom = res.data
      console.log(this.editorFrom, '====this.editorFrom')
    },
    // 添加用户表单验证
    addUserSubmit() {
      this.$refs.addFormRef.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$http.post('users', this.addUser)
          console.log(this.addUser, '===============this.addUser')
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
            console.log(res, '========')
          }
        }
      })
    },
    // 添加用户弹框
    addUserBtn() {
      this.dialogFormVisible = true
    },
    // 关闭添加对话框回到初始状况
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    editorDialogClosed() {
      this.$refs.editorFrom.resetFields()
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
      } 
        this.users = res.data.users
        this.total = res.data.total
        console.log(res.data)
      
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