<template>
  <div class="profile-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">个人中心</h2>
      <p class="page-subtitle">管理您的个人信息和系统设置</p>
    </div>

    <el-row :gutter="20">
      <!-- 左侧个人信息卡片 -->
      <el-col :xs="24" :sm="24" :md="8" :lg="8">
        <div class="profile-card">
          <div class="profile-header">
            <div class="avatar-section">
              <el-avatar :size="80" :src="userInfo.avatar">
                {{ userInfo.name.charAt(0) }}
              </el-avatar>
              <div class="user-basic-info">
                <h3>{{ userInfo.name }}</h3>
                <p class="user-role">{{ getRoleText(userInfo.role) }}</p>
                <p class="user-id">ID: {{ userInfo.userId }}</p>
              </div>
            </div>
            <el-button type="primary" @click="editProfile = true">
              <el-icon><Edit /></el-icon>
              编辑资料
            </el-button>
          </div>
          
          <el-divider />
          
          <div class="profile-stats">
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
        </div>

        <!-- 快捷操作 -->
        <div class="quick-actions-card">
          <h4>快捷操作</h4>
          <div class="action-buttons">
            <el-button 
              v-for="action in quickActions" 
              :key="action.name"
              :type="action.type"
              @click="handleQuickAction(action.path)"
              class="action-btn"
            >
              <el-icon>
                <component :is="action.icon" v-if="action.icon" />
              </el-icon>
              {{ action.name }}
            </el-button>
          </div>
        </div>
      </el-col>

      <!-- 右侧内容区域 -->
      <el-col :xs="24" :sm="24" :md="16" :lg="16">
        <el-tabs v-model="activeTab" class="profile-tabs">
          <!-- 基本信息 -->
          <el-tab-pane label="基本信息" name="basic">
            <div class="tab-content">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="姓名">{{ userInfo.name }}</el-descriptions-item>
                <el-descriptions-item label="角色">{{ getRoleText(userInfo.role) }}</el-descriptions-item>
                <el-descriptions-item label="用户ID">{{ userInfo.userId }}</el-descriptions-item>
                <el-descriptions-item label="邮箱">{{ userInfo.email }}</el-descriptions-item>
                <el-descriptions-item label="手机号">{{ userInfo.phone }}</el-descriptions-item>
                <el-descriptions-item label="注册时间">{{ userInfo.registerTime }}</el-descriptions-item>
                <el-descriptions-item label="最后登录">{{ userInfo.lastLoginTime }}</el-descriptions-item>
                <el-descriptions-item label="状态">
                  <el-tag :type="userInfo.status === 'active' ? 'success' : 'danger'">
                    {{ userInfo.status === 'active' ? '正常' : '禁用' }}
                  </el-tag>
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </el-tab-pane>

          <!-- 信息中心 -->
          <el-tab-pane label="信息中心" name="messages">
            <div class="tab-content">
              <div class="messages-header">
                <h4>消息列表</h4>
                <el-button 
                  v-if="isAdmin || isTeacher"
                  type="primary" 
                  @click="composeMessage = true"
                >
                  <el-icon><Edit /></el-icon>
                  发送消息
                </el-button>
              </div>
              
              <el-table :data="messages" style="width: 100%">
                <el-table-column prop="type" label="类型" width="100">
                  <template #default="scope">
                    <el-tag :type="getMessageTypeColor(scope.row.type)">
                      {{ getMessageTypeText(scope.row.type) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="title" label="标题" />
                <el-table-column prop="sender" label="发送者" width="120" />
                <el-table-column prop="time" label="时间" width="180" />
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="scope">
                    <el-tag :type="scope.row.status === 'read' ? 'info' : 'warning'">
                      {{ scope.row.status === 'read' ? '已读' : '未读' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="120">
                  <template #default="scope">
                    <el-button type="text" @click="viewMessage(scope.row)">查看</el-button>
                    <el-button type="text" @click="deleteMessage(scope.row.id)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>

          <!-- 操作日志 -->
          <el-tab-pane label="操作日志" name="logs">
            <div class="tab-content">
              <div class="logs-header">
                <h4>操作记录</h4>
                <el-date-picker
                  v-model="logDateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  @change="filterLogs"
                />
              </div>
              
              <el-table :data="operationLogs" style="width: 100%">
                <el-table-column prop="time" label="操作时间" width="180" />
                <el-table-column prop="operation" label="操作内容" />
                <el-table-column prop="ip" label="IP地址" width="140" />
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="scope">
                    <el-tag :type="scope.row.status === 'success' ? 'success' : 'danger'">
                      {{ scope.row.status === 'success' ? '成功' : '失败' }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>

          <!-- 安全设置 -->
          <el-tab-pane label="安全设置" name="security">
            <div class="tab-content">
              <div class="security-section">
                <h4>密码修改</h4>
                <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="100px">
                  <el-form-item label="当前密码" prop="oldPassword">
                    <el-input v-model="passwordForm.oldPassword" type="password" show-password />
                  </el-form-item>
                  <el-form-item label="新密码" prop="newPassword">
                    <el-input v-model="passwordForm.newPassword" type="password" show-password />
                  </el-form-item>
                  <el-form-item label="确认密码" prop="confirmPassword">
                    <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="changePassword">修改密码</el-button>
                  </el-form-item>
                </el-form>
              </div>
              
              <el-divider />
              
              <div class="security-section">
                <h4>登录设备</h4>
                <el-table :data="loginDevices" style="width: 100%">
                  <el-table-column prop="device" label="设备" />
                  <el-table-column prop="location" label="登录地点" />
                  <el-table-column prop="time" label="登录时间" width="180" />
                  <el-table-column prop="status" label="状态" width="100">
                    <template #default="scope">
                      <el-tag :type="scope.row.status === 'current' ? 'success' : 'info'">
                        {{ scope.row.status === 'current' ? '当前设备' : '其他设备' }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="120">
                    <template #default="scope">
                      <el-button 
                        v-if="scope.row.status !== 'current'"
                        type="text" 
                        @click="logoutDevice(scope.row.id)"
                      >
                        退出登录
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>

    <!-- 编辑个人信息对话框 -->
    <el-dialog v-model="editProfile" title="编辑个人信息" width="500px">
      <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="100px">
        <el-form-item label="头像">
          <el-upload
            class="avatar-uploader"
            action="#"
            :show-file-list="false"
            :before-upload="beforeAvatarUpload"
          >
            <el-avatar v-if="editForm.avatar" :src="editForm.avatar" :size="100" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
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

    <!-- 发送消息对话框 -->
    <el-dialog v-model="composeMessage" title="发送消息" width="600px">
      <el-form :model="messageForm" :rules="messageRules" ref="messageFormRef" label-width="100px">
        <el-form-item label="接收者" prop="receiver">
          <el-select v-model="messageForm.receiver" placeholder="选择接收者" style="width: 100%">
            <el-option label="全体教师" value="all_teachers" />
            <el-option label="全体助教" value="all_assistants" />
            <el-option label="全体用户" value="all_users" />
          </el-select>
        </el-form-item>
        <el-form-item label="消息类型" prop="type">
          <el-select v-model="messageForm.type" placeholder="选择消息类型" style="width: 100%">
            <el-option label="通知" value="notification" />
            <el-option label="提醒" value="reminder" />
            <el-option label="公告" value="announcement" />
          </el-select>
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input v-model="messageForm.title" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input v-model="messageForm.content" type="textarea" :rows="4" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="composeMessage = false">取消</el-button>
          <el-button type="primary" @click="sendMessage">发送</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { userLogHelper } from '@/utils/logHelper'
import { 
  Edit, 
  Plus, 
  Reading, 
  EditPen, 
  FolderOpened, 
  Setting, 
  User, 
  Document, 
  Monitor 
} from '@element-plus/icons-vue'

export default {
  name: 'Profile',
  components: {
    Edit,
    Plus,
    Reading,
    EditPen,
    FolderOpened,
    Setting,
    User,
    Document,
    Monitor
  },
  setup() {
    const router = useRouter()
    const userStore = useUserStore()
    
    // 用户身份计算属性
    const isAdmin = computed(() => userStore.isAdmin)
    const isTeacher = computed(() => userStore.isTeacher)
    const currentUserId = computed(() => userStore.userInfo?.id || userStore.userInfo?.name || '')
    
    // 响应式数据
    const activeTab = ref('basic')
    const editProfile = ref(false)
    const composeMessage = ref(false)
    const logDateRange = ref([])
    
    // 用户信息 - 从用户store获取真实数据
    const userInfo = reactive({
      name: userStore.userName,
      role: userStore.userRole,
      userId: userStore.userInfo?.id || userStore.userName || '未知',
      email: userStore.userInfo?.email || '未设置',
      phone: userStore.userInfo?.phone || '未设置',
      avatar: userStore.userAvatar,
      registerTime: '2024-01-15', // 这个需要从后端获取
      lastLoginTime: new Date().toLocaleString('zh-CN'), // 当前登录时间
      status: 'active'
    })
    
    // 统计数据 - 根据用户身份显示不同数据
    const stats = computed(() => ({
      courses: isAdmin.value ? 0 : 12, // 管理员不显示课程数
      students: isAdmin.value ? 0 : 156, // 管理员不显示学生数
      homework: isAdmin.value ? 0 : 45, // 管理员不显示作业数
      users: isAdmin.value ? 156 : 0, // 管理员显示用户数
      logs: isAdmin.value ? 1250 : 0, // 管理员显示日志数
      settings: isAdmin.value ? 8 : 0 // 管理员显示设置数
    }))
    
    // 快捷操作 - 根据用户身份显示不同操作
    const quickActions = computed(() => {
      if (isAdmin.value) {
        return [
          { name: '用户管理', icon: 'User', type: 'primary', path: '/dashboard/admin/users' },
          { name: '系统设置', icon: 'Setting', type: 'success', path: '/dashboard/admin/settings' },
          { name: '日志管理', icon: 'Document', type: 'warning', path: '/dashboard/log' },
          { name: '系统监控', icon: 'Monitor', type: 'info', path: '/dashboard/admin/monitor' }
        ]
      } else if (isTeacher.value) {
        return [
          { name: '查看课程', icon: 'Reading', type: 'primary', path: '/dashboard/course/list' },
          { name: '发布作业', icon: 'EditPen', type: 'success', path: '/dashboard/assign/list' },
          { name: '查看资源', icon: 'FolderOpened', type: 'warning', path: '/dashboard/resource/list' },
          { name: '我的日志', icon: 'Document', type: 'info', path: '/dashboard/log' }
        ]
      } else {
        // 助教
        return [
          { name: '查看课程', icon: 'Reading', type: 'primary', path: '/dashboard/course/list' },
          { name: '批改作业', icon: 'EditPen', type: 'success', path: '/dashboard/assign/list' },
          { name: '查看资源', icon: 'FolderOpened', type: 'warning', path: '/dashboard/resource/list' },
          { name: '我的日志', icon: 'Document', type: 'info', path: '/dashboard/log' }
        ]
      }
    })
    
    // 消息列表
    const messages = ref([
      {
        id: 1,
        type: 'notification',
        title: '系统维护通知',
        sender: '系统管理员',
        time: '2024-01-20 09:00:00',
        status: 'read'
      },
      {
        id: 2,
        type: 'reminder',
        title: '作业批改提醒',
        sender: '李老师',
        time: '2024-01-19 16:30:00',
        status: 'unread'
      },
      {
        id: 3,
        type: 'announcement',
        title: '新学期教学安排',
        sender: '教务处',
        time: '2024-01-18 14:20:00',
        status: 'read'
      }
    ])
    
    // 操作日志
    const operationLogs = ref([
      {
        time: '2024-01-20 10:30:00',
        operation: '登录系统',
        ip: '192.168.1.100',
        status: 'success'
      },
      {
        time: '2024-01-20 09:15:00',
        operation: '创建课程《Web开发基础》',
        ip: '192.168.1.100',
        status: 'success'
      },
      {
        time: '2024-01-19 16:45:00',
        operation: '发布作业《JavaScript练习》',
        ip: '192.168.1.100',
        status: 'success'
      }
    ])
    
    // 登录设备
    const loginDevices = ref([
      {
        id: 1,
        device: 'Chrome - Windows 10',
        location: '北京市',
        time: '2024-01-20 10:30:00',
        status: 'current'
      },
      {
        id: 2,
        device: 'Safari - iPhone',
        location: '北京市',
        time: '2024-01-19 15:20:00',
        status: 'other'
      }
    ])
    
    // 表单数据 - 使用用户store中的真实数据
    const editForm = reactive({
      avatar: userStore.userAvatar,
      name: userStore.userName,
      email: userStore.userInfo?.email || '',
      phone: userStore.userInfo?.phone || ''
    })
    
    const passwordForm = reactive({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    
    const messageForm = reactive({
      receiver: '',
      type: '',
      title: '',
      content: ''
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
    
    const passwordRules = {
      oldPassword: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
      newPassword: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
      ],
      confirmPassword: [
        { required: true, message: '请确认密码', trigger: 'blur' },
        {
          validator: (rule, value, callback) => {
            if (value !== passwordForm.newPassword) {
              callback(new Error('两次输入的密码不一致'))
            } else {
              callback()
            }
          },
          trigger: 'blur'
        }
      ]
    }
    
    const messageRules = {
      receiver: [{ required: true, message: '请选择接收者', trigger: 'change' }],
      type: [{ required: true, message: '请选择消息类型', trigger: 'change' }],
      title: [{ required: true, message: '请输入消息标题', trigger: 'blur' }],
      content: [{ required: true, message: '请输入消息内容', trigger: 'blur' }]
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
    
    const getMessageTypeColor = (type) => {
      const colorMap = {
        'notification': 'primary',
        'reminder': 'warning',
        'announcement': 'success'
      }
      return colorMap[type] || 'info'
    }
    
    const getMessageTypeText = (type) => {
      const textMap = {
        'notification': '通知',
        'reminder': '提醒',
        'announcement': '公告'
      }
      return textMap[type] || '其他'
    }
    
    const handleQuickAction = (path) => {
      router.push(path)
    }
    
    const viewMessage = (message) => {
      ElMessage.info(`查看消息：${message.title}`)
    }
    
    const deleteMessage = (id) => {
      ElMessageBox.confirm('确定要删除这条消息吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = messages.value.findIndex(m => m.id === id)
        if (index > -1) {
          messages.value.splice(index, 1)
          ElMessage.success('消息删除成功')
        }
      })
    }
    
    const filterLogs = () => {
      ElMessage.info('日志筛选功能')
    }
    
    const beforeAvatarUpload = (file) => {
      const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPG) {
        ElMessage.error('上传头像图片只能是 JPG/PNG 格式!')
        return false
      }
      if (!isLt2M) {
        ElMessage.error('上传头像图片大小不能超过 2MB!')
        return false
      }
      
      // 模拟上传成功，更新头像
      const reader = new FileReader()
      reader.onload = (e) => {
        editForm.avatar = e.target.result
        userInfo.avatar = e.target.result
        // 更新用户store中的头像
        userStore.updateUserInfo({ avatar: e.target.result })
        ElMessage.success('头像上传成功')
      }
      reader.readAsDataURL(file)
      
      return false // 阻止默认上传行为
    }
    
    const saveProfile = async () => {
      try {
        // 更新用户store中的信息
        userStore.updateUserInfo({
          name: editForm.name,
          email: editForm.email,
          phone: editForm.phone,
          avatar: editForm.avatar
        })
        
        // 更新本地显示的用户信息
        Object.assign(userInfo, editForm)
        editProfile.value = false
        ElMessage.success('个人信息保存成功')
        
        // 记录更新个人信息的日志
        try {
          await userLogHelper.updateProfile()
        } catch (error) {
          console.error('记录更新个人信息日志失败:', error)
        }
      } catch (error) {
        console.error('保存个人信息失败:', error)
        ElMessage.error('保存失败，请重试')
      }
    }
    
    const changePassword = async () => {
      try {
        // 这里应该调用后端API修改密码
        // 暂时模拟成功
        ElMessage.success('密码修改成功')
        passwordForm.oldPassword = ''
        passwordForm.newPassword = ''
        passwordForm.confirmPassword = ''
        
        // 记录修改密码的日志
        try {
          await userLogHelper.changePassword()
        } catch (error) {
          console.error('记录修改密码日志失败:', error)
        }
      } catch (error) {
        console.error('修改密码失败:', error)
        ElMessage.error('修改密码失败，请重试')
      }
    }
    
    const sendMessage = () => {
      // 只有管理员和教师可以发送消息
      if (!isAdmin.value && !isTeacher.value) {
        ElMessage.warning('助教没有发送消息的权限')
        return
      }
      
      ElMessage.success('消息发送成功')
      composeMessage.value = false
      messageForm.receiver = ''
      messageForm.type = ''
      messageForm.title = ''
      messageForm.content = ''
    }
    
    const logoutDevice = (id) => {
      ElMessageBox.confirm('确定要退出该设备的登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const index = loginDevices.value.findIndex(d => d.id === id)
        if (index > -1) {
          const device = loginDevices.value[index]
          
          // 记录设备退出登录日志
          try {
            await userLogHelper.logout(`${userStore.userName} - 设备退出: ${device.device}`)
          } catch (error) {
            console.error('记录设备退出登录日志失败:', error)
          }
          
          loginDevices.value.splice(index, 1)
          ElMessage.success('设备退出成功')
        }
      })
    }
    
    onMounted(() => {
      // 初始化用户信息
      if (userStore.userInfo) {
        // 更新编辑表单的初始值
        Object.assign(editForm, {
          name: userStore.userName,
          email: userStore.userInfo.email || '',
          phone: userStore.userInfo.phone || '',
          avatar: userStore.userAvatar
        })
        
        // 更新显示的用户信息
        Object.assign(userInfo, {
          name: userStore.userName,
          role: userStore.userRole,
          userId: userStore.userInfo.id || userStore.userName,
          email: userStore.userInfo.email || '未设置',
          phone: userStore.userInfo.phone || '未设置',
          avatar: userStore.userAvatar,
          lastLoginTime: new Date().toLocaleString('zh-CN')
        })
      }
      
      console.log('个人中心初始化完成，用户信息:', userStore.userInfo)
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
          phone: newUserInfo.phone || '未设置',
          avatar: userStore.userAvatar
        })
        
        // 更新编辑表单
        Object.assign(editForm, {
          name: userStore.userName,
          email: newUserInfo.email || '',
          phone: newUserInfo.phone || '',
          avatar: userStore.userAvatar
        })
      }
    }, { deep: true })
    
    return {
      activeTab,
      editProfile,
      composeMessage,
      logDateRange,
      userInfo,
      stats,
      quickActions,
      messages,
      operationLogs,
      loginDevices,
      editForm,
      passwordForm,
      messageForm,
      editRules,
      passwordRules,
      messageRules,
      isAdmin,
      isTeacher,
      currentUserId,
      getRoleText,
      getMessageTypeColor,
      getMessageTypeText,
      handleQuickAction,
      viewMessage,
      deleteMessage,
      filterLogs,
      beforeAvatarUpload,
      saveProfile,
      changePassword,
      sendMessage,
      logoutDevice
    }
  }
}
</script>

<style scoped>
.profile-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 120px);
}

.page-header {
  margin-bottom: 20px;
  text-align: center;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.profile-card {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-basic-info h3 {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.user-role {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #409eff;
  font-weight: 500;
}

.user-id {
  margin: 0;
  font-size: 12px;
  color: #909399;
}

.profile-stats {
  display: flex;
  justify-content: space-around;
  text-align: center;
}

.stat-item {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #909399;
}

.quick-actions-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.quick-actions-card h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.action-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.action-btn {
  height: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.profile-tabs {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.tab-content {
  padding: 20px;
}

.messages-header,
.logs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.messages-header h4,
.logs-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.security-section {
  margin-bottom: 30px;
}

.security-section h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.avatar-uploader {
  text-align: center;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
  border: 1px dashed #d9d9d9;
  border-radius: 50%;
}

.avatar-uploader-icon:hover {
  border-color: #409eff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .profile-container {
    padding: 10px;
  }
  
  .profile-header {
    flex-direction: column;
    gap: 16px;
    align-items: center;
  }
  
  .action-buttons {
    grid-template-columns: 1fr;
  }
  
  .messages-header,
  .logs-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}
</style> 