import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

import ExamView from '../views/Exam/ExamList.vue'
import Assignment from '../views/Assign/Asspublic.vue'
import Asspigai from '../views/Assign/Asspigai.vue'
import Assupdate from '../views/Assign/Assupdate.vue'
import evaluate from '../views/evaluate.vue'
import Layout from '@/components/Layout.vue'
import Login from '@/views/Login.vue'
import register from '@/views/Register.vue'
import Dashboard from '@/views/Dashboard.vue'
import Profile from '@/views/Profile.vue'
import CourseList from '@/views/course/List.vue'
import CourseCreate from '@/views/course/createCourse.vue'
import CourseEdit from '@/views/course/editCourse.vue'
import CourseSchedule from '@/views/course/Schedule.vue'
import ResourceList from '@/views/resources/List.vue'  
import ResourceUpload from '@/views/resources/Upload.vue'
import EvaluationList from '@/views/evaluation/List.vue'
import EvaluationAnalysis from '@/views/evaluation/Analysis.vue'
import PortalIndex from '@/views/portal/AdminPortal.vue'  
import publicPortal from '@/views/portal/publicPortal.vue'
import UserManagement from '@/views/admin/UserManagement.vue'
import SystemSettings from '@/views/admin/SystemSettings.vue'
import CourseAudit from '@/views/admin/CourseAudit.vue'
import SystemMonitor from '@/views/admin/SystemMonitor.vue'
import ExamUpload from '@/views/Exam/ExamUpload.vue'
import ExamEditDialog from '@/views/Exam/ExamEditDialog.vue'
import ExamList from '../views/Exam/ExamList.vue'
import AssignmentList from '@/views/Assign/AssignmentList.vue'
import LiveList from '@/views/live/LiveCourseList.vue'
import livecreate from '@/views/live/CreateLiveDialog.vue'
import LiveRoom from '@/views/live/EditLiveDialog.vue'
import LogManagement from '@/views/Log/log.vue'
import AssignmentStatistics from '@/views/Assign/AssignmentStatistics.vue'
import MessageCenter from '@/views/info/MessageCenter.vue'
import MessageDetail from '@/views/info/MessageDetail.vue'

const routes = [
  {
    path: '/',
    redirect: '/publicPortal'
  },
  {
    path: '/publicPortal',
    component: publicPortal,
    meta: { title: '在线教学支持服务平台', icon: 'Monitor' }
  },
  {
    path: '/login',
    component: Login,
    meta: { title: '登录' }
  },
  {
    path: '/register',
    component: register,
    meta: { title: '注册' }
  },
  {
    path: '/dashboard',
    component: Layout,
    redirect: '/dashboard/home',
    children: [
      {
        path: 'home',
        component: Dashboard,
        meta: { title: '工作台', icon: 'House' }
      },
      // 个人中心
      {
        path: 'profile',
        component: Profile,
        meta: { title: '个人中心', icon: 'User' }
      },
      // 网站门户
      {
        path: 'portal',
        component: PortalIndex,
        meta: { title: '网站门户', icon: 'Monitor', roles: ['admin'] }
      },
      // 课程管理
      {
        path: 'course',
        name: 'Course',
        redirect: 'list',
        meta: { title: '课程管理', icon: 'Reading' },
        children: [
          {
            path: 'list',
            component: CourseList,
            meta: { title: '课程列表' }
          },
          {
            path: 'create',
            component: CourseCreate,
            meta: { title: '创建课程', roles: ['teacher'] }
          },
          {
            path: 'edit/:id',
            component: CourseEdit,
            meta: { title: '编辑课程', roles: ['teacher'] }
          },
          {
            path: 'schedule',
            component: CourseSchedule,
            meta: { title: '课程表' }
          }
        ]
      },
      // 课程资源管理
      {
        path: 'resource',
        name: 'Resource',
        redirect: 'list',
        meta: { title: '资源管理', icon: 'FolderOpened' },
        children: [
          {
            path: 'list',
            component: ResourceList,
            meta: { title: '资源列表' }
          },
          {
            path: 'upload',
            component: ResourceUpload,
            meta: { title: '上传资源', roles: ['teacher'] }
          }
        ]
      },
      

      // 学情分析
      {
        path: 'analysis',
        name: 'Analysis',
        redirect: 'list',
        meta: { title: '学情分析', icon: 'Star', roles: ['teacher'] },
        children: [
          {
            path: 'list',
            component: EvaluationList,
            meta: { title: '分析列表' }
          },
          {
            path: 'detail',
            component: EvaluationAnalysis,
            meta: { title: '分析详情' }
          }
        ]
      },

      // 管理员功能
      {
        path: 'admin',
        name: 'Admin',
        redirect: 'users',
        meta: { title: '系统管理', icon: 'Setting', roles: ['admin'] },
        children: [
          {
            path: 'users',
            component: UserManagement,
            meta: { title: '用户管理' }
          },
          {
            path: 'settings',
            component: SystemSettings,
            meta: { title: '系统设置' }
          },
          {
            path: 'course-audit',
            component: CourseAudit,
            meta: { title: '课程审核' }
          },
          {
            path: 'monitor',
            component: SystemMonitor,
            meta: { title: '系统监控' }
          }
        ]
      },

      // 日志管理
      {
        path: 'log',
        name: 'Log',
        component: LogManagement,
        meta: { title: '日志管理', icon: 'Document' }
      },

      {
        path: 'exam',
        name: 'Exam',
        redirect: 'list',
        meta: { title: '试卷管理', icon: 'EditPen' },
        children: [
          {
            path: 'list',
            component: ExamList,
            meta: { title: '试卷管理' }
          },
          {
            path: 'upload',
            component: ExamUpload,
            meta: { title: '上传试卷' }
          },
          {
            path: 'update',
            component: ExamEditDialog,
            meta: { title: '修改试卷' }
          }
        ]
      } ,
      
      {
        path: 'homework',
        name: 'Homework',
        redirect: 'list',
        meta: { title: '作业管理', icon: 'EditPen' },
        children: [
          {
            path: 'list',
            component: AssignmentList,
            meta: { title: '作业管理' }
          },
          {
            path: 'review',
            component: Asspigai,
            meta: { title: '批改作业' }
          },
          {
            path: 'statistics',
            component: AssignmentStatistics,
            meta: { title: '作业统计' }
          }
        ]
      },

      {
        path: 'live',
        name: 'live',
        redirect: 'list',
        meta: { title: '直播管理', icon: 'VideoPlay' },
        children: [
          {
            path: 'list',
            component: LiveList,
            meta: { title: '直播列表' }
          },
          {
            path: 'room/:id',
            name: 'LiveRoom',
            component: livecreate,
            props:true,
            meta: { title: '直播房间' }
          },{
            path: 'test',
            name: 'Live',
            component: livecreate,
            props: true,
            meta: { title: '直播测试' }
            
          }
        ]
      },

      // 信息中心
      {
        path: 'info',
        name: 'Info',
        redirect: 'message-center',
        meta: { title: '信息中心', icon: 'Message' },
        children: [
          {
            path: 'message-center',
            name: 'MessageCenter',
            component: MessageCenter,
            meta: { title: '消息中心' }
          },
          {
            path: 'message-detail/:id',
            name: 'MessageDetail',
            component: MessageDetail,
            meta: { title: '消息详情' }
          }
        ]
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 在线教学平台`
  }

  // 允许访问的公共页面
  const publicPages = ['/publicPortal', '/login', '/register']
  
  // 检查是否需要登录
  if (publicPages.includes(to.path)) {
    // 公共页面，直接允许访问
    next()
    return
  }

  const userStore = useUserStore()
  
  // 检查是否已登录
  if (!userStore.isLoggedIn) {
    // 未登录，跳转到登录页
    next('/login')
    return
  }

  // 检查角色权限
  if (to.meta.roles && to.meta.roles.length > 0) {
    const userRole = userStore.userRole
    if (!to.meta.roles.includes(userRole)) {
      // 权限不足，跳转到首页
      ElMessage.error('您没有访问该页面的权限')
      next('/dashboard/home')
      return
    }
  }

  next()
})

export default router