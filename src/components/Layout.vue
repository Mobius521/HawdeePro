<template>
    <div class="layout-container">
      <!-- 顶部导航 -->
      <el-header class="layout-header" height="60px">
        <div class="header-content">
          <div class="header-left">
            <el-button
              type="text"
              @click="toggleSidebar"
              class="sidebar-toggle"
            >
              <el-icon><Expand v-if="appStore.sidebarCollapsed" /><Fold v-else /></el-icon>
            </el-button>
            <h1 class="system-title">在线教学支持服务平台</h1>
          </div>
          
          <div class="header-right">
            <!-- 消息通知 -->
            <MessageNotification class="header-item" />
            
            <!-- 用户菜单 -->
            <el-dropdown class="header-item" @command="handleUserCommand">
              <div class="user-info">
                <el-avatar :size="32" :src="userStore.userAvatar">
                  {{ userStore.userName.charAt(0) }}
                </el-avatar>
                <span class="user-name">{{ userStore.userName }}</span>
                <el-icon><ArrowDown /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">
                    <el-icon><User /></el-icon>个人中心
                  </el-dropdown-item>
                  <el-dropdown-item command="settings">
                    <el-icon><Setting /></el-icon>系统设置
                  </el-dropdown-item>
                  <el-dropdown-item divided command="logout">
                    <el-icon><SwitchButton /></el-icon>退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </el-header>
  
      <!-- 主体内容 -->
      <el-container class="layout-main">
        <!-- 侧边栏 -->
        <el-aside class="layout-sidebar" :width="appStore.sidebarWidth">
          <el-scrollbar>
            <el-menu
              :default-active="$route.path"
              :collapse="appStore.sidebarCollapsed"
              :unique-opened="true"
              router
              class="sidebar-menu"
            >
              <!-- 工作台 -->
              <el-menu-item index="/dashboard/home">
                <el-icon><House /></el-icon>
                <template #title>工作台</template>
              </el-menu-item>
              
              <!-- 个人中心 -->
              <el-menu-item index="/dashboard/profile">
                <el-icon><User /></el-icon>
                <template #title>个人中心</template>
              </el-menu-item>
              
              <!-- 网站门户 - 仅管理员可见 -->
              <el-menu-item v-if="userStore.isAdmin" index="/dashboard/portal">
                <el-icon><Monitor /></el-icon>
                <template #title>网站门户</template>
              </el-menu-item>
              
              <!-- 课程管理 -->
              <el-sub-menu index="/dashboard/course">
                <template #title>
                  <el-icon><Reading /></el-icon>
                  <span>课程管理</span>
                </template>
                <el-menu-item index="/dashboard/course/list">课程列表</el-menu-item>
                <el-menu-item index="/dashboard/course/schedule">课程表</el-menu-item>
                <el-menu-item v-if="userStore.isTeacher" index="/dashboard/course/create">创建课程</el-menu-item>
              </el-sub-menu>
              
              <!-- 资源管理 -->
              <el-sub-menu index="/dashboard/resource">
                <template #title>
                  <el-icon><FolderOpened /></el-icon>
                  <span>资源管理</span>
                </template>
                <el-menu-item index="/dashboard/resource/list">资源列表</el-menu-item>
                <el-menu-item v-if="userStore.isTeacher" index="/dashboard/resource/upload">上传资源</el-menu-item>
              </el-sub-menu>
              
              <!-- 考试管理 -->
              <el-sub-menu index="/dashboard/exam">
                <template #title>
                  <el-icon><Document /></el-icon>
                  <span>考试管理</span>
                </template>
                <el-menu-item index="/dashboard/exam/list">试卷列表</el-menu-item>
                <el-menu-item v-if="userStore.isTeacher" index="/dashboard/exam/upload">上传试卷</el-menu-item>
                <el-menu-item v-if="userStore.isTeacher || userStore.isAssistant" index="/dashboard/exam/update">修改试卷</el-menu-item>
              </el-sub-menu>
              
              <!-- 作业管理 -->
              <el-sub-menu index="/dashboard/homework">
                <template #title>
                  <el-icon><EditPen /></el-icon>
                  <span>作业管理</span>
                </template>
                <el-menu-item index="/dashboard/homework/list">作业列表</el-menu-item>
                <el-menu-item v-if="userStore.isTeacher || userStore.isAssistant" index="/dashboard/homework/review">作业批改</el-menu-item>
                <el-menu-item index="/dashboard/homework/statistics">作业统计</el-menu-item>
              </el-sub-menu>
              
              <!-- 直播管理 -->
              <el-sub-menu index="/dashboard/live">
                <template #title>
                  <el-icon><VideoPlay /></el-icon>
                  <span>直播管理</span>
                </template>
                <el-menu-item index="/dashboard/live/list">直播列表</el-menu-item>
                <el-menu-item v-if="userStore.isTeacher" index="/dashboard/live/test">创建直播</el-menu-item>
              </el-sub-menu>
              
              <!-- 学情分析 - 仅教师可见 -->
              <el-sub-menu v-if="userStore.isTeacher" index="/dashboard/analysis">
                <template #title>
                  <el-icon><Star /></el-icon>
                  <span>学情分析</span>
                </template>
                <el-menu-item index="/dashboard/analysis/list">分析列表</el-menu-item>
                <el-menu-item index="/dashboard/analysis/detail">分析详情</el-menu-item>
              </el-sub-menu>
              
              <!-- 日志管理 -->
              <el-menu-item index="/dashboard/log">
                <el-icon><Document /></el-icon>
                <template #title>日志管理</template>
              </el-menu-item>
              
              <!-- 成绩管理 -->
              <el-sub-menu index="/dashboard/grade">
                <template #title>
                  <el-icon><TrendCharts /></el-icon>
                  <span>成绩管理</span>
                </template>
                <el-menu-item index="/dashboard/grade/list">成绩列表</el-menu-item>
                <el-menu-item index="/dashboard/grade/statistics">成绩统计</el-menu-item>
              </el-sub-menu>
              
              <!-- 信息中心 -->
              <el-sub-menu index="/dashboard/info">
                <template #title>
                  <el-icon><Message /></el-icon>
                  <span>信息中心</span>
                </template>
                <el-menu-item index="/dashboard/info/message-center">消息中心</el-menu-item>
              </el-sub-menu>
              
              <!-- 管理员专用菜单 -->
              <el-sub-menu v-if="userStore.isAdmin" index="/dashboard/admin">
                <template #title>
                  <el-icon><Setting /></el-icon>
                  <span>系统管理</span>
                </template>
                <el-menu-item index="/dashboard/admin/users">用户管理</el-menu-item>
                <el-menu-item index="/dashboard/admin/settings">系统设置</el-menu-item>
                <el-menu-item index="/dashboard/admin/course-audit">课程审核</el-menu-item>
                <el-menu-item index="/dashboard/admin/monitor">系统监控</el-menu-item>
              </el-sub-menu>
            </el-menu>
          </el-scrollbar>
        </el-aside>
  
        <!-- 主内容区 -->
        <el-main class="layout-content">
          <!-- 面包屑导航 -->
          <el-breadcrumb class="breadcrumb" separator="/">
            <el-breadcrumb-item :to="{ path: '/dashboard/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item
              v-for="item in breadcrumbs"
              :key="item.path"
              :to="item.path"
            >
              {{ item.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
          
          <!-- 页面内容 -->
          <div class="page-content">
            <router-view />
          </div>
        </el-main>
      </el-container>
    </div>
  </template>
  
  <script>
  import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { userLogHelper } from '@/utils/logHelper'
import MessageNotification from './MessageNotification.vue'
  
  export default {
    name: 'Layout',
    components: {
      MessageNotification
    },
    setup() {
      const route = useRoute()
      const router = useRouter()
      const appStore = useAppStore()
      const userStore = useUserStore()
  
      // 面包屑导航
      const breadcrumbs = computed(() => {
        const matched = route.matched.filter(item => item.meta && item.meta.title)
        return matched.map(item => ({
          path: item.path,
          title: item.meta.title
        }))
      })
  
      // 切换侧边栏
      const toggleSidebar = () => {
        appStore.toggleSidebar()
      }
  
      // 处理用户菜单命令
      const handleUserCommand = (command) => {
        switch (command) {
          case 'profile':
            router.push('/dashboard/profile')
            break
          case 'settings':
            router.push('/dashboard/admin/settings')
            break
          case 'logout':
            handleLogout()
            break
        }
      }
  
      // 退出登录
      const handleLogout = () => {
        ElMessageBox.confirm('确定要退出登录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          // 记录退出登录日志
          try {
            await userLogHelper.logout(userStore.userName)
          } catch (error) {
            console.error('记录退出登录日志失败:', error)
          }
          
          userStore.logout()
          router.push('/publicPortal')
        })
      }
  
      // 监听路由变化更新面包屑
      watch(route, () => {
        appStore.setBreadcrumbs(breadcrumbs.value)
      }, { immediate: true })
  
      return {
        appStore,
        userStore,
        breadcrumbs,
        toggleSidebar,
        handleUserCommand
      }
    }
  }
  </script>
  
  <style scoped>
  .layout-container {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: #f5f7fa;
  }
  
  .layout-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-bottom: none;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    position: relative;
    z-index: 1000;
  }
  
  .header-content {
    height: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
  }
  
  .header-left {
    display: flex;
    align-items: center;
  }
  
  .sidebar-toggle {
    margin-right: 20px;
    font-size: 18px;
    color: #fff;
    background: rgba(255,255,255,0.1);
    border: none;
    border-radius: 4px;
    padding: 8px;
    transition: all 0.3s;
  }
  
  .sidebar-toggle:hover {
    background: rgba(255,255,255,0.2);
    transform: scale(1.05);
  }
  
  .system-title {
    font-size: 20px;
    font-weight: 600;
    color: #fff;
    margin: 0;
    text-shadow: 0 1px 2px rgba(0,0,0,0.1);
  }
  
  .header-right {
    display: flex;
    align-items: center;
    gap: 20px;
  }
  
  .header-item {
    cursor: pointer;
  }
  
  .header-item .el-button {
    color: #fff;
    background: rgba(255,255,255,0.1);
    border: none;
    border-radius: 4px;
    transition: all 0.3s;
  }
  
  .header-item .el-button:hover {
    background: rgba(255,255,255,0.2);
    transform: scale(1.05);
  }
  
  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 6px;
    background: rgba(255,255,255,0.1);
    transition: all 0.3s;
    cursor: pointer;
  }
  
  .user-info:hover {
    background: rgba(255,255,255,0.2);
    transform: scale(1.02);
  }
  
  .user-name {
    font-size: 14px;
    color: #fff;
    font-weight: 500;
  }
  
  .layout-main {
    flex: 1;
    overflow: hidden;
  }
  
  .layout-sidebar {
    background: #fff;
    border-right: 1px solid #e4e7ed;
    transition: width 0.3s;
    box-shadow: 2px 0 8px rgba(0,0,0,0.1);
  }
  
  .sidebar-menu {
    border-right: none;
    height: 100%;
    background: #fff;
  }
  
  .sidebar-menu .el-menu-item {
    height: 50px;
    line-height: 50px;
    margin: 4px 8px;
    border-radius: 6px;
    transition: all 0.3s;
  }
  
  .sidebar-menu .el-menu-item:hover {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    transform: translateX(4px);
  }
  
  .sidebar-menu .el-menu-item.is-active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  }
  
  .sidebar-menu .el-sub-menu__title {
    height: 50px;
    line-height: 50px;
    margin: 4px 8px;
    border-radius: 6px;
    transition: all 0.3s;
  }
  
  .sidebar-menu .el-sub-menu__title:hover {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
  }
  
  .sidebar-menu .el-sub-menu.is-active .el-sub-menu__title {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
  }
  
  .layout-content {
    background: #f5f7fa;
    padding: 0;
    overflow-y: auto;
  }
  
  .breadcrumb {
    padding: 16px 20px;
    background: #fff;
    border-bottom: 1px solid #e4e7ed;
    box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  }
  
  .breadcrumb .el-breadcrumb__item {
    font-size: 14px;
  }
  
  .breadcrumb .el-breadcrumb__inner {
    color: #606266;
    transition: color 0.3s;
  }
  
  .breadcrumb .el-breadcrumb__inner:hover {
    color: #667eea;
  }
  
  .page-content {
    padding: 20px;
    min-height: calc(100vh - 120px);
  }
  
  /* 响应式设计 */
  @media (max-width: 768px) {
    .system-title {
      display: none;
    }
    
    .header-content {
      padding: 0 10px;
    }
    
    .page-content {
      padding: 10px;
    }
    
    .sidebar-menu .el-menu-item,
    .sidebar-menu .el-sub-menu__title {
      margin: 2px 4px;
    }
  }
  
  /* 滚动条样式 */
  .el-scrollbar__bar {
    background: rgba(0,0,0,0.1);
  }
  
  .el-scrollbar__thumb {
    background: rgba(0,0,0,0.2);
    border-radius: 4px;
  }
  
  .el-scrollbar__thumb:hover {
    background: rgba(0,0,0,0.3);
  }
  </style>