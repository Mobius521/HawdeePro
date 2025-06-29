<template>
    <div class="dashboard">
      <!-- 欢迎信息 -->
      <div class="welcome-card card">
        <div class="welcome-content">
          <div class="welcome-text">
            <h2>欢迎回来，{{ userStore.userName }}!</h2>
            <p>今天是 {{ currentDate }}，您的身份是：{{ getRoleText(userStore.userRole) }}</p>
          </div>
          <div class="welcome-stats">
            <div class="stat-item">
              <span class="stat-number">{{ todayStats.courses }}</span>
              <span class="stat-label">今日课程</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ todayStats.students }}</span>
              <span class="stat-label">在线学生</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ todayStats.homework }}</span>
              <span class="stat-label">待批作业</span>
            </div>
          </div>
        </div>
      </div>
  
      <!-- 统计卡片 -->
      <el-row :gutter="20" class="stats-row">
        <el-col :xs="12" :sm="6" :md="6" :lg="6">
          <div class="stat-card primary">
            <div class="stat-icon">
              <el-icon><Reading /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.totalCourses }}</div>
              <div class="stat-label">总课程数</div>
            </div>
          </div>
        </el-col>
        
        <el-col :xs="12" :sm="6" :md="6" :lg="6">
          <div class="stat-card success">
            <div class="stat-icon">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.totalStudents }}</div>
              <div class="stat-label">学生总数</div>
            </div>
          </div>
        </el-col>
        
        <el-col :xs="12" :sm="6" :md="6" :lg="6">
          <div class="stat-card warning">
            <div class="stat-icon">
              <el-icon><EditPen /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.totalHomework }}</div>
              <div class="stat-label">作业总数</div>
            </div>
          </div>
        </el-col>
        
        <el-col :xs="12" :sm="6" :md="6" :lg="6">
          <div class="stat-card danger">
            <div class="stat-icon">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.totalExams }}</div>
              <div class="stat-label">考试总数</div>
            </div>
          </div>
        </el-col>
      </el-row>
  
      <!-- 主要内容区域 -->
      <el-row :gutter="20" class="content-row">
        <!-- 左侧内容 -->
        <el-col :xs="24" :sm="24" :md="16" :lg="16">
          <!-- 课程进度图表 -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">课程进度统计</h3>
              <el-button type="text" size="small">查看详情</el-button>
            </div>
            <div class="chart-container">
              <v-chart :option="courseProgressOption" style="height: 300px;" />
            </div>
          </div>
  
          <!-- 最近活动 -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">最近活动</h3>
              <el-button type="text" size="small">查看全部</el-button>
            </div>
            <div class="activity-list">
              <div
                v-for="activity in recentActivities"
                :key="activity.id"
                class="activity-item"
              >
                <div class="activity-icon" :class="activity.type">
                  <el-icon>
                    <component :is="activity.icon" />
                  </el-icon>
                </div>
                <div class="activity-content">
                  <div class="activity-title">{{ activity.title }}</div>
                  <div class="activity-time">{{ activity.time }}</div>
                </div>
              </div>
            </div>
          </div>
        </el-col>
  
        <!-- 右侧内容 -->
        <el-col :xs="24" :sm="24" :md="8" :lg="8">
          <!-- 快速操作 -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">快速操作</h3>
            </div>
            <div class="quick-actions">
              <el-button
                v-for="action in getQuickActions()"
                :key="action.name"
                :type="action.type"
                class="action-button"
                @click="handleQuickAction(action.path)"
              >
                <el-icon><component :is="action.icon" /></el-icon>
                {{ action.name }}
              </el-button>
            </div>
          </div>
  
          <!-- 待办事项 -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">待办事项</h3>
              <el-badge :value="todoList.length" type="danger" />
            </div>
            <div class="todo-list">
              <div
                v-for="todo in todoList"
                :key="todo.id"
                class="todo-item"
                :class="{ completed: todo.completed }"
              >
                <el-checkbox
                  v-model="todo.completed"
                  @change="handleTodoChange(todo)"
                />
                <span class="todo-text">{{ todo.text }}</span>
                <span class="todo-date">{{ todo.date }}</span>
              </div>
            </div>
          </div>
  
          <!-- 系统通知 -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">系统通知</h3>
              <el-badge :value="notifications.length" type="warning" />
            </div>
            <div class="notification-list">
              <div
                v-for="notification in notifications"
                :key="notification.id"
                class="notification-item"
                :class="notification.type"
              >
                <div class="notification-content">
                  <div class="notification-title">{{ notification.title }}</div>
                  <div class="notification-time">{{ notification.time }}</div>
                </div>
                <el-button type="text" size="small" @click="markAsRead(notification.id)">
                  标记已读
                </el-button>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
  </template>
  
  <script>
  import { ref, reactive, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { useUserStore } from '@/stores/user'
  import { formatDate } from '@/utils'
  import VChart from 'vue-echarts'
  
  export default {
    name: 'Dashboard',
    components: {
      VChart
    },
    setup() {
      const router = useRouter()
      const userStore = useUserStore()
  
      // 当前日期
      const currentDate = ref(formatDate(new Date(), 'YYYY年MM月DD日'))
  
      // 今日统计
      const todayStats = reactive({
        courses: 3,
        students: 156,
        homework: 12
      })
  
      // 总体统计
      const stats = reactive({
        totalCourses: 15,
        totalStudents: 456,
        totalHomework: 89,
        totalExams: 23
      })
  
      // 课程进度图表配置
      const courseProgressOption = ref({
        title: {
          text: '本月课程完成情况',
          left: 'center',
          textStyle: {
            fontSize: 14,
            color: '#303133'
          }
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['计划课程', '已完成课程'],
          bottom: 0
        },
        xAxis: {
          type: 'category',
          data: ['第1周', '第2周', '第3周', '第4周']
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '计划课程',
            type: 'bar',
            data: [12, 15, 18, 20],
            itemStyle: {
              color: '#409eff'
            }
          },
          {
            name: '已完成课程',
            type: 'bar',
            data: [10, 14, 16, 18],
            itemStyle: {
              color: '#67c23a'
            }
          }
        ]
      })
  
      // 获取角色文本
      const getRoleText = (role) => {
        const roleMap = {
          'teacher': '教师',
          'assistant': '助教',
          'admin': '系统管理员'
        }
        return roleMap[role] || '未知角色'
      }
  
      // 根据角色获取快速操作
      const getQuickActions = () => {
        const baseActions = [
          { name: '查看课程', icon: 'Reading', type: 'primary', path: '/dashboard/course/list' },
          { name: '查看资源', icon: 'FolderOpened', type: 'success', path: '/dashboard/resource/list' }
        ]
        
        if (userStore.isTeacher) {
          return [
            ...baseActions,
            { name: '创建课程', icon: 'Plus', type: 'primary', path: '/dashboard/course/create' },
            { name: '布置作业', icon: 'EditPen', type: 'warning', path: '/dashboard/homework/create' },
            { name: '上传资源', icon: 'Upload', type: 'info', path: '/dashboard/resource/upload' }
          ]
        } else if (userStore.isAssistant) {
          return [
            ...baseActions,
            { name: '协助批改', icon: 'Check', type: 'warning', path: '/dashboard/homework/assist' },
            { name: '查看成绩', icon: 'Document', type: 'info', path: '/dashboard/grade/view' }
          ]
        } else if (userStore.isAdmin) {
          return [
            { name: '用户管理', icon: 'User', type: 'primary', path: '/dashboard/admin/users' },
            { name: '系统设置', icon: 'Setting', type: 'success', path: '/dashboard/admin/settings' },
            { name: '课程审核', icon: 'Check', type: 'warning', path: '/dashboard/admin/course-audit' },
            { name: '系统监控', icon: 'Monitor', type: 'info', path: '/dashboard/admin/monitor' }
          ]
        }
        
        return baseActions
      }
  
      // 最近活动
      const recentActivities = ref([
        {
          id: 1,
          title: '发布了新作业《数据结构练习》',
          time: '2小时前',
          type: 'homework',
          icon: 'EditPen'
        },
        {
          id: 2,
          title: '上传了课程资源《算法分析PPT》',
          time: '4小时前',
          type: 'resource',
          icon: 'Upload'
        },
        {
          id: 3,
          title: '创建了新课程《Web开发基础》',
          time: '1天前',
          type: 'course',
          icon: 'Reading'
        },
        {
          id: 4,
          title: '批改了15份作业',
          time: '2天前',
          type: 'grade',
          icon: 'Check'
        }
      ])
  
      // 待办事项
      const todoList = ref([
        { id: 1, text: '批改《数据库设计》作业', date: '今天', completed: false },
        { id: 2, text: '准备下周课程PPT', date: '明天', completed: false },
        { id: 3, text: '回复学生问题', date: '今天', completed: true },
        { id: 4, text: '更新课程大纲', date: '本周', completed: false }
      ])
  
      // 系统通知
      const notifications = ref([
        {
          id: 1,
          title: '系统将于今晚22:00进行维护',
          time: '1小时前',
          type: 'warning'
        },
        {
          id: 2,
          title: '新功能：支持视频直播教学',
          time: '3小时前',
          type: 'info'
        },
        {
          id: 3,
          title: '您有3个学生申请课程答疑',
          time: '5小时前',
          type: 'primary'
        }
      ])
  
      // 处理快速操作
      const handleQuickAction = (path) => {
        router.push(path)
      }
  
      // 处理待办事项变更
      const handleTodoChange = (todo) => {
        console.log('Todo changed:', todo)
      }
  
      // 标记通知为已读
      const markAsRead = (id) => {
        const index = notifications.value.findIndex(n => n.id === id)
        if (index > -1) {
          notifications.value.splice(index, 1)
        }
      }
  
      onMounted(() => {
        // 初始化用户信息
        userStore.initUserInfo()
      })
  
      return {
        userStore,
        currentDate,
        todayStats,
        stats,
        courseProgressOption,
        getRoleText,
        getQuickActions,
        recentActivities,
        todoList,
        notifications,
        handleQuickAction,
        handleTodoChange,
        markAsRead
      }
    }
  }
  </script>
  
  <style scoped>
  .dashboard {
    padding: 0;
  }
  
  .welcome-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    margin-bottom: 20px;
  }
  
  .welcome-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .welcome-text h2 {
    margin: 0 0 8px 0;
    font-size: 24px;
    font-weight: 600;
  }
  
  .welcome-text p {
    margin: 0;
    opacity: 0.9;
  }
  
  .welcome-stats {
    display: flex;
    gap: 30px;
  }
  
  .stat-item {
    text-align: center;
  }
  
  .stat-item .stat-number {
    display: block;
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 4px;
  }
  
  .stat-item .stat-label {
    font-size: 12px;
    opacity: 0.8;
  }
  
  .stats-row {
    margin-bottom: 20px;
  }
  
  .stat-card {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    display: flex;
    align-items: center;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
    transition: transform 0.3s, box-shadow 0.3s;
  }
  
  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px 0 rgba(0,0,0,.15);
  }
  
  .stat-card.primary {
    border-left: 4px solid #409eff;
  }
  
  .stat-card.success {
    border-left: 4px solid #67c23a;
  }
  
  .stat-card.warning {
    border-left: 4px solid #e6a23c;
  }
  
  .stat-card.danger {
    border-left: 4px solid #f56c6c;
  }
  
  .stat-icon {
    font-size: 32px;
    margin-right: 16px;
    opacity: 0.8;
  }
  
  .stat-card.primary .stat-icon {
    color: #409eff;
  }
  
  .stat-card.success .stat-icon {
    color: #67c23a;
  }
  
  .stat-card.warning .stat-icon {
    color: #e6a23c;
  }
  
  .stat-card.danger .stat-icon {
    color: #f56c6c;
  }
  
  .stat-content .stat-number {
    font-size: 28px;
    font-weight: bold;
    color: #303133;
    margin-bottom: 4px;
  }
  
  .stat-content .stat-label {
    font-size: 14px;
    color: #909399;
  }
  
  .content-row {
    margin-top: 20px;
  }
  
  .chart-container {
    padding: 20px 0;
  }
  
  .chart-placeholder {
    height: 300px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #909399;
    background: #fafafa;
    border: 1px dashed #d9d9d9;
    border-radius: 4px;
  }
  
  .chart-placeholder p {
    margin: 10px 0 0 0;
    font-size: 14px;
  }
  
  .activity-list {
    max-height: 300px;
    overflow-y: auto;
  }
  
  .activity-item {
    display: flex;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .activity-item:last-child {
    border-bottom: none;
  }
  
  .activity-icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
    font-size: 14px;
    color: #fff;
  }
  
  .activity-icon.homework {
    background: #e6a23c;
  }
  
  .activity-icon.resource {
    background: #67c23a;
  }
  
  .activity-icon.course {
    background: #409eff;
  }
  
  .activity-icon.grade {
    background: #f56c6c;
  }
  
  .activity-content {
    flex: 1;
  }
  
  .activity-title {
    font-size: 14px;
    color: #303133;
    margin-bottom: 4px;
  }
  
  .activity-time {
    font-size: 12px;
    color: #909399;
  }
  
  .quick-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  
  .action-button {
    height: 60px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
  }
  
  .todo-list {
    max-height: 200px;
    overflow-y: auto;
  }
  
  .todo-item {
    display: flex;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .todo-item:last-child {
    border-bottom: none;
  }
  
  .todo-item.completed .todo-text {
    text-decoration: line-through;
    color: #909399;
  }
  
  .todo-text {
    flex: 1;
    margin: 0 8px;
    font-size: 14px;
  }
  
  .todo-date {
    font-size: 12px;
    color: #909399;
  }
  
  .notification-list {
    max-height: 250px;
    overflow-y: auto;
  }
  
  .notification-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;
    border-left: 3px solid transparent;
    padding-left: 12px;
  }
  
  .notification-item:last-child {
    border-bottom: none;
  }
  
  .notification-item.warning {
    border-left-color: #e6a23c;
  }
  
  .notification-item.info {
    border-left-color: #409eff;
  }
  
  .notification-item.primary {
    border-left-color: #67c23a;
  }
  
  .notification-content {
    flex: 1;
  }
  
  .notification-title {
    font-size: 14px;
    color: #303133;
    margin-bottom: 4px;
  }
  
  .notification-time {
    font-size: 12px;
    color: #909399;
  }
  
  /* 响应式设计 */
  @media (max-width: 768px) {
    .welcome-content {
      flex-direction: column;
      text-align: center;
      gap: 20px;
    }
  
    .welcome-stats {
      justify-content: center;
    }
  
    .quick-actions {
      grid-template-columns: 1fr;
    }
  
    .stat-item .stat-number {
      font-size: 20px;
    }
  
    .welcome-text h2 {
      font-size: 20px;
    }
  }
  </style>