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
        <el-form
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
  
  export default {
    name: 'CourseEdit',
    setup() {
      const route = useRoute()
      const router = useRouter()
      const courseFormRef = ref()
      const submitting = ref(false)
  
      const courseForm = reactive({
        name: '',
        code: '',
        description: ''
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
  
      const handleSubmit = async () => {
        if (!courseFormRef.value) return
  
        try {
          await courseFormRef.value.validate()
          submitting.value = true
  
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 1000))
  
          ElMessage.success('课程修改成功')
          router.push('/course/list')
        } catch (error) {
          console.error('表单验证失败:', error)
        } finally {
          submitting.value = false
        }
      }
  
      const handleCancel = () => {
        router.back()
      }
  
      onMounted(() => {
        // 模拟加载课程数据
        const courseId = route.params.id
        console.log('编辑课程ID:', courseId)
        
        // 模拟数据
        Object.assign(courseForm, {
          name: 'Web前端开发基础',
          code: 'CS101',
          description: '学习HTML、CSS、JavaScript等前端技术'
        })
      })
  
      return {
        courseFormRef,
        courseForm,
        courseRules,
        submitting,
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