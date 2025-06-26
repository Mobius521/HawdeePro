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
              <el-col :span="8">
                <el-form-item label="学分" prop="credits">
                  <el-input-number
                    v-model="courseForm.credits"
                    :min="1"
                    :max="10"
                    placeholder="学分"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="学时" prop="duration">
                  <el-input-number
                    v-model="courseForm.duration"
                    :min="1"
                    :max="200"
                    placeholder="学时"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="学期" prop="semester">
                  <el-select
                    v-model="courseForm.semester"
                    placeholder="请选择学期"
                    style="width: 100%"
                  >
                    <el-option label="2024春季" value="2024-spring" />
                    <el-option label="2024秋季" value="2024-autumn" />
                    <el-option label="2025春季" value="2025-spring" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
  
            <el-form-item label="课程描述" prop="description">
              <el-input
                v-model="courseForm.description"
                type="textarea"
                :rows="4"
                placeholder="请输入课程描述，包括课程目标、主要内容等"
              />
            </el-form-item>
          </div>
  
          <!-- 课程设置 -->
          <div class="form-section">
            <h3 class="section-title">课程设置</h3>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="课程类型" prop="type">
                  <el-select
                    v-model="courseForm.type"
                    placeholder="请选择课程类型"
                    style="width: 100%"
                  >
                    <el-option label="必修课" value="required" />
                    <el-option label="选修课" value="elective" />
                    <el-option label="实践课" value="practice" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="课程难度" prop="difficulty">
                  <el-select
                    v-model="courseForm.difficulty"
                    placeholder="请选择课程难度"
                    style="width: 100%"
                  >
                    <el-option label="初级" value="beginner" />
                    <el-option label="中级" value="intermediate" />
                    <el-option label="高级" value="advanced" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
  
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="开课时间" prop="startDate">
                  <el-date-picker
                    v-model="courseForm.startDate"
                    type="date"
                    placeholder="选择开课时间"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="结课时间" prop="endDate">
                  <el-date-picker
                    v-model="courseForm.endDate"
                    type="date"
                    placeholder="选择结课时间"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>
  
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="最大学生数" prop="maxStudents">
                  <el-input-number
                    v-model="courseForm.maxStudents"
                    :min="1"
                    :max="500"
                    placeholder="最大学生数"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="课程状态" prop="status">
                  <el-radio-group v-model="courseForm.status">
                    <el-radio label="draft">草稿</el-radio>
                    <el-radio label="published">发布</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
  
          <!-- 课程封面 -->
          <div class="form-section">
            <h3 class="section-title">课程封面</h3>
            
            <el-form-item label="封面图片">
              <el-upload
                class="cover-uploader"
                action="#"
                :show-file-list="false"
                :before-upload="beforeCoverUpload"
                :on-success="handleCoverSuccess"
              >
                <img v-if="courseForm.cover" :src="courseForm.cover" class="cover-image" />
                <div v-else class="cover-placeholder">
                  <el-icon class="cover-icon"><Plus /></el-icon>
                  <div class="cover-text">点击上传封面</div>
                </div>
              </el-upload>
              <div class="upload-tip">
                建议尺寸：800x450像素，支持 JPG、PNG 格式，文件大小不超过 2MB
              </div>
            </el-form-item>
          </div>
  
          <!-- 课程大纲 -->
          <div class="form-section">
            <h3 class="section-title">课程大纲</h3>
            
            <div class="chapter-list">
              <div
                v-for="(chapter, index) in courseForm.chapters"
                :key="index"
                class="chapter-item"
              >
                <div class="chapter-header">
                  <el-input
                    v-model="chapter.title"
                    placeholder="请输入章节标题"
                    class="chapter-title-input"
                  />
                  <el-button
                    type="danger"
                    size="small"
                    :icon="Delete"
                    circle
                    @click="removeChapter(index)"
                  />
                </div>
                <el-input
                  v-model="chapter.description"
                  type="textarea"
                  :rows="2"
                  placeholder="请输入章节描述"
                  class="chapter-description"
                />
              </div>
            </div>
            
            <el-button
              type="dashed"
              class="add-chapter-btn"
              @click="addChapter"
            >
              <el-icon><Plus /></el-icon>
              添加章节
            </el-button>
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
  import { ref, reactive } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Delete, Plus } from '@element-plus/icons-vue'
  
  export default {
    name: 'CourseCreate',
    components: {
      Delete,
      Plus
    },
    setup() {
      const router = useRouter()
      const courseFormRef = ref()
      const submitting = ref(false)
  
      // 课程表单数据
      const courseForm = reactive({
        name: '',
        code: '',
        credits: 3,
        duration: 48,
        semester: '',
        description: '',
        type: '',
        difficulty: '',
        startDate: '',
        endDate: '',
        maxStudents: 50,
        status: 'draft',
        cover: '',
        chapters: [
          { title: '', description: '' }
        ]
      })
  
      // 表单验证规则
      const courseRules = {
        name: [
          { required: true, message: '请输入课程名称', trigger: 'blur' },
          { min: 2, max: 50, message: '课程名称长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        code: [
          { required: true, message: '请输入课程代码', trigger: 'blur' },
          { pattern: /^[A-Z]{2,3}\d{3,4}$/, message: '课程代码格式不正确（如：CS101）', trigger: 'blur' }
        ],
        credits: [
          { required: true, message: '请输入学分', trigger: 'blur' }
        ],
        duration: [
          { required: true, message: '请输入学时', trigger: 'blur' }
        ],
        semester: [
          { required: true, message: '请选择学期', trigger: 'change' }
        ],
        description: [
          { required: true, message: '请输入课程描述', trigger: 'blur' },
          { min: 10, max: 500, message: '课程描述长度在 10 到 500 个字符', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请选择课程类型', trigger: 'change' }
        ],
        difficulty: [
          { required: true, message: '请选择课程难度', trigger: 'change' }
        ],
        startDate: [
          { required: true, message: '请选择开课时间', trigger: 'change' }
        ],
        endDate: [
          { required: true, message: '请选择结课时间', trigger: 'change' }
        ],
        maxStudents: [
          { required: true, message: '请输入最大学生数', trigger: 'blur' }
        ]
      }
  
      // 添加章节
      const addChapter = () => {
        courseForm.chapters.push({ title: '', description: '' })
      }
  
      // 删除章节
      const removeChapter = (index) => {
        if (courseForm.chapters.length > 1) {
          courseForm.chapters.splice(index, 1)
        } else {
          ElMessage.warning('至少保留一个章节')
        }
      }
  
      // 封面上传前验证
      const beforeCoverUpload = (file) => {
        const isJPGOrPNG = file.type === 'image/jpeg' || file.type === 'image/png'
        const isLt2M = file.size / 1024 / 1024 < 2
  
        if (!isJPGOrPNG) {
          ElMessage.error('封面图片只能是 JPG 或 PNG 格式!')
          return false
        }
        if (!isLt2M) {
          ElMessage.error('封面图片大小不能超过 2MB!')
          return false
        }
  
        // 模拟上传
        const reader = new FileReader()
        reader.onload = (e) => {
          courseForm.cover = e.target.result
        }
        reader.readAsDataURL(file)
        
        return false // 阻止自动上传
      }
  
      // 封面上传成功
      const handleCoverSuccess = (response) => {
        courseForm.cover = response.url
      }
  
      // 提交表单
      const handleSubmit = async () => {
        if (!courseFormRef.value) return
  
        try {
          await courseFormRef.value.validate()
          
          // 验证章节信息
          const validChapters = courseForm.chapters.filter(chapter => 
            chapter.title.trim() !== ''
          )
          
          if (validChapters.length === 0) {
            ElMessage.error('请至少添加一个有效章节')
            return
          }
  
          // 验证日期
          if (new Date(courseForm.endDate) <= new Date(courseForm.startDate)) {
            ElMessage.error('结课时间必须晚于开课时间')
            return
          }
  
          submitting.value = true
  
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 2000))
  
          ElMessage.success('课程创建成功')
          router.push('/course/list')
        } catch (error) {
          console.error('表单验证失败:', error)
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
  
      return {
        courseFormRef,
        courseForm,
        courseRules,
        submitting,
        addChapter,
        removeChapter,
        beforeCoverUpload,
        handleCoverSuccess,
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