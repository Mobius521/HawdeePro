<template>
    <div class="resource-list">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-content">
          <h2 class="page-title">资源管理</h2>
          <p class="page-description">管理教学资源，包括文档、视频、音频等多媒体文件</p>
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="$router.push('/resource/upload')">
            <el-icon><Upload /></el-icon>
            上传资源
          </el-button>
        </div>
      </div>
  
      <!-- 统计卡片 -->
      <el-row :gutter="20" class="stats-row">
        <el-col :xs="12" :sm="6" :md="6" :lg="6">
          <div class="stat-card primary">
            <div class="stat-icon">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.totalFiles }}</div>
              <div class="stat-label">总文件数</div>
            </div>
          </div>
        </el-col>
        
        <el-col :xs="12" :sm="6" :md="6" :lg="6">
          <div class="stat-card success">
            <div class="stat-icon">
              <el-icon><VideoPlay /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.videoCount }}</div>
              <div class="stat-label">视频文件</div>
            </div>
          </div>
        </el-col>
        
        <el-col :xs="12" :sm="6" :md="6" :lg="6">
          <div class="stat-card warning">
            <div class="stat-icon">
              <el-icon><Picture /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.imageCount }}</div>
              <div class="stat-label">图片文件</div>
            </div>
          </div>
        </el-col>
        
        <el-col :xs="12" :sm="6" :md="6" :lg="6">
          <div class="stat-card danger">
            <div class="stat-icon">
              <el-icon><FolderOpened /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ formatFileSize(stats.totalSize) }}</div>
              <div class="stat-label">总大小</div>
            </div>
          </div>
        </el-col>
      </el-row>
  
      <!-- 搜索和筛选 -->
      <div class="search-section card">
        <el-form :model="searchForm" inline>
          <el-form-item label="文件名">
            <el-input
              v-model="searchForm.name"
              placeholder="请输入文件名"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="文件类型">
            <el-select
              v-model="searchForm.type"
              placeholder="请选择类型"
              clearable
              style="width: 150px"
            >
              <el-option label="全部" value="" />
              <el-option label="文档" value="document" />
              <el-option label="视频" value="video" />
              <el-option label="音频" value="audio" />
              <el-option label="图片" value="image" />
              <el-option label="其他" value="other" />
            </el-select>
          </el-form-item>
          <el-form-item label="所属课程">
            <el-select
              v-model="searchForm.courseId"
              placeholder="请选择课程"
              clearable
              style="width: 200px"
            >
              <el-option
                v-for="course in courseList"
                :key="course.id"
                :label="course.name"
                :value="course.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="上传时间">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 240px"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="handleReset">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>
  
      <!-- 视图切换 -->
      <div class="view-controls card">
        <div class="view-toggle">
          <el-radio-group v-model="viewMode" @change="handleViewModeChange">
            <el-radio-button label="grid">
              <el-icon><Grid /></el-icon>
              网格视图
            </el-radio-button>
            <el-radio-button label="list">
              <el-icon><List /></el-icon>
              列表视图
            </el-radio-button>
          </el-radio-group>
        </div>
        
        <div class="batch-actions">
          <el-button
            type="primary"
            size="small"
            @click="batchDownload"
            :disabled="selectedResources.length === 0"
          >
            批量下载
          </el-button>
          <el-button
            type="danger"
            size="small"
            @click="batchDelete"
            :disabled="selectedResources.length === 0"
          >
            批量删除
          </el-button>
        </div>
      </div>
  
      <!-- 网格视图 -->
      <div v-if="viewMode === 'grid'" class="grid-view">
        <div class="resource-grid">
          <div
            v-for="resource in resourceList"
            :key="resource.id"
            class="resource-card"
            :class="{ selected: selectedResources.includes(resource.id) }"
            @click="toggleSelection(resource.id)"
          >
            <div class="resource-preview">
              <div class="file-icon" :class="getFileTypeClass(resource.type)">
                <el-icon>
                  <component :is="getFileIcon(resource.type)" />
                </el-icon>
              </div>
              <div class="resource-overlay">
                <el-button type="primary" size="small" @click.stop="previewResource(resource)">
                  预览
                </el-button>
                <el-button type="success" size="small" @click.stop="downloadResource(resource)">
                  下载
                </el-button>
              </div>
            </div>
            
            <div class="resource-info">
              <h4 class="resource-title" :title="resource.name">{{ resource.name }}</h4>
              <p class="resource-meta">
                <span class="file-size">{{ formatFileSize(resource.size) }}</span>
                <span class="upload-time">{{ formatDate(resource.uploadTime) }}</span>
              </p>
              <div class="resource-tags">
                <el-tag size="small" :type="getTypeColor(resource.type)">
                  {{ getTypeText(resource.type) }}
                </el-tag>
                <el-tag v-if="resource.courseName" size="small" type="info">
                  {{ resource.courseName }}
                </el-tag>
              </div>
            </div>
            
            <div class="resource-actions">
              <el-dropdown @command="handleResourceAction" @click.stop>
                <el-button type="text" size="small">
                  <el-icon><MoreFilled /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item :command="{action: 'edit', resource}">
                      <el-icon><Edit /></el-icon>编辑信息
                    </el-dropdown-item>
                    <el-dropdown-item :command="{action: 'move', resource}">
                      <el-icon><FolderAdd /></el-icon>移动到
                    </el-dropdown-item>
                    <el-dropdown-item :command="{action: 'copy', resource}">
                      <el-icon><CopyDocument /></el-icon>复制链接
                    </el-dropdown-item>
                    <el-dropdown-item :command="{action: 'share', resource}">
                      <el-icon><Connection /></el-icon>分享给其他教师
                    </el-dropdown-item>
                    <el-dropdown-item
                      :command="{action: 'delete', resource}"
                      divided
                    >
                      <el-icon><Delete /></el-icon>删除文件
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </div>
      </div>
  
      <!-- 列表视图 -->
      <div v-else class="list-view">
        <div class="table-container card">
          <el-table
            :data="resourceList"
            style="width: 100%"
            v-loading="loading"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" />
            
            <el-table-column label="文件" min-width="300">
              <template #default="{ row }">
                <div class="file-info">
                  <div class="file-icon-small" :class="getFileTypeClass(row.type)">
                    <el-icon>
                      <component :is="getFileIcon(row.type)" />
                    </el-icon>
                  </div>
                  <div class="file-details">
                    <div class="file-name">{{ row.name }}</div>
                    <div class="file-meta">
                      <span>{{ formatFileSize(row.size) }}</span>
                      <span>{{ formatDate(row.uploadTime) }}</span>
                    </div>
                  </div>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column prop="type" label="类型" width="100">
              <template #default="{ row }">
                <el-tag :type="getTypeColor(row.type)" size="small">
                  {{ getTypeText(row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            
            <el-table-column prop="courseName" label="所属课程" width="150" />
            
            <el-table-column prop="downloads" label="下载次数" width="100" />
            
            <el-table-column prop="uploader" label="上传者" width="100" />
            
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button
                  type="text"
                  size="small"
                  @click="previewResource(row)"
                >
                  预览
                </el-button>
                <el-button
                  type="text"
                  size="small"
                  @click="downloadResource(row)"
                >
                  下载
                </el-button>
                <el-button
                  type="text"
                  size="small"
                  @click="editResource(row)"
                >
                  编辑
                </el-button>
                <el-dropdown @command="handleResourceAction" @click.stop>
                  <el-button type="text" size="small">
                    更多<el-icon><ArrowDown /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item :command="{action: 'move', resource: row}">
                        <el-icon><FolderAdd /></el-icon>移动到
                      </el-dropdown-item>
                      <el-dropdown-item :command="{action: 'copy', resource: row}">
                        <el-icon><CopyDocument /></el-icon>复制链接
                      </el-dropdown-item>
                      <el-dropdown-item :command="{action: 'share', resource: row}">
                        <el-icon><Connection /></el-icon>分享给其他教师
                      </el-dropdown-item>
                      <el-dropdown-item
                        :command="{action: 'delete', resource: row}"
                        divided
                      >
                        <el-icon><Delete /></el-icon>删除文件
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
  
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[12, 24, 48, 96]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
  
      <!-- 文件预览对话框 -->
      <el-dialog
        v-model="previewVisible"
        :title="selectedResource?.name"
        width="80%"
        destroy-on-close
      >
        <div v-if="selectedResource" class="file-preview">
          <!-- 图片预览 -->
          <div v-if="selectedResource.type === 'image'" class="image-preview">
            <img :src="selectedResource.url" :alt="selectedResource.name" />
          </div>
          
          <!-- 视频预览 -->
          <div v-else-if="selectedResource.type === 'video'" class="video-preview">
            <video :src="selectedResource.url" controls style="width: 100%; max-height: 500px;">
              您的浏览器不支持视频播放
            </video>
          </div>
          
          <!-- 音频预览 -->
          <div v-else-if="selectedResource.type === 'audio'" class="audio-preview">
            <audio :src="selectedResource.url" controls style="width: 100%;">
              您的浏览器不支持音频播放
            </audio>
          </div>
          
          <!-- 文档预览 -->
          <div v-else class="document-preview">
            <div class="preview-placeholder">
              <el-icon size="64"><Document /></el-icon>
              <p>{{ selectedResource.name }}</p>
              <p>文件大小：{{ formatFileSize(selectedResource.size) }}</p>
              <el-button type="primary" @click="downloadResource(selectedResource)">
                下载文件
              </el-button>
            </div>
          </div>
        </div>
        
        <template #footer>
          <el-button @click="previewVisible = false">关闭</el-button>
          <el-button type="primary" @click="downloadResource(selectedResource)">
            下载
          </el-button>
        </template>
      </el-dialog>
    </div>
  </template>
  
  <script>
  import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatDate, formatFileSize } from '@/utils'
import { resourceApi, resourceUtils } from '@/api/resource'
import { courseApi } from '@/api/course'
import { useUserStore } from '@/stores/user'
  
  export default {
    name: 'ResourceList',
        setup() {
      const loading = ref(false)
      const viewMode = ref('grid')
      const userStore = useUserStore()

      // 统计数据
      const stats = reactive({
        totalFiles: 0,
        videoCount: 0,
        imageCount: 0,
        totalSize: 0
      })
  
      // 搜索表单
      const searchForm = reactive({
        name: '',
        type: '',
        courseId: '',
        dateRange: []
      })
  
      // 分页信息
      const pagination = reactive({
        currentPage: 1,
        pageSize: 12,
        total: 0
      })
  
            // 课程列表
      const courseList = ref([])

      // 资源列表
      const resourceList = ref([])
      
      // 选中的资源
      const selectedResources = ref([])
      const selectedResource = ref(null)
      const previewVisible = ref(false)
  
      // 所有资源数据（用于搜索和统计）
      const allResources = ref([])
  
      // 获取文件类型文本
      const getTypeText = (type) => {
        const typeMap = {
          document: '文档',
          video: '视频',
          audio: '音频',
          image: '图片',
          other: '其他'
        }
        return typeMap[type] || '未知'
      }
  
      // 获取文件类型颜色
      const getTypeColor = (type) => {
        const colorMap = {
          document: 'primary',
          video: 'success',
          audio: 'warning',
          image: 'danger',
          other: 'info'
        }
        return colorMap[type] || 'info'
      }
  
      // 获取文件类型样式类
      const getFileTypeClass = (type) => {
        return `file-type-${type}`
      }
  
      // 获取文件图标
      const getFileIcon = (type) => {
        const iconMap = {
          document: 'Document',
          video: 'VideoPlay',
          audio: 'Headphones',
          image: 'Picture',
          other: 'Files'
        }
        return iconMap[type] || 'Document'
      }
  
      // 切换选择
      const toggleSelection = (resourceId) => {
        const index = selectedResources.value.indexOf(resourceId)
        if (index > -1) {
          selectedResources.value.splice(index, 1)
        } else {
          selectedResources.value.push(resourceId)
        }
      }
  
      // 处理选择变化
      const handleSelectionChange = (selection) => {
        selectedResources.value = selection.map(item => item.id)
      }
  
      // 视图模式变化
      const handleViewModeChange = () => {
        // 重新设置分页大小
        if (viewMode.value === 'grid') {
          pagination.pageSize = 12
        } else {
          pagination.pageSize = 10
        }
        loadResourceList()
      }
  
      // 搜索资源
      const handleSearch = () => {
        loadResourceList()
      }
  
      // 重置搜索
      const handleReset = () => {
        Object.keys(searchForm).forEach(key => {
          if (key === 'dateRange') {
            searchForm[key] = []
          } else {
            searchForm[key] = ''
          }
        })
        loadResourceList()
      }
  
      // 预览资源
      const previewResource = (resource) => {
        selectedResource.value = resource
        previewVisible.value = true
      }
  
      // 下载资源
      const downloadResource = async (resource) => {
        try {
          const response = await resourceApi.downloadResource(resource.id)
          if (response.code === 0) {
            // 创建下载链接
            const link = document.createElement('a')
            link.href = response.data
            link.download = resource.name
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            
            ElMessage.success(`开始下载: ${resource.name}`)
          } else {
            ElMessage.error(response.message || '下载失败')
          }
        } catch (error) {
          console.error('下载失败:', error)
          ElMessage.error('下载失败，请稍后重试')
        }
      }
  
      // 编辑资源
      const editResource = (resource) => {
        ElMessage.info(`编辑资源: ${resource.name}`)
      }
  
      // 处理资源操作
      const handleResourceAction = ({ action, resource }) => {
        switch (action) {
          case 'edit':
            editResource(resource)
            break
          case 'move':
            ElMessage.info(`移动文件: ${resource.name}`)
            break
          case 'copy':
            // 复制链接到剪贴板
            navigator.clipboard.writeText(resource.url).then(() => {
              ElMessage.success('链接已复制到剪贴板')
            })
            break
          case 'share':
            handleShareResource(resource)
            break
          case 'delete':
            handleDeleteResource(resource)
            break
        }
      }
  
      // 删除资源
      const handleDeleteResource = (resource) => {
        ElMessageBox.confirm(
          `确定要删除文件 "${resource.name}" 吗？此操作不可恢复。`,
          '删除确认',
          {
            confirmButtonText: '确定删除',
            cancelButtonText: '取消',
            type: 'warning'
          }
        ).then(async () => {
          try {
            const response = await resourceApi.deleteResource(resource.id)
            if (response.code === 0) {
              // 从列表中移除
              const index = resourceList.value.findIndex(r => r.id === resource.id)
              if (index > -1) {
                resourceList.value.splice(index, 1)
                pagination.total--
              }
              // 从所有资源中移除
              const allIndex = allResources.value.findIndex(r => r.id === resource.id)
              if (allIndex > -1) {
                allResources.value.splice(allIndex, 1)
              }
              // 更新统计数据
              updateStats()
              ElMessage.success('删除成功')
            } else {
              ElMessage.error(response.message || '删除失败')
            }
          } catch (error) {
            console.error('删除失败:', error)
            ElMessage.error('删除失败，请稍后重试')
          }
        }).catch(() => {
          ElMessage.info('已取消删除')
        })
      }
  
      // 批量下载
      const batchDownload = () => {
        ElMessage.success(`开始批量下载 ${selectedResources.value.length} 个文件`)
      }
  
      // 分享资源
      const handleShareResource = async (resource) => {
        try {
          // 这里可以弹出一个对话框让用户选择要分享给哪个教师
          const targetTeacherId = prompt('请输入目标教师ID:')
          if (!targetTeacherId) return

          const response = await resourceApi.shareResource(resource.id, targetTeacherId)
          if (response.code === 0) {
            ElMessage.success('资源分享成功')
          } else {
            ElMessage.error(response.message || '分享失败')
          }
        } catch (error) {
          console.error('分享失败:', error)
          ElMessage.error('分享失败，请稍后重试')
        }
      }

      // 批量删除
      const batchDelete = () => {
        ElMessageBox.confirm(
          `确定要删除选中的 ${selectedResources.value.length} 个文件吗？此操作不可恢复。`,
          '批量删除确认',
          {
            confirmButtonText: '确定删除',
            cancelButtonText: '取消',
            type: 'warning'
          }
        ).then(async () => {
          try {
            // 逐个删除选中的资源
            const deletePromises = selectedResources.value.map(resourceId => 
              resourceApi.deleteResource(resourceId)
            )
            
            const results = await Promise.allSettled(deletePromises)
            const successCount = results.filter(result => 
              result.status === 'fulfilled' && result.value.code === 0
            ).length
            
            if (successCount === selectedResources.value.length) {
              // 从列表中移除
              resourceList.value = resourceList.value.filter(r => 
                !selectedResources.value.includes(r.id)
              )
              // 从所有资源中移除
              allResources.value = allResources.value.filter(r => 
                !selectedResources.value.includes(r.id)
              )
              pagination.total -= selectedResources.value.length
              selectedResources.value = []
              updateStats()
              ElMessage.success('批量删除成功')
            } else {
              ElMessage.warning(`成功删除 ${successCount} 个文件，${selectedResources.value.length - successCount} 个删除失败`)
            }
          } catch (error) {
            console.error('批量删除失败:', error)
            ElMessage.error('批量删除失败，请稍后重试')
          }
        }).catch(() => {
          ElMessage.info('已取消删除')
        })
      }
  
      // 分页大小改变
      const handleSizeChange = (size) => {
        pagination.pageSize = size
        loadResourceList()
      }
  
      // 当前页改变
      const handleCurrentChange = (page) => {
        pagination.currentPage = page
        loadResourceList()
      }
  
            // 更新统计数据
      const updateStats = () => {
        const resources = allResources.value
        stats.totalFiles = resources.length
        stats.videoCount = resources.filter(r => r.type === 'video').length
        stats.imageCount = resources.filter(r => r.type === 'image').length
        stats.totalSize = resources.reduce((total, r) => total + (r.size || 0), 0)
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

      // 加载资源列表
      const loadResourceList = async () => {
        loading.value = true
        
        try {
          const teacherId = userStore.userInfo?.id || 'T123' // 从用户store获取教师ID
          let response

          // 如果有搜索条件，使用搜索接口
          if (searchForm.name || searchForm.type || searchForm.courseId) {
            const keyword = searchForm.name || ''
            response = await resourceApi.searchResources(keyword, teacherId)
          } else {
            // 否则获取所有资源
            response = await resourceApi.getResourcesByTeacher(teacherId)
          }

          if (response.code === 0) {
            // 转换后端数据为前端格式
            const transformedResources = response.data.map(resourceUtils.transformResourceData)
            
            // 应用前端过滤
            let filteredResources = transformedResources
            
            if (searchForm.type) {
              filteredResources = filteredResources.filter(resource =>
                resource.type === searchForm.type
              )
            }
            if (searchForm.courseId) {
              filteredResources = filteredResources.filter(resource =>
                resource.courseId === searchForm.courseId
              )
            }

            // 更新所有资源数据
            allResources.value = filteredResources
            
            // 分页处理
            const start = (pagination.currentPage - 1) * pagination.pageSize
            const end = start + pagination.pageSize
            
            resourceList.value = filteredResources.slice(start, end)
            pagination.total = filteredResources.length
            
            // 更新统计数据
            updateStats()
          } else {
            ElMessage.error(response.message || '加载资源列表失败')
          }
        } catch (error) {
          console.error('加载资源列表失败:', error)
          ElMessage.error('加载资源列表失败，请稍后重试')
        } finally {
          loading.value = false
        }
      }
  
      onMounted(async () => {
        await loadCourseList()
        await loadResourceList()
      })
  
      return {
        loading,
        viewMode,
        stats,
        searchForm,
        pagination,
        courseList,
        resourceList,
        selectedResources,
        selectedResource,
        previewVisible,
        getTypeText,
        getTypeColor,
        getFileTypeClass,
        getFileIcon,
        toggleSelection,
        handleSelectionChange,
        handleViewModeChange,
        handleSearch,
        handleReset,
        previewResource,
        downloadResource,
        editResource,
        handleResourceAction,
        handleShareResource,
        batchDownload,
        batchDelete,
        handleSizeChange,
        handleCurrentChange,
        loadCourseList,
        updateStats,
        formatDate,
        formatFileSize
      }
    }
  }
  </script>
  
  <style scoped>
  .resource-list {
    padding: 0;
  }
  
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
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
  
  .stats-row {
    margin-bottom: 20px;
  }
  
  .stat-card {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    display: flex;
    align-items: center;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
    transition: transform 0.3s, box-shadow 0.3s;
  }
  
  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px 0 rgba(0,0,0,.15);
  }
  
  .stat-card.primary {
    border-left: 4px solid #409eff;
  }
  
  .stat-card.success {
    border-left: 4px solid #67c23a;
  }
  
  .stat-card.warning {
    border-left: 4px solid #e6a23c;
  }
  
  .stat-card.danger {
    border-left: 4px solid #f56c6c;
  }
  
  .stat-icon {
    font-size: 32px;
    margin-right: 16px;
    opacity: 0.8;
  }
  
  .stat-card.primary .stat-icon {
    color: #409eff;
  }
  
  .stat-card.success .stat-icon {
    color: #67c23a;
  }
  
  .stat-card.warning .stat-icon {
    color: #e6a23c;
  }
  
  .stat-card.danger .stat-icon {
    color: #f56c6c;
  }
  
  .stat-content .stat-number {
    font-size: 28px;
    font-weight: bold;
    color: #303133;
    margin-bottom: 4px;
  }
  
  .stat-content .stat-label {
    font-size: 14px;
    color: #909399;
  }
  
  .search-section {
    margin-bottom: 20px;
  }
  
  .view-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 16px 20px;
  }
  
  .batch-actions {
    display: flex;
    gap: 8px;
  }
  
  .resource-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
    margin-bottom: 20px;
  }
  
  .resource-card {
    background: #fff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
    transition: all 0.3s;
    cursor: pointer;
    position: relative;
    border: 2px solid transparent;
  }
  
  .resource-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px 0 rgba(0,0,0,.15);
  }
  
  .resource-card.selected {
    border-color: #409eff;
    background: #f0f9ff;
  }
  
  .resource-preview {
    position: relative;
    height: 160px;
    background: #f8f9fa;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .file-icon {
    font-size: 48px;
    color: #909399;
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
  
  .resource-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    opacity: 0;
    transition: opacity 0.3s;
  }
  
  .resource-card:hover .resource-overlay {
    opacity: 1;
  }
  
  .resource-info {
    padding: 16px;
  }
  
  .resource-title {
    margin: 0 0 8px 0;
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .resource-meta {
    margin: 0 0 12px 0;
    font-size: 12px;
    color: #909399;
    display: flex;
    justify-content: space-between;
  }
  
  .resource-tags {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
  }
  
  .resource-actions {
    position: absolute;
    top: 8px;
    right: 8px;
  }
  
  .file-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .file-icon-small {
    font-size: 24px;
    color: #909399;
    flex-shrink: 0;
  }
  
  .file-icon-small.file-type-document {
    color: #409eff;
  }
  
  .file-icon-small.file-type-video {
    color: #67c23a;
  }
  
  .file-icon-small.file-type-audio {
    color: #e6a23c;
  }
  
  .file-icon-small.file-type-image {
    color: #f56c6c;
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
  
  .file-meta {
    font-size: 12px;
    color: #909399;
    display: flex;
    gap: 16px;
  }
  
  .pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 20px;
    padding: 20px;
    background: #fff;
    border-radius: 8px;
  }
  
  .file-preview {
    text-align: center;
  }
  
  .image-preview img {
    max-width: 100%;
    max-height: 500px;
    border-radius: 4px;
  }
  
  .preview-placeholder {
    padding: 60px 20px;
    color: #909399;
  }
  
  .preview-placeholder p {
    margin: 16px 0;
    font-size: 16px;
  }
  
  /* 响应式设计 */
  @media (max-width: 768px) {
    .page-header {
      flex-direction: column;
      gap: 16px;
    }
  
    .view-controls {
      flex-direction: column;
      gap: 16px;
      align-items: stretch;
    }
  
    .resource-grid {
      grid-template-columns: 1fr;
    }
  
    .search-section .el-form {
      flex-direction: column;
    }
  
    .search-section .el-form-item {
      margin-right: 0;
      margin-bottom: 16px;
    }
  }
  </style>