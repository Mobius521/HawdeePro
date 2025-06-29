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
            <el-badge :value="3" class="header-item">
              <el-button type="text" size="large">
                <el-icon><Bell /></el-icon>
              </el-button>
            </el-badge>
            
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
              <el-menu-item index="/dashboard/home">
                <el-icon><House /></el-icon>
                <template #title>工作台</template>
              </el-menu-item>
              
              <el-menu-item index="/dashboard/portal">
                <el-icon><Monitor /></el-icon>
                <template #title>网站门户</template>
              </el-menu-item>
              
              <el-sub-menu index="/dashboard/course">
                <template #title>
                  <el-icon><Reading /></el-icon>
                  <span>课程管理</span>
                </template>
                <el-menu-item index="/dashboard/course/list">课程列表</el-menu-item>
                <el-menu-item index="/dashboard/course/create">创建课程</el-menu-item>
              </el-sub-menu>
              
              <el-sub-menu index="/dashboard/resource">
                <template #title>
                  <el-icon><FolderOpened /></el-icon>
                  <span>资源管理</span>
                </template>
                <el-menu-item index="/dashboard/resource/list">资源列表</el-menu-item>
                <el-menu-item index="/dashboard/resource/upload">上传资源</el-menu-item>
              </el-sub-menu>
              
              <el-sub-menu index="/dashboard/exam">
                <template #title>
                  <el-icon><Document /></el-icon>
                  <span>试题试卷</span>
                </template>
                <el-menu-item index="/exam/list">题库管理</el-menu-item>
                <el-menu-item index="/exam/upload">上传试卷</el-menu-item>
                <el-menu-item index="/exam/pigai">批改试卷</el-menu-item>
                <el-menu-item index="/exam/update">修改试卷</el-menu-item>
              </el-sub-menu>
              
              <el-sub-menu index="/dashboard/homework">
                <template #title>
                  <el-icon><EditPen /></el-icon>
                  <span>作业管理</span>
                </template>
                <el-menu-item index="/homework/list">作业列表</el-menu-item>
                <el-menu-item index="/homework/review">作业批改</el-menu-item>
              </el-sub-menu>
              <el-sub-menu index="/live">
                <template #title>
                  <el-icon><EditPen /></el-icon>
                  <span>直播管理</span>
                </template>
                <el-menu-item index="/live/list">直播1</el-menu-item>
                
                <el-menu-item index="/live/test">直播2</el-menu-item>

              </el-sub-menu>
              <el-sub-menu index="/assessment">
                <template #title>
                  <el-icon><Checked /></el-icon>
                  <span>测评管理</span>
                </template>
                <el-menu-item index="/dashboard/assessment/list">测评列表</el-menu-item>
                <el-menu-item index="/dashboard/assessment/create">创建测评</el-menu-item>
              </el-sub-menu>
              
              <el-sub-menu index="/dashboard/grade">
                <template #title>
                  <el-icon><TrendCharts /></el-icon>
                  <span>成绩管理</span>
                </template>
                <el-menu-item index="/dashboard/grade/list">成绩列表</el-menu-item>
                <el-menu-item index="/dashboard/grade/statistics">成绩统计</el-menu-item>
              </el-sub-menu>
              
              <el-sub-menu index="/dashboard/training">
                <template #title>
                  <el-icon><Tools /></el-icon>
                  <span>实训管理</span>
                </template>
                <el-menu-item index="/dashboard/training/list">实训项目</el-menu-item>
                <el-menu-item index="/dashboard/training/create">创建实训</el-menu-item>
              </el-sub-menu>
              
              <el-sub-menu index="/dashboard/survey">
                <template #title>
                  <el-icon><List /></el-icon>
                  <span>问卷调查</span>
                </template>
                <el-menu-item index="/dashboard/survey/list">问卷列表</el-menu-item>
                <el-menu-item index="/dashboard/survey/create">创建问卷</el-menu-item>
                <el-menu-item index="/dashboard/survey/result">调查结果</el-menu-item>
              </el-sub-menu>
              
              <el-sub-menu index="/dashboard/evaluation">
                <template #title>
                  <el-icon><Star /></el-icon>
                  <span>教学评价</span>
                </template>
                <el-menu-item index="/dashboard/evaluation/list">评价列表</el-menu-item>
                <el-menu-item index="/dashboard/evaluation/analysis">评价分析</el-menu-item>
              </el-sub-menu>
              
              <el-sub-menu index="/dashboard/support">
                <template #title>
                  <el-icon><QuestionFilled /></el-icon>
                  <span>问题中心</span>
                </template>
                <el-menu-item index="/dashboard/support/list">问题列表</el-menu-item>
                <el-menu-item index="/dashboard/support/faq">常见问题</el-menu-item>
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
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
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
  
  export default {
    name: 'Layout',
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
            router.push('/profile')
            break
          case 'settings':
            router.push('/settings')
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
        }).then(() => {
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
  }
  
  .layout-header {
    background: #fff;
    border-bottom: 1px solid #e4e7ed;
    box-shadow: 0 1px 4px rgba(0,21,41,.08);
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
  }
  
  .system-title {
    font-size: 18px;
    font-weight: 500;
    color: #303133;
    margin: 0;
  }
  
  .header-right {
    display: flex;
    align-items: center;
    gap: 20px;
  }
  
  .header-item {
    cursor: pointer;
  }
  
  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 5px 10px;
    border-radius: 4px;
    transition: background-color 0.3s;
  }
  
  .user-info:hover {
    background-color: #f5f7fa;
  }
  
  .user-name {
    font-size: 14px;
    color: #606266;
  }
  
  .layout-main {
    flex: 1;
    overflow: hidden;
  }
  
  .layout-sidebar {
    background: #fff;
    border-right: 1px solid #e4e7ed;
    transition: width 0.3s;
  }
  
  .sidebar-menu {
    border-right: none;
    height: 100%;
  }
  
  .layout-content {
    background: #f0f2f5;
    padding: 0;
    overflow-y: auto;
  }
  
  .breadcrumb {
    padding: 16px 20px;
    background: #fff;
    border-bottom: 1px solid #e4e7ed;
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
  }
  </style>