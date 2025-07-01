<template>
    <div class="course-create">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-content">
          <h2 class="page-title">创建课程</h2>
          <p class="page-description">填写课程基本信息，创建新的教学课程</p>
        </div>
      </div>
  
      <!-- 创建表单 -->
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
                <el-form-item label="上课时间" prop="time">
                  <el-input
                    v-model="courseForm.time"
                    placeholder="如：周一第1-2节"
                    clearable
                  />
                </el-form-item>
              </el-col>
            </el-row>
  
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="教室" prop="classroom">
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
              {{ submitting ? '创建中...' : '创建课程' }}
            </el-button>
          </div>
        </el-form>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { courseApi, courseUtils } from '@/api/course'
import { useUserStore } from '@/stores/user'
import { courseLogHelper } from '@/utils/logHelper'
  
  export default {
    name: 'CourseCreate',
    setup() {
      const router = useRouter()
      const userStore = useUserStore()
  
      const courseFormRef = ref()
      const submitting = ref(false)
  
      // 课程表单数据
      const courseForm = reactive({
        name: '',
        time: '',
        classroom: '',
        description: ''
      })
  
      // 表单验证规则
      const courseRules = {
        name: [
          { required: true, message: '请输入课程名称', trigger: 'blur' },
          { min: 2, max: 50, message: '课程名称长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        time: [
          { required: true, message: '请输入上课时间', trigger: 'blur' }
        ],
        classroom: [
          { required: true, message: '请输入教室', trigger: 'blur' }
        ],
        description: [
          { required: true, message: '请输入课程描述', trigger: 'blur' },
          { min: 5, max: 200, message: '课程描述长度在 5 到 200 个字符', trigger: 'blur' }
        ]
      }
  
      // 提交表单
      const handleSubmit = async () => {
        if (!courseFormRef.value) return
  
        try {
          await courseFormRef.value.validate()
          submitting.value = true
  
          // 准备提交数据 - 严格按照后端接口文档格式
          const submitData = {
            courseName: courseForm.name,
            teacherId: userStore.userInfo.id || 'T123',
            time: courseForm.time,
            evaluation: courseForm.description,
            classroom: courseForm.classroom
          }
  
          // 调用API
          const response = await courseApi.addCourse(submitData)
  
          if (response.code === 0) {
            // 记录创建课程的日志
            await courseLogHelper.createCourse(courseForm.name)
            
            ElMessage.success('课程创建成功')
            router.push('/dashboard/course/list')
          } else {
            ElMessage.error(response.message || '创建失败')
          }
        } catch (error) {
          console.error('创建课程失败:', error)
          ElMessage.error('创建失败，请稍后重试')
        } finally {
          submitting.value = false
        }
      }
  
      // 取消操作
      const handleCancel = () => {
        ElMessageBox.confirm(
          '确定要取消创建课程吗？已填写的信息将会丢失。',
          '取消确认',
          {
            confirmButtonText: '确定取消',
            cancelButtonText: '继续编辑',
            type: 'warning'
          }
        ).then(() => {
          router.back()
        }).catch(() => {
          // 用户选择继续编辑
        })
      }
  
      onMounted(() => {
        // 初始化用户信息
        userStore.initUserInfo()
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
  .course-create {
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
    max-width: 1000px;
    margin: 0 auto;
  }
  
  .form-section {
    margin-bottom: 40px;
    padding-bottom: 30px;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .form-section:last-of-type {
    border-bottom: none;
  }
  
  .section-title {
    margin: 0 0 20px 0;
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    position: relative;
    padding-left: 12px;
  }
  
  .section-title::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 18px;
    background: #409eff;
    border-radius: 2px;
  }
  
  .cover-uploader {
    display: block;
  }
  
  .cover-image {
    width: 200px;
    height: 120px;
    object-fit: cover;
    border-radius: 6px;
    border: 1px solid #dcdfe6;
  }
  
  .cover-placeholder {
    width: 200px;
    height: 120px;
    border: 2px dashed #dcdfe6;
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: border-color 0.3s;
  }
  
  .cover-placeholder:hover {
    border-color: #409eff;
  }
  
  .cover-icon {
    font-size: 28px;
    color: #8c939d;
    margin-bottom: 8px;
  }
  
  .cover-text {
    font-size: 14px;
    color: #8c939d;
  }
  
  .upload-tip {
    margin-top: 8px;
    font-size: 12px;
    color: #909399;
    line-height: 1.4;
  }
  
  .chapter-list {
    margin-bottom: 16px;
  }
  
  .chapter-item {
    margin-bottom: 16px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 6px;
    border: 1px solid #e9ecef;
  }
  
  .chapter-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  }
  
  .chapter-title-input {
    flex: 1;
  }
  
  .chapter-description {
    width: 100%;
  }
  
  .add-chapter-btn {
    width: 100%;
    height: 60px;
    border: 2px dashed #dcdfe6;
    background: #fafafa;
    color: #606266;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.3s;
  }
  
  .add-chapter-btn:hover {
    border-color: #409eff;
    color: #409eff;
    background: #f0f9ff;
  }
  
  .form-actions {
    display: flex;
    justify-content: center;
    gap: 16px;
    padding-top: 30px;
    border-top: 1px solid #f0f0f0;
    margin-top: 30px;
  }
  
  /* 响应式设计 */
  @media (max-width: 768px) {
    .form-container {
      margin: 0;
    }
  
    .chapter-header {
      flex-direction: column;
      align-items: stretch;
    }
  
    .form-actions {
      flex-direction: column;
    }
  
    .form-actions .el-button {
      width: 100%;
    }
  }
  </style>