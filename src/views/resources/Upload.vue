<template>
    <div class="resource-upload">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-content">
          <h2 class="page-title">上传资源</h2>
          <p class="page-description">上传教学资源文件，支持文档、视频、音频等多种格式</p>
        </div>
      </div>
  
      <!-- 上传区域 -->
      <div class="upload-container card">
        <el-form
          ref="uploadFormRef"
          :model="uploadForm"
          :rules="uploadRules"
          label-width="120px"
          size="large"
        >
          <!-- 基本信息 -->
          <div class="form-section">
            <h3 class="section-title">基本信息</h3>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="资源名称" prop="name">
                  <el-input
                    v-model="uploadForm.name"
                    placeholder="请输入资源名称"
                    clearable
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="所属课程" prop="courseId">
                  <el-select
                    v-model="uploadForm.courseId"
                    placeholder="请选择课程"
                    style="width: 100%"
                  >
                    <el-option
                      v-for="course in courseList"
                      :key="course.id"
                      :label="course.name"
                      :value="course.id"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
  
            <el-form-item label="资源描述" prop="description">
              <el-input
                v-model="uploadForm.description"
                type="textarea"
                :rows="3"
                placeholder="请输入资源描述"
              />
            </el-form-item>
  
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="资源类型" prop="type">
                  <el-select
                    v-model="uploadForm.type"
                    placeholder="请选择类型"
                    style="width: 100%"
                  >
                    <el-option label="文档" value="document" />
                    <el-option label="视频" value="video" />
                    <el-option label="音频" value="audio" />
                    <el-option label="图片" value="image" />
                    <el-option label="其他" value="other" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="访问权限" prop="permission">
                  <el-select
                    v-model="uploadForm.permission"
                    placeholder="请选择权限"
                    style="width: 100%"
                  >
                    <el-option label="公开" value="public" />
                    <el-option label="课程内" value="course" />
                    <el-option label="私有" value="private" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
  
          <!-- 文件上传 -->
          <div class="form-section">
            <h3 class="section-title">文件上传</h3>
            
            <el-form-item label="选择文件" prop="files">
              <el-upload
                ref="uploadRef"
                class="upload-area"
                drag
                multiple
                :auto-upload="false"
                :on-change="handleFileChange"
                :on-remove="handleFileRemove"
                :before-upload="beforeUpload"
                :file-list="fileList"
              >
                <div class="upload-content">
                  <el-icon class="upload-icon"><UploadFilled /></el-icon>
                  <div class="upload-text">
                    <p>将文件拖到此处，或<em>点击上传</em></p>
                    <p class="upload-tip">
                      支持文档、视频、音频、图片等格式，单个文件不超过100MB
                    </p>
                  </div>
                </div>
              </el-upload>
            </el-form-item>
  
            <!-- 文件列表 -->
            <div v-if="fileList.length > 0" class="file-list">
              <h4>待上传文件</h4>
              <div
                v-for="(file, index) in fileList"
                :key="index"
                class="file-item"
              >
                <div class="file-info">
                  <div class="file-icon" :class="getFileTypeClass(file.name)">
                    <el-icon>
                      <component :is="getFileIcon(file.name)" />
                    </el-icon>
                  </div>
                  <div class="file-details">
                    <div class="file-name">{{ file.name }}</div>
                    <div class="file-size">{{ formatFileSize(file.size) }}</div>
                  </div>
                </div>
                
                <div class="file-progress" v-if="file.status === 'uploading'">
                  <el-progress
                    :percentage="file.percentage || 0"
                    :stroke-width="4"
                  />
                </div>
                
                <div class="file-status">
                  <el-tag
                    v-if="file.status === 'success'"
                    type="success"
                    size="small"
                  >
                    上传成功
                  </el-tag>
                  <el-tag
                    v-else-if="file.status === 'fail'"
                    type="danger"
                    size="small"
                  >
                    上传失败
                  </el-tag>
                  <el-tag
                    v-else-if="file.status === 'uploading'"
                    type="warning"
                    size="small"
                  >
                    上传中
                  </el-tag>
                  <el-tag
                    v-else
                    type="info"
                    size="small"
                  >
                    待上传
                  </el-tag>
                </div>
                
                <div class="file-actions">
                  <el-button
                    type="text"
                    size="small"
                    @click="removeFile(index)"
                    :disabled="file.status === 'uploading'"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>
          </div>
  
          <!-- 表单操作 -->
          <div class="form-actions">
            <el-button size="large" @click="handleCancel">
              取消
            </el-button>
            <el-button
              type="primary"
              size="large"
              :loading="uploading"
              :disabled="fileList.length === 0"
              @click="handleUpload"
            >
              {{ uploading ? '上传中...' : '开始上传' }}
            </el-button>
          </div>
        </el-form>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { formatFileSize } from '@/utils'
import { resourceApi, resourceUtils } from '@/api/resource'
import { courseApi } from '@/api/course'
import { useUserStore } from '@/stores/user'
  
  export default {
    name: 'ResourceUpload',
    setup() {
      const router = useRouter()
      const userStore = useUserStore()
      const uploadFormRef = ref()
      const uploadRef = ref()
      const uploading = ref(false)
  
      const uploadForm = reactive({
        name: '',
        courseId: '',
        description: '',
        type: '',
        permission: 'course'
      })
  
      const uploadRules = {
        name: [
          { required: true, message: '请输入资源名称', trigger: 'blur' }
        ],
        courseId: [
          { required: true, message: '请选择课程', trigger: 'change' }
        ],
        type: [
          { required: true, message: '请选择资源类型', trigger: 'change' }
        ],
        permission: [
          { required: true, message: '请选择访问权限', trigger: 'change' }
        ]
      }
  
      const courseList = ref([])
  
      const fileList = ref([])
  
      // 获取文件类型样式类
      const getFileTypeClass = (fileName) => {
        const ext = fileName.split('.').pop().toLowerCase()
        if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(ext)) {
          return 'file-type-image'
        } else if (['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(ext)) {
          return 'file-type-video'
        } else if (['mp3', 'wav', 'flac', 'aac'].includes(ext)) {
          return 'file-type-audio'
        } else if (['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(ext)) {
          return 'file-type-document'
        }
        return 'file-type-other'
      }
  
      // 获取文件图标
      const getFileIcon = (fileName) => {
        const ext = fileName.split('.').pop().toLowerCase()
        if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(ext)) {
          return 'Picture'
        } else if (['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(ext)) {
          return 'VideoPlay'
        } else if (['mp3', 'wav', 'flac', 'aac'].includes(ext)) {
          return 'Headphones'
        } else if (['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(ext)) {
          return 'Document'
        }
        return 'Files'
      }
  
      // 文件变化处理
      const handleFileChange = (file, files) => {
        fileList.value = files
      }
  
      // 文件移除处理
      const handleFileRemove = (file, files) => {
        fileList.value = files
      }
  
      // 上传前验证
      const beforeUpload = (file) => {
        const isLt100M = file.size / 1024 / 1024 < 100
  
        if (!isLt100M) {
          ElMessage.error('文件大小不能超过 100MB!')
          return false
        }
        return true
      }
  
      // 移除文件
      const removeFile = (index) => {
        fileList.value.splice(index, 1)
      }
  
            // 加载课程列表
      const loadCourseList = async () => {
        try {
          const response = await courseApi.getAllCourses()
          if (response.code === 0) {
            courseList.value = response.data.map(course => ({
              id: course.courseId,
              name: course.courseName
            }))
          }
        } catch (error) {
          console.error('加载课程列表失败:', error)
        }
      }

      // 开始上传
      const handleUpload = async () => {
        if (!uploadFormRef.value) return

        try {
          await uploadFormRef.value.validate()
          
          if (fileList.value.length === 0) {
            ElMessage.warning('请选择要上传的文件')
            return
          }

          uploading.value = true

          // 逐个上传文件
          for (let i = 0; i < fileList.value.length; i++) {
            const file = fileList.value[i]
            file.status = 'uploading'
            file.percentage = 0

            try {
              // 模拟文件上传到OSS的过程
              // 在实际项目中，这里应该调用OSS SDK上传文件
              await new Promise((resolve, reject) => {
                const progressInterval = setInterval(() => {
                  if (file.percentage < 90) {
                    file.percentage += Math.random() * 20
                  } else {
                    clearInterval(progressInterval)
                    // 模拟上传完成，生成OSS URL
                    const ossUrl = `https://oss.aliyun.com/resource/${Date.now()}_${file.name}`
                    
                    // 构建资源数据
                    const resourceData = {
                      teacherId: userStore.userInfo?.id || 'T123',
                      type: uploadForm.type,
                      name: file.name,
                      courseId: uploadForm.courseId,
                      description: uploadForm.description,
                      permission: uploadForm.permission,
                      size: file.size,
                      url: ossUrl,
                      uploadTime: new Date().toISOString()
                    }

                    // 转换数据格式并调用API记录资源信息
                    const backendData = resourceUtils.transformToBackendData(resourceData)
                    resourceApi.uploadResource(backendData).then(response => {
                      if (response.code === 0) {
                        file.percentage = 100
                        file.status = 'success'
                        resolve()
                      } else {
                        file.status = 'fail'
                        reject(new Error(response.message || '资源信息保存失败'))
                      }
                    }).catch(error => {
                      file.status = 'fail'
                      reject(error)
                    })
                  }
                }, 200)
              })

            } catch (error) {
              console.error(`文件 ${file.name} 上传失败:`, error)
              file.status = 'fail'
              ElMessage.error(`文件 ${file.name} 上传失败: ${error.message}`)
            }
          }

          // 检查是否所有文件都上传成功
          const successCount = fileList.value.filter(f => f.status === 'success').length
          if (successCount === fileList.value.length) {
            ElMessage.success('所有文件上传成功')
            router.push('/resource/list')
          } else {
            ElMessage.warning(`成功上传 ${successCount} 个文件，${fileList.value.length - successCount} 个失败`)
          }
        } catch (error) {
          console.error('上传过程出错:', error)
          ElMessage.error('上传失败，请稍后重试')
        } finally {
          uploading.value = false
        }
      }
  
            const handleCancel = () => {
        router.back()
      }

      // 组件挂载时加载课程列表
      loadCourseList()

      return {
        uploadFormRef,
        uploadRef,
        uploadForm,
        uploadRules,
        courseList,
        fileList,
        uploading,
        getFileTypeClass,
        getFileIcon,
        handleFileChange,
        handleFileRemove,
        beforeUpload,
        removeFile,
        handleUpload,
        handleCancel,
        loadCourseList,
        formatFileSize
      }
    }
  }
  </script>
  
  <style scoped>
  .resource-upload {
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
  
  .upload-container {
    max-width: 800px;
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
  
  .upload-area {
    width: 100%;
  }
  
  .upload-content {
    padding: 40px 20px;
    text-align: center;
  }
  
  .upload-icon {
    font-size: 48px;
    color: #c0c4cc;
    margin-bottom: 16px;
  }
  
  .upload-text p {
    margin: 8px 0;
    color: #606266;
    font-size: 14px;
  }
  
  .upload-text em {
    color: #409eff;
    font-style: normal;
  }
  
  .upload-tip {
    font-size: 12px;
    color: #909399;
  }
  
  .file-list {
    margin-top: 20px;
  }
  
  .file-list h4 {
    margin: 0 0 16px 0;
    font-size: 16px;
    color: #303133;
  }
  
  .file-item {
    display: flex;
    align-items: center;
    padding: 12px;
    background: #f8f9fa;
    border-radius: 6px;
    margin-bottom: 8px;
    border: 1px solid #e9ecef;
  }
  
  .file-info {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
  }
  
  .file-icon {
    font-size: 24px;
    margin-right: 12px;
    flex-shrink: 0;
  }
  
  .file-icon.file-type-document {
    color: #409eff;
  }
  
  .file-icon.file-type-video {
    color: #67c23a;
  }
  
  .file-icon.file-type-audio {
    color: #e6a23c;
  }
  
  .file-icon.file-type-image {
    color: #f56c6c;
  }
  
  .file-icon.file-type-other {
    color: #909399;
  }
  
  .file-details {
    flex: 1;
    min-width: 0;
  }
  
  .file-name {
    font-size: 14px;
    font-weight: 500;
    color: #303133;
    margin-bottom: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .file-size {
    font-size: 12px;
    color: #909399;
  }
  
  .file-progress {
    width: 120px;
    margin: 0 16px;
  }
  
  .file-status {
    margin: 0 16px;
  }
  
  .file-actions {
    flex-shrink: 0;
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
    .upload-container {
      margin: 0;
    }
  
    .file-item {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
    }
  
    .file-progress {
      width: 100%;
      margin: 0;
    }
  
    .file-status {
      margin: 0;
      text-align: center;
    }
  
    .form-actions {
      flex-direction: column;
    }
  
    .form-actions .el-button {
      width: 100%;
    }
  }
  </style>