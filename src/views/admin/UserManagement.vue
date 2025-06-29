<template>
  <div class="user-management">
    <div class="page-header">
      <h2>用户管理</h2>
      <el-button type="primary" @click="showAddDialog = true">
        <el-icon><Plus /></el-icon>
        添加用户
      </el-button>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-bar">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索用户名/姓名/邮箱"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-select v-model="searchForm.role" placeholder="选择角色" clearable>
            <el-option label="教师" value="teacher" />
            <el-option label="助教" value="assistant" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select v-model="searchForm.status" placeholder="选择状态" clearable>
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="inactive" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 用户列表 -->
    <el-table :data="userList" v-loading="loading" style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="用户名" width="120" />
      <el-table-column prop="realName" label="真实姓名" width="120" />
      <el-table-column prop="email" label="邮箱" width="200" />
      <el-table-column prop="phone" label="电话" width="130" />
      <el-table-column prop="role" label="角色" width="100">
        <template #default="{ row }">
          <el-tag :type="getRoleTagType(row.role)">
            {{ getRoleText(row.role) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="department" label="部门" width="150" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
            {{ row.status === 'active' ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button 
            :type="row.status === 'active' ? 'warning' : 'success'" 
            size="small" 
            @click="handleToggleStatus(row)"
          >
            {{ row.status === 'active' ? '禁用' : '启用' }}
          </el-button>
          <el-button type="danger" size="small" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="pagination.current"
        v-model:page-size="pagination.size"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 添加/编辑用户对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="isEdit ? '编辑用户' : '添加用户'"
      width="600px"
    >
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="userRules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="userForm.realName" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="userForm.phone" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="userForm.role" style="width: 100%">
            <el-option label="教师" value="teacher" />
            <el-option label="助教" value="assistant" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>
        <el-form-item label="部门" prop="department">
          <el-input v-model="userForm.department" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!isEdit">
          <el-input v-model="userForm.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword" v-if="!isEdit">
          <el-input v-model="userForm.confirmPassword" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
          {{ isEdit ? '更新' : '添加' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'UserManagement',
  setup() {
    const loading = ref(false)
    const submitLoading = ref(false)
    const showAddDialog = ref(false)
    const isEdit = ref(false)
    const userFormRef = ref()

    // 搜索表单
    const searchForm = reactive({
      keyword: '',
      role: '',
      status: ''
    })

    // 用户表单
    const userForm = reactive({
      id: '',
      username: '',
      realName: '',
      email: '',
      phone: '',
      role: 'teacher',
      department: '',
      password: '',
      confirmPassword: ''
    })

    // 表单验证规则
    const userRules = {
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' }
      ],
      realName: [
        { required: true, message: '请输入真实姓名', trigger: 'blur' }
      ],
      email: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
      ],
      phone: [
        { required: true, message: '请输入电话号码', trigger: 'blur' },
        { pattern: /^1[0-9]\d{9}$/, message: '请输入有效的手机号码', trigger: 'blur' }
      ],
      role: [
        { required: true, message: '请选择角色', trigger: 'change' }
      ],
      department: [
        { required: true, message: '请输入部门', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
      ],
      confirmPassword: [
        { required: true, message: '请再次输入密码', trigger: 'blur' },
        {
          validator: (rule, value, callback) => {
            if (value !== userForm.password) {
              callback(new Error('两次输入的密码不一致'))
            } else {
              callback()
            }
          },
          trigger: 'blur'
        }
      ]
    }

    // 分页
    const pagination = reactive({
      current: 1,
      size: 10,
      total: 0
    })

    // 用户列表
    const userList = ref([
      {
        id: 1,
        username: 'teacher',
        realName: '张老师',
        email: 'teacher@example.com',
        phone: '13800138000',
        role: 'teacher',
        department: '计算机学院',
        status: 'active',
        createTime: '2024-01-15 10:30:00'
      },
      {
        id: 2,
        username: 'assistant',
        realName: '李助教',
        email: 'assistant@example.com',
        phone: '13800138001',
        role: 'assistant',
        department: '计算机学院',
        status: 'active',
        createTime: '2024-01-16 14:20:00'
      },
      {
        id: 3,
        username: 'admin',
        realName: '王管理员',
        email: 'admin@example.com',
        phone: '13800138002',
        role: 'admin',
        department: '信息中心',
        status: 'active',
        createTime: '2024-01-10 09:15:00'
      }
    ])

    // 获取角色文本
    const getRoleText = (role) => {
      const roleMap = {
        'teacher': '教师',
        'assistant': '助教',
        'admin': '管理员'
      }
      return roleMap[role] || '未知'
    }

    // 获取角色标签类型
    const getRoleTagType = (role) => {
      const typeMap = {
        'teacher': 'primary',
        'assistant': 'success',
        'admin': 'danger'
      }
      return typeMap[role] || 'info'
    }

    // 搜索
    const handleSearch = () => {
      pagination.current = 1
      loadUserList()
    }

    // 重置搜索
    const handleReset = () => {
      Object.assign(searchForm, {
        keyword: '',
        role: '',
        status: ''
      })
      handleSearch()
    }

    // 加载用户列表
    const loadUserList = () => {
      loading.value = true
      // 模拟API调用
      setTimeout(() => {
        loading.value = false
        pagination.total = userList.value.length
      }, 1000)
    }

    // 添加用户
    const handleAdd = () => {
      isEdit.value = false
      Object.assign(userForm, {
        id: '',
        username: '',
        realName: '',
        email: '',
        phone: '',
        role: 'teacher',
        department: '',
        password: '',
        confirmPassword: ''
      })
      showAddDialog.value = true
    }

    // 编辑用户
    const handleEdit = (row) => {
      isEdit.value = true
      Object.assign(userForm, {
        id: row.id,
        username: row.username,
        realName: row.realName,
        email: row.email,
        phone: row.phone,
        role: row.role,
        department: row.department,
        password: '',
        confirmPassword: ''
      })
      showAddDialog.value = true
    }

    // 提交表单
    const handleSubmit = async () => {
      if (!userFormRef.value) return

      try {
        await userFormRef.value.validate()
        submitLoading.value = true

        // 模拟API调用
        setTimeout(() => {
          if (isEdit.value) {
            // 更新用户
            const index = userList.value.findIndex(u => u.id === userForm.id)
            if (index > -1) {
              userList.value[index] = { ...userList.value[index], ...userForm }
            }
            ElMessage.success('用户更新成功')
          } else {
            // 添加用户
            const newUser = {
              id: Date.now(),
              ...userForm,
              status: 'active',
              createTime: new Date().toLocaleString()
            }
            userList.value.unshift(newUser)
            ElMessage.success('用户添加成功')
          }

          showAddDialog.value = false
          submitLoading.value = false
        }, 1000)
      } catch (error) {
        submitLoading.value = false
        console.error('表单验证失败:', error)
      }
    }

    // 切换用户状态
    const handleToggleStatus = (row) => {
      const action = row.status === 'active' ? '禁用' : '启用'
      ElMessageBox.confirm(
        `确定要${action}用户 "${row.realName}" 吗？`,
        '确认操作',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        row.status = row.status === 'active' ? 'inactive' : 'active'
        ElMessage.success(`用户${action}成功`)
      }).catch(() => {
        // 用户取消操作
      })
    }

    // 删除用户
    const handleDelete = (row) => {
      ElMessageBox.confirm(
        `确定要删除用户 "${row.realName}" 吗？此操作不可恢复！`,
        '确认删除',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        const index = userList.value.findIndex(u => u.id === row.id)
        if (index > -1) {
          userList.value.splice(index, 1)
          ElMessage.success('用户删除成功')
        }
      }).catch(() => {
        // 用户取消操作
      })
    }

    // 分页处理
    const handleSizeChange = (size) => {
      pagination.size = size
      pagination.current = 1
      loadUserList()
    }

    const handleCurrentChange = (current) => {
      pagination.current = current
      loadUserList()
    }

    onMounted(() => {
      loadUserList()
    })

    return {
      loading,
      submitLoading,
      showAddDialog,
      isEdit,
      userFormRef,
      searchForm,
      userForm,
      userRules,
      pagination,
      userList,
      getRoleText,
      getRoleTagType,
      handleSearch,
      handleReset,
      handleAdd,
      handleEdit,
      handleSubmit,
      handleToggleStatus,
      handleDelete,
      handleSizeChange,
      handleCurrentChange
    }
  }
}
</script>

<style scoped>
.user-management {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
}

.search-bar {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding: 20px 0;
}
</style> 