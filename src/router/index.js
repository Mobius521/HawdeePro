import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/components/Layout.vue'
import Login from '@/views/Login.vue'
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

const routes = [
  {
    path: '/login',
    component: Login,
    meta: { title: '登录' }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/login',
    children: [
      {
        path: 'dashboard',
        component: Dashboard,
        meta: { title: '工作台', icon: 'House' }
      },
      // 网站门户
      {
        path: 'portal',
        component: PortalIndex,
        meta: { title: '网站门户', icon: 'Monitor' }
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
            meta: { title: '创建课程' }
          },
          {
            path: 'edit/:id',
            component: CourseEdit,
            meta: { title: '编辑课程' }
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
            meta: { title: '上传资源' }
          }
        ]
      },
      
      // 实训管理
      {
        path: 'training',
        name: 'Training',
        redirect: '/training/list',
        meta: { title: '实训管理', icon: 'Tools' },
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
        meta: { title: '问卷调查', icon: 'List' },
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
        meta: { title: '教学评价', icon: 'Star' },
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
    document.title = `${to.meta.title} - 教师中心`
  }
  
  // 简单的登录验证（实际项目中应该检查token等）
  if (to.path !== '/login' && !localStorage.getItem('userToken')) {
    next('/login')
  } else {
    next()
  }
})

export default router