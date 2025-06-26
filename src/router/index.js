import { createRouter, createWebHistory } from 'vue-router'
import ExamView from '../views/Exam/ExamList.vue'
import Assignment from '../views/Assign/AssPublish.vue'
import Assupdate from '../views/Assign/Assupdate.vue'
import Asspigai from '../views/Assign/Asspigai.vue'
import evaluate from '../views/evaluate.vue'
import survey from '../views/survey/SurveyManage.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Assignment,
    },
   
  ],
})

export default router
