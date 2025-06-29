<template>
    <div class="course-edit">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-content">
          <h2 class="page-title">编辑课程</h2>
          <p class="page-description">修改课程信息和设置</p>
        </div>
      </div>
  
      <!-- 编辑表单 -->
      <div class="form-container card">
        <el-skeleton :loading="loading" :rows="5" animated v-if="loading">
          <template #template>
            <div style="padding: 20px;">
              <el-skeleton-item variant="h3" style="width: 30%; margin-bottom: 20px;" />
              <el-skeleton-item variant="text" style="width: 100%; margin-bottom: 10px;" />
              <el-skeleton-item variant="text" style="width: 80%; margin-bottom: 10px;" />
              <el-skeleton-item variant="text" style="width: 60%; margin-bottom: 10px;" />
            </div>
          </template>
        </el-skeleton>
        
        <el-form
          v-else
          ref="courseFormRef"
          :model="courseForm"
          :rules="courseRules"
          label-width="120px"
          size="large"
        >
          <!-- 基本信息 -->
          <div class="form-section">
            <h3 class="section-title">基本信息</h3>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="课程名称" prop="name">
                  <el-input
                    v-model="courseForm.name"
                    placeholder="请输入课程名称"
                    clearable
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="课程代码" prop="code">
                  <el-input
                    v-model="courseForm.code"
                    placeholder="请输入课程代码"
                    clearable
                  />
                </el-form-item>
              </el-col>
            </el-row>
  
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="上课时间">
                  <el-input
                    v-model="courseForm.time"
                    placeholder="如：周一第1-2节"
                    clearable
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="教室">
                  <el-input
                    v-model="courseForm.classroom"
                    placeholder="如：教室A101"
                    clearable
                  />
                </el-form-item>
              </el-col>
            </el-row>
  
            <el-form-item label="课程描述" prop="description">
              <el-input
                v-model="courseForm.description"
                type="textarea"
                :rows="4"
                placeholder="请输入课程描述"
              />
            </el-form-item>
          </div>
  
          <!-- 表单操作 -->
          <div class="form-actions">
            <el-button size="large" @click="handleCancel">
              取消
            </el-button>
            <el-button
              type="primary"
              size="large"
              :loading="submitting"
              @click="handleSubmit"
            >
              {{ submitting ? '保存中...' : '保存修改' }}
            </el-button>
          </div>
        </el-form>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, reactive, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import { courseApi, courseUtils } from '@/api/course'
  import { useUserStore } from '@/stores/user'
  
  export default {
    name: 'CourseEdit',
    setup() {
      const route = useRoute()
      const router = useRouter()
      const userStore = useUserStore()
      const courseFormRef = ref()
      const submitting = ref(false)
      const loading = ref(false)
  
      const courseForm = reactive({
        name: '',
        code: '',
        description: '',
        teacherId: '',
        time: '',
        classroom: '',
        evaluation: ''
      })
  
      const courseRules = {
        name: [
          { required: true, message: '请输入课程名称', trigger: 'blur' }
        ],
        code: [
          { required: true, message: '请输入课程代码', trigger: 'blur' }
        ],
        description: [
          { required: true, message: '请输入课程描述', trigger: 'blur' }
        ]
      }
  
      // 加载课程数据
      const loadCourseData = async (courseId) => {
        try {
          loading.value = true
          const response = await courseApi.getCourseById(courseId)
          
          if (response.code === 0) {
            const courseData = response.data
            // 将后端数据转换为前端格式
            Object.assign(courseForm, {
              name: courseData.subjectId,
              code: courseData.courseId,
              description: courseData.evaluation || '',
              teacherId: courseData.teacherId,
              time: courseData.time,
              classroom: courseData.classroom,
              evaluation: courseData.evaluation
            })
          } else {
            ElMessage.error(response.message || '加载课程数据失败')
          }
        } catch (error) {
          console.error('加载课程数据失败:', error)
          ElMessage.error('加载课程数据失败，请稍后重试')
        } finally {
          loading.value = false
        }
      }
  
      const handleSubmit = async () => {
        if (!courseFormRef.value) return
  
        try {
          await courseFormRef.value.validate()
          submitting.value = true
  
          // 准备提交数据
          const submitData = {
            courseId: courseForm.code,
            teacherId: courseForm.teacherId || userStore.userInfo.id || 'T123',
            subjectId: courseForm.name,
            time: courseForm.time || '周一第1-2节',
            evaluation: courseForm.description || '良好',
            classroom: courseForm.classroom || '教室A101'
          }
  
          // 调用API
          const response = await courseApi.updateCourse(submitData)
  
          if (response.code === 0) {
            ElMessage.success('课程修改成功')
            router.push('/dashboard/course/list')
          } else {
            ElMessage.error(response.message || '修改失败')
          }
        } catch (error) {
          console.error('修改课程失败:', error)
          ElMessage.error('修改失败，请稍后重试')
        } finally {
          submitting.value = false
        }
      }
  
      const handleCancel = () => {
        router.back()
      }
  
      onMounted(async () => {
        // 初始化用户信息
        userStore.initUserInfo()
        
        // 加载课程数据
        const courseId = route.params.id
        if (courseId) {
          await loadCourseData(courseId)
        } else {
          ElMessage.error('课程ID不存在')
          router.push('/dashboard/course/list')
        }
      })
  
      return {
        courseFormRef,
        courseForm,
        courseRules,
        submitting,
        loading,
        handleSubmit,
        handleCancel
      }
    }
  }
  </script>
  
  <style scoped>
  .course-edit {
    padding: 0;
  }
  
  .page-header {
    margin-bottom: 20px;
    padding: 20px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
  }
  
  .header-content h2 {
    margin: 0 0 8px 0;
    font-size: 24px;
    color: #303133;
  }
  
  .header-content p {
    margin: 0;
    color: #606266;
    font-size: 14px;
  }
  
  .form-container {
    max-width: 800px;
    margin: 0 auto;
  }
  
  .form-section {
    margin-bottom: 40px;
    padding-bottom: 30px;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .section-title {
    margin: 0 0 20px 0;
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }
  
  .form-actions {
    display: flex;
    justify-content: center;
    gap: 16px;
    padding-top: 30px;
    border-top: 1px solid #f0f0f0;
    margin-top: 30px;
  }
  </style>