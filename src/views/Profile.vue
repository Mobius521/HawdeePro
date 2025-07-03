<template>
  <div class="profile-container">
    <div class="profile-card unified-card">
      <div class="profile-header unified-header">
        <div class="avatar-section">
          <el-avatar :size="80" :src="userStore.userAvatar">
            {{ userInfo.name.charAt(0) }}
          </el-avatar>
          <div class="user-basic-info">
            <h3>{{ userInfo.name }}</h3>
            <p class="user-role">{{ getRoleText(userInfo.role) }}</p>
            <p class="user-id">工号: {{ userInfo.userId }}</p>
          </div>
        </div>
        <el-button type="primary" @click="editProfile = true">
          <el-icon><Edit /></el-icon>
          编辑资料
        </el-button>
      </div>
      <el-divider />
      <div class="profile-stats unified-stats">
        <template v-if="isAdmin">
          <div class="stat-item">
            <div class="stat-number">{{ stats.users }}</div>
            <div class="stat-label">用户数</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ stats.logs }}</div>
            <div class="stat-label">日志数</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ stats.settings }}</div>
            <div class="stat-label">设置项</div>
          </div>
        </template>
        <template v-else>
          <div class="stat-item">
            <div class="stat-number">{{ stats.courses }}</div>
            <div class="stat-label">课程数</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ stats.students }}</div>
            <div class="stat-label">学生数</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ stats.homework }}</div>
            <div class="stat-label">作业数</div>
          </div>
        </template>
      </div>
      <el-divider />
      <div class="profile-content unified-content">
        <h3>基本信息</h3>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="姓名">{{ userInfo.name }}</el-descriptions-item>
          <el-descriptions-item label="角色">{{ getRoleText(userInfo.role) }}</el-descriptions-item>
          <el-descriptions-item label="工号">{{ userInfo.userId }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ userInfo.email }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ userInfo.phone }}</el-descriptions-item>
          <el-descriptions-item label="注册时间">{{ userInfo.registerTime }}</el-descriptions-item>
          <el-descriptions-item label="最后登录">{{ userInfo.lastLoginTime }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </div>
    <!-- 编辑个人信息对话框 -->
    <el-dialog v-model="editProfile" title="编辑个人信息" width="500px">
      <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="100px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="editForm.phone" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editProfile = false">取消</el-button>
          <el-button type="primary" @click="saveProfile">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { userLogHelper } from '@/utils/logHelper'
import { Edit } from '@element-plus/icons-vue'
import { courseApi } from '@/api/course'
import { analysisApi } from '@/api/analysis'

export default {
  name: 'Profile',
  components: {
    Edit
  },
  setup() {
    const userStore = useUserStore()
    let courses = []
    
    // 用户身份计算属性
    const isAdmin = computed(() => userStore.isAdmin)
    const isTeacher = computed(() => userStore.isTeacher)
    
    // 响应式数据
    const editProfile = ref(false)
    
    // 用户信息 - 从用户store获取真实数据
    const userInfo = reactive({
      name: userStore.userName,
      role: userStore.userRole,
      userId: userStore.userInfo?.id || userStore.userInfo?.staffId || userStore.userName || '未知',
      email: userStore.userInfo?.email || '未设置',
      phone: userStore.userInfo?.phone || '未设置',
      registerTime: userStore.userInfo?.signTime || '2024-01-15', // 使用后端返回的注册时间
      lastLoginTime: new Date().toLocaleString('zh-CN') // 当前登录时间
    })
    
    // 统计数据 - 根据用户身份显示不同数据
    const stats = reactive({
      courses: 0,
      students: 0,
      homework: 0,
      users: 0,
      logs: 0,
      settings: 0
    })
    
    // 表单数据 - 使用用户store中的真实数据
    const editForm = reactive({
      name: userStore.userName,
      email: userStore.userInfo?.email || '',
      phone: userStore.userInfo?.phone || ''
    })
    
    // 表单验证规则
    const editRules = {
      name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
      email: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
      ],
      phone: [
        { required: true, message: '请输入手机号', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
      ]
    }
    
    // 方法
    const getRoleText = (role) => {
      const roleMap = {
        'teacher': '教师',
        'assistant': '助教',
        'admin': '系统管理员'
      }
      return roleMap[role] || '未知角色'
    }
    
    const saveProfile = async () => {
      try {
        // 调用后端API更新个人信息
        const result = await userStore.updateProfile(userStore.userInfo.id || userStore.userInfo.staffId, {
          name: editForm.name,
          email: editForm.email,
          phone: editForm.phone,
          roleType: userStore.userRole
        })
        
        if (result.success) {
          // 更新本地显示的用户信息
          Object.assign(userInfo, editForm)
          editProfile.value = false
          ElMessage.success(result.message || '个人信息保存成功')
          
          // 记录更新个人信息的日志
          try {
            await userLogHelper.updateProfile()
          } catch (error) {
            console.error('记录更新个人信息日志失败:', error)
          }
        } else {
          ElMessage.error(result.message || '保存失败，请重试')
        }
      } catch (error) {
        console.error('保存个人信息失败:', error)
        ElMessage.error('保存失败，请重试')
      }
    }
    
    onMounted(async () => {
      // 初始化用户信息
      if (userStore.userInfo && (userStore.userInfo.id || userStore.userInfo.staffId)) {
        try {
          // 从后端获取最新的个人信息
          const result = await userStore.getProfile(userStore.userInfo.id || userStore.userInfo.staffId)
          console.log('个人中心获取个人信息结果:', result)
          
          if (result.success) {
            // 更新编辑表单的初始值
            Object.assign(editForm, {
              name: userStore.userName,
              email: userStore.userInfo.email || '',
              phone: userStore.userInfo.phone || ''
            })
            
            // 更新显示的用户信息
            Object.assign(userInfo, {
              name: userStore.userName,
              role: userStore.userRole,
              userId: userStore.userInfo.id || userStore.userInfo.staffId || userStore.userName,
              email: userStore.userInfo.email || '未设置',
              phone: userStore.userInfo.phone || '未设置',
              registerTime: userStore.userInfo.signTime || '2024-01-15',
              lastLoginTime: new Date().toLocaleString('zh-CN')
            })
            
            console.log('个人中心用户信息更新完成:', userInfo)
          } else {
            console.log('获取个人信息失败:', result.message)
            // 如果获取失败，使用本地存储的信息
            Object.assign(editForm, {
              name: userStore.userName,
              email: userStore.userInfo.email || '',
              phone: userStore.userInfo.phone || ''
            })
            
            Object.assign(userInfo, {
              name: userStore.userName,
              role: userStore.userRole,
              userId: userStore.userInfo.id || userStore.userInfo.staffId || userStore.userName,
              email: userStore.userInfo.email || '未设置',
              phone: userStore.userInfo.phone || '未设置',
              lastLoginTime: new Date().toLocaleString('zh-CN')
            })
          }
        } catch (error) {
          console.error('获取个人信息失败:', error)
          // 如果获取失败，使用本地存储的信息
          Object.assign(editForm, {
            name: userStore.userName,
            email: userStore.userInfo.email || '',
            phone: userStore.userInfo.phone || ''
          })
          
          Object.assign(userInfo, {
            name: userStore.userName,
            role: userStore.userRole,
            userId: userStore.userInfo.id || userStore.userInfo.staffId || userStore.userName,
            email: userStore.userInfo.email || '未设置',
            phone: userStore.userInfo.phone || '未设置',
            lastLoginTime: new Date().toLocaleString('zh-CN')
          })
        }
      }
      
      console.log('个人中心初始化完成，用户信息:', userStore.userInfo)
      
      // 动态获取课程、学生、作业数
      if (userStore.userInfo && userStore.userInfo.id) {
        const courseRes = await courseApi.getCoursesByTeacher(userStore.userInfo.id)
        courses = courseRes?.data || []
        console.log('Profile.vue 获取到的courses:', courses)
        stats.courses = courses.length
        // 统计所有课程的学生（去重）
        let studentSet = new Set()
        let homeworkCount = 0
        // 并发获取所有课程的学生
        const studentPromises = courses.map(async c => {
          try {
            const res = await analysisApi.getStudentsByCourse(c.courseId)
            const students = res?.data || []
            students.forEach(s => studentSet.add(s.studentId || s.id))
          } catch (e) {
            // 忽略单个课程失败
          }
          if (c.homeworks && Array.isArray(c.homeworks)) {
            homeworkCount += c.homeworks.length
          }
        })
        await Promise.all(studentPromises)
        stats.students = studentSet.size
        stats.homework = homeworkCount
      }
    })
    
    // 监听用户信息变化
    watch(() => userStore.userInfo, (newUserInfo) => {
      if (newUserInfo) {
        // 更新显示的用户信息
        Object.assign(userInfo, {
          name: userStore.userName,
          role: userStore.userRole,
          userId: newUserInfo.id || userStore.userName,
          email: newUserInfo.email || '未设置',
          phone: newUserInfo.phone || '未设置'
        })
        
        // 更新编辑表单
        Object.assign(editForm, {
          name: userStore.userName,
          email: newUserInfo.email || '',
          phone: newUserInfo.phone || ''
        })
      }
    }, { deep: true })
    
    return {
      editProfile,
      userInfo,
      stats,
      editForm,
      editRules,
      isAdmin,
      isTeacher,
      getRoleText,
      saveProfile,
      userStore
    }
  }
}
</script>

<style scoped>
.profile-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 120px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
}
.unified-card {
  width: 100%;
  max-width: 700px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 24px 0 rgba(64,158,255,0.08);
  padding: 32px 32px 24px 32px;
  margin: 0 auto;
}
.unified-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.avatar-section {
  display: flex;
  align-items: center;
  gap: 20px;
}
.user-basic-info h3 {
  margin: 0 0 4px 0;
  font-size: 22px;
  font-weight: 700;
  color: #303133;
}
.user-role {
  margin: 0 0 4px 0;
  font-size: 15px;
  color: #409eff;
  font-weight: 500;
}
.user-id {
  margin: 0;
  font-size: 13px;
  color: #909399;
}
.unified-stats {
  display: flex;
  justify-content: space-around;
  text-align: center;
  margin: 16px 0 8px 0;
}
.stat-item {
  flex: 1;
}
.stat-number {
  font-size: 26px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 4px;
}
.stat-label {
  font-size: 13px;
  color: #909399;
}
.unified-content {
  margin-top: 16px;
}
.unified-content h3 {
  margin: 0 0 18px 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}
@media (max-width: 768px) {
  .unified-card {
    padding: 16px 4px 12px 4px;
    max-width: 98vw;
  }
  .unified-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  .unified-content {
    margin-top: 10px;
  }
}
</style> 