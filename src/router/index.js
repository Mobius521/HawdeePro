import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

import ExamView from '../views/Exam/ExamList.vue'
import Assignment from '../views/Assign/AssPublish.vue'
import Asspigai from '../views/Assign/Asspigai.vue'
import Assupdate from '../views/Assign/Assupdate.vue'
import evaluate from '../views/evaluate.vue'
import survey from '../views/survey/SurveyManage.vue'
import Layout from '@/components/Layout.vue'
import Login from '@/views/Login.vue'
import register from '@/views/Register.vue'
import Dashboard from '@/views/Dashboard.vue'
import CourseList from '@/views/course/List.vue'
import CourseCreate from '@/views/course/createCourse.vue'
import CourseEdit from '@/views/course/editCourse.vue'
import ResourceList from '@/views/resources/List.vue'  
import ResourceUpload from '@/views/resources/Upload.vue'
import TrainingList from '@/views/training/List.vue'    
import TrainingCreate from '@/views/training/Create.vue'
import SurveyList from '@/views/survey/List.vue'
import SurveyCreate from '@/views/survey/Create.vue'
import SurveyResult from '@/views/survey/Result.vue'
import EvaluationList from '@/views/evaluation/List.vue'
import EvaluationAnalysis from '@/views/evaluation/Analysis.vue'
import PortalIndex from '@/views/portal/index.vue'  
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
        redirect: '/course/list',
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
          }
        ]
      },
      // 课程资源管理
      {
        path: 'resource',
        name: 'Resource',
        redirect: '/resource/list',
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
      
      // 实训管理
      {
        path: 'training',
        name: 'Training',
        redirect: '/training/list',
        meta: { title: '实训管理', icon: 'Tools', roles: ['teacher'] },
        children: [
          {
            path: 'list',
            component: TrainingList,
            meta: { title: '实训项目' }
          },
          {
            path: 'create',
            component: TrainingCreate,
            meta: { title: '创建实训' }
          }
        ]
      },
      // 问卷调查管理
      {
        path: 'survey',
        name: 'Survey',
        redirect: '/survey/list',
        meta: { title: '问卷调查', icon: 'List', roles: ['teacher'] },
        children: [
          {
            path: 'list',
            component: SurveyList,
            meta: { title: '问卷列表' }
          },
          {
            path: 'create',
            component: SurveyCreate,
            meta: { title: '创建问卷' }
          },
          {
            path: 'result',
            component: SurveyResult,
            meta: { title: '调查结果' }
          }
        ]
      },
      // 教学效果评价
      {
        path: 'evaluation',
        name: 'Evaluation',
        redirect: '/evaluation/list',
        meta: { title: '教学评价', icon: 'Star', roles: ['teacher'] },
        children: [
          {
            path: 'list',
            component: EvaluationList,
            meta: { title: '评价列表' }
          },
          {
            path: 'analysis',
            component: EvaluationAnalysis,
            meta: { title: '评价分析' }
          }
        ]
      },

      // 管理员功能
      {
        path: 'admin',
        name: 'Admin',
        redirect: '/dashboard/admin/users',
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

      {
        path: 'exam',
        name: 'Exam',
        redirect: '/exam/list',
        meta: { title: '', icon: 'Star' },
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
        redirect: '/homework/list',
        meta: { title: '', icon: 'Star' },
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
          }
        ]
      },

      {
        path: 'live',
        name: 'live',
        redirect: '/live',
        meta: { title: '', icon: 'Star' },
        children: [
          {
            path: 'list',
            component: LiveList,
            meta: { title: '作业管理' }
          },
          {
            path: 'room/:id',
            name: 'LiveRoom',
            component: livecreate,
            props:true,
            meta: { title: '批改作业' }
          },{
            path: 'test',
            name: 'Live',
            component: livecreate,
            props: true,
            meta: { title: '批改作业' }
            
          }
        ]
      }
      // 问题中心
      // {
      //   path: 'support',
      //   name: 'Support',
      //   redirect: '/support/list',
      //   meta: { title: '问题中心', icon: 'QuestionFilled' },
      //   children: [
      //     {
      //       path: 'list',
      //       name: 'SupportList',
      //       component: () => import('@/views/support/List.vue'),
      //       meta: { title: '问题列表' }
      //     },
      //     {
      //       path: 'faq',
      //       name: 'FAQ',
      //       component: () => import('@/views/support/FAQ.vue'),
      //       meta: { title: '常见问题' }
      //     }
      //   ]
      // }
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