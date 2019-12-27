<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 角色列表 -->
    <el-card class="box-card">
      <el-button
        @click="addRoles = true"
        style="float:left;margin-bottom: 20px;"
        type="primary"
      >添加角色</el-button>
      <el-table border :data="rolelist" style="width: 100%">
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
              :class="['bdbottom', i1 === 0 ? 'bdtop':'','vcenter']"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag>{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 渲染嵌套二级权限 -->
                <el-row
                  :class="[i2 === 0 ? '' : 'bdtop','vcenter']"
                  v-for="(item2,i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag type="success">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级循环 -->
                  <el-col :span="18">
                    <!-- <el-row >
                    <el-col>-->
                    <el-tag
                      type="warning"
                      v-for="(item3) in item2.children"
                      :key="item3.id"
                    >{{item3.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                    <!-- </el-col>
                    </el-row>-->
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              size="mini"
              icon="el-icon-edit"
              type="primary"
              @click="handleEdit(scope.row.id)"
            >编辑</el-button>
            <el-button
              size="mini"
              icon="el-icon-delete"
              type="danger"
              @click="handleDelete(scope.$index, scope.row)"
            >删除</el-button>
            <el-button
              size="mini"
              icon="el-icon-setting"
              type="warning"
              @click="handleRoles(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分配权限 -->
    <el-dialog :visible.sync="dialogVisible" width="30%" @close="closeDialogVisible">
      <el-tree
        :data="roleData"
        show-checkbox
        node-key="id"
        :default-expanded-keys="defKeys"
        :default-checked-keys="defKeys"
        :props="defaultProps"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 添加角色 -->
    <el-dialog title="添加角色" :visible.sync="addRoles">
      <el-form :model="addRolesForm">
        <el-form-item label="角色名称" :label-width="formLabelWidth">
          <el-input v-model="addRolesForm.roleName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" :label-width="formLabelWidth">
          <el-input v-model="addRolesForm.roleDesc" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addRoles = false">取 消</el-button>
        <el-button type="primary" @click="addRolesClick">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 编辑角色 -->
    <el-dialog title="编辑角色" :visible.sync="editorRoles">
      <el-form ref="editorFormRef" :model="editorRolesForm" :rules="editorRoleRules">
        <el-form-item prop="roleName" label="角色名称" :label-width="formLabelWidth">
          <el-input v-model="editorRolesForm.roleName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item prop="roleDesc" label="角色描述" :label-width="formLabelWidth">
          <el-input v-model="editorRolesForm.roleDesc" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editorRoles = false">取 消</el-button>
        <el-button type="primary" @click="editorRolesClick">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { async } from 'q'
export default {
  data() {
    return {
      rolelist: [],
      dialogVisible: false, //分配权限弹框
      editorRoles: false, //编辑角色弹框
      roleData: [],
      // 树形控件属性绑定对象
      defaultProps: {
        children: 'children',
        label: 'authName'
      },
      defKeys: [105], //回显已绑定的元素
      roleId: '',
      addRoles: false,
      addRolesForm: {
        roleName: '',
        roleDesc: ''
      },
      editorRolesForm: {},
      formLabelWidth: '70px',
      editorRoleRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    // 编辑角色submit
    editorRolesClick() {
      this.$refs.editorFormRef.validate(async valid => {
        if (valid) {
          await this.$http.put('roles/', this.editorFormRef.id, {
            roleName: this.editorFormRef.roleName,
            roleDesc: this.editorFormRef.roleDesc
          })
          if (res.meta.status !== 200) {
            this.$message({
              message: '编辑角色失败',
              type: 'error'
            })
          }else{
            this.$message({
              message: '编辑用户成功',
              type: 'success'
            })
            this.editorRoles = false
            this.getRolesList();
          }
        }
      })
    },
    // 添加角色
    async addRolesClick() {
      const { data: res } = await this.$http.post('roles', this.addRolesForm)
      if (res.meta.status !== 201) {
        return this.$message.error('添加失败')
      } else {
        this.addRoles = false
        this.getRolesList()
        return this.$message.success('添加成功')
      }
    },
    // 分配权限
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('权限分配失败')
      } else {
        this.dialogVisible = false
        this.getRolesList()
        return this.$message.success('权限分配成功')
      }
    },
    // 关闭权限分配框
    closeDialogVisible() {
      this.defKeys = []
    },
    // tree结构
    handleNodeClick(data) {
      console.log(data)
    },
    // 通过递归的形式，获取角色下所有三级权限的id，并保存到 defKeys 数组中
    getLeafKeys(node, arr) {
      // 如果当前 node 节点不包含 children 属性，则是三级节点
      if (!node.children) {
        return arr.push(node.id)
      } else {
        node.children.forEach(item => this.getLeafKeys(item, arr))
        // console.log(this.defKeys,'========defKeys');
        // console.log(node, '============node')
      }
    },
    // 分配权限
    async handleRoles(role) {
      this.roleId = role.id
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('数据加载失败')
      } else {
        this.roleData = res.data
        this.getLeafKeys(role, this.defKeys)
        this.dialogVisible = true
        // console.log(this.roleData, '============this.roleData')
      }
    },
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('数据加载失败')
      } else {
        this.rolelist = res.data
        // console.log(res.data, '==============res.data')
      }
    },
    async handleEdit(id) {
      this.editorRoles = true
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) {
        this.$message({
          type: 'error'
        })
      } else {
        this.editorRolesForm = res.data
      }
    },
    async handleDelete(index, row) {
      const { data: res } = await this.$http.delete('roles/' + row.id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败')
      } else {
        this.getRolesList()
        return this.$message.success('删除成功')
      }
    }
  }
}
</script>
<style lang="less" scoped>
.vcenter {
  display: flex;
  align-items: center;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.el-tag {
  margin: 7px;
}
.text {
  font-size: 14px;
}

.item {
  padding: 18px 0;
}

.box-card {
  width: 100%;
}
// .demo-table-expand {
//   font-size: 0;
// }
// .demo-table-expand label {
//   width: 90px;
//   color: #99a9bf;
// }
// .demo-table-expand .el-form-item {
//   margin-right: 0;
//   margin-bottom: 0;
//   width: 50%;
// }
</style>