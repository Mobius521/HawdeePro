<template>
    <div class="course-list">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-content">
          <h2 class="page-title">课程管理</h2>
          <p class="page-description">管理您的所有课程，包括创建、编辑和删除课程</p>
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="$router.push('/dashboard/course/create')">
            <el-icon><Plus /></el-icon>
            创建课程
          </el-button>
        </div>
      </div>
  
      <!-- 搜索和筛选 -->
      <div class="search-section card">
        <el-form :model="searchForm" inline>
          <el-form-item label="课程名称/教师">
            <el-input
              v-model="searchForm.name"
              placeholder="请输入课程名称或教师姓名"
              clearable
              style="width: 200px"
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
  
      <!-- 课程列表 -->
      <div class="course-grid">
        <el-skeleton :loading="loading" :rows="3" animated v-if="loading">
          <template #template>
            <div class="course-grid">
              <div v-for="i in 6" :key="i" class="course-card">
                <el-skeleton-item variant="image" style="width: 100%; height: 200px;" />
                <div style="padding: 20px;">
                  <el-skeleton-item variant="h3" style="width: 50%;" />
                  <el-skeleton-item variant="text" style="width: 100%;" />
                  <el-skeleton-item variant="text" style="width: 80%;" />
                </div>
              </div>
            </div>
          </template>
        </el-skeleton>
        
        <template v-else>
          <div
            v-for="course in courseList"
            :key="course.id"
            class="course-card"
            @click="viewCourse(course)"
          >
            <div class="course-cover">
              <img :src="course.cover || '/default-course.jpg'" :alt="course.name" />
            </div>
            
            <div class="course-content">
              <h3 class="course-title">{{ course.name }}</h3>
              
              <div class="course-meta">
                <div class="meta-item">
                  <el-icon><User /></el-icon>
                  <span>{{ getTeacherNameSync(course.teacherId) }}</span>
                </div>
                <div class="meta-item" v-if="course.time">
                  <span>时间: {{ course.time }}</span>
                </div>
                <div class="meta-item" v-if="course.classroom">
                  <span>教室: {{ course.classroom }}</span>
                </div>
              </div>
              
              <div class="course-progress">
                <div class="progress-info">
                  <span>课程进度</span>
                  <span>{{ course.progress }}%</span>
                </div>
                <el-progress
                  :percentage="course.progress"
                  :stroke-width="6"
                  :show-text="false"
                />
              </div>
            </div>
            
            <div class="course-actions">
              <el-button
                type="text"
                size="small"
                @click.stop="editCourse(course)"
              >
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button
                type="text"
                size="small"
                @click.stop="handleDeleteCourse(course)"
              >
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
          </div>
          
          <!-- 空状态 -->
          <div v-if="!loading && courseList.length === 0" class="empty-state">
            <el-empty description="暂无课程数据">
              <el-button type="primary" @click="$router.push('/dashboard/course/create')">
                创建第一个课程
              </el-button>
            </el-empty>
          </div>
        </template>
      </div>
  
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[12, 24, 48]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
  
      <!-- 课程详情对话框 -->
      <el-dialog
        v-model="courseDetailVisible"
        :title="selectedCourse?.name"
        width="800px"
        destroy-on-close
      >
        <div v-if="selectedCourse" class="course-detail">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="课程名称">
              {{ selectedCourse.name }}
            </el-descriptions-item>
            <el-descriptions-item label="课程ID">
              {{ selectedCourse.id }}
            </el-descriptions-item>
            <el-descriptions-item label="授课教师">
              {{ getTeacherNameSync(selectedCourse.teacherId) }}
            </el-descriptions-item>
            <el-descriptions-item label="上课地点">
              {{ selectedCourse.classroom || '未设置' }}
            </el-descriptions-item>
            <el-descriptions-item label="上课时间">
              {{ selectedCourse.time || '未设置' }}
            </el-descriptions-item>
            <el-descriptions-item label="课程评价">
              {{ selectedCourse.evaluation || '暂无评价' }}
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">
              {{ formatDate(selectedCourse.createTime) }}
            </el-descriptions-item>
          </el-descriptions>
          
          <div class="course-stats">
            <h4>课程统计</h4>
            <el-row :gutter="20">
              <el-col :span="8">
                <div class="stat-item">
                  <div class="stat-number">{{ selectedCourse.chapterCount || 0 }}</div>
                  <div class="stat-label">章节数</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="stat-item">
                  <div class="stat-number">{{ selectedCourse.resourceCount || 0 }}</div>
                  <div class="stat-label">资源数</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="stat-item">
                  <div class="stat-number">{{ selectedCourse.homeworkCount || 0 }}</div>
                  <div class="stat-label">作业数</div>
                </div>
              </el-col>
            </el-row>
          </div>
        </div>
        
        <template #footer>
          <el-button @click="courseDetailVisible = false">关闭</el-button>
          <el-button type="primary" @click="editCourse(selectedCourse)">
            编辑课程
          </el-button>
        </template>
      </el-dialog>
    </div>
  </template>
  
  <script>
  import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh, User, Edit, Delete } from '@element-plus/icons-vue'
import { formatDate } from '@/utils'
import { courseApi, courseUtils } from '@/api/course'
import { getTeacherName as getTeacherNameApi } from '@/api/auth'
import { useUserStore } from '@/stores/user'
import { courseLogHelper } from '@/utils/logHelper'
  
  export default {
    name: 'CourseList',
    setup() {
      const router = useRouter()
      const userStore = useUserStore()
  
      // 搜索表单
      const searchForm = reactive({
        name: ''
      })
  
      // 分页信息
      const pagination = reactive({
        currentPage: 1,
        pageSize: 12,
        total: 0
      })
  
      // 课程列表
      const courseList = ref([])
      
      // 选中的课程
      const selectedCourse = ref(null)
      const courseDetailVisible = ref(false)
  
      // 加载状态
      const loading = ref(false)
  
      // 搜索课程
      const handleSearch = () => {
        pagination.currentPage = 1
        loadCourseList()
      }
  
      // 重置搜索
      const handleReset = () => {
        Object.keys(searchForm).forEach(key => {
          searchForm[key] = ''
        })
        pagination.currentPage = 1
        loadCourseList()
      }
  
      // 查看课程详情
      const viewCourse = (course) => {
        selectedCourse.value = course
        courseDetailVisible.value = true
      }
  
      // 编辑课程
      const editCourse = (course) => {
        router.push(`/dashboard/course/edit/${course.id}`)
      }
  
      
  
      // 删除课程
      const handleDeleteCourse = async (course) => {
        try {
          await ElMessageBox.confirm(
            `确定要删除课程 "${course.name}" 吗？此操作不可恢复。`,
            '删除确认',
            {
              confirmButtonText: '确定删除',
              cancelButtonText: '取消',
              type: 'warning'
            }
          )
  
          loading.value = true
          const response = await courseApi.deleteCourse(course.id)
          
          if (response.code === 0) {
            // 记录删除课程的日志
            await courseLogHelper.deleteCourse(course.name)
            
            ElMessage.success('删除成功')
            loadCourseList() // 重新加载列表
          } else {
            ElMessage.error(response.message || '删除失败')
          }
        } catch (error) {
          if (error !== 'cancel') {
            console.error('删除课程失败:', error)
            ElMessage.error('删除失败，请稍后重试')
          }
        } finally {
          loading.value = false
        }
      }
  
      // 分页大小改变
      const handleSizeChange = (size) => {
        pagination.pageSize = size
        pagination.currentPage = 1
        loadCourseList()
      }
  
      // 当前页改变
      const handleCurrentChange = (page) => {
        pagination.currentPage = page
        loadCourseList()
      }
  
      // 加载课程列表
      const loadCourseList = async () => {
        try {
          loading.value = true
          
          // 根据用户角色调用不同的API
          let response
          if (userStore.isTeacher) {
            // 教师查看自己的课程
            response = await courseApi.getCoursesByTeacher(userStore.userInfo.id || 'T123')
          } else {
            // 管理员查看所有课程
            response = await courseApi.getAllCourses()
          }
  
          if (response.code === 0) {
                        // 转换后端数据为前端格式
            let courses = response.data.map(courseUtils.transformCourseData)
            
            // 预加载教师姓名
            await preloadTeacherNames(courses)
            
            // 应用搜索过滤
            if (searchForm.name) {
              courses = courses.filter(course =>
                course.name.toLowerCase().includes(searchForm.name.toLowerCase()) ||
                getTeacherNameSync(course.teacherId).toLowerCase().includes(searchForm.name.toLowerCase())
              )
            }
            
            // 分页处理
            const start = (pagination.currentPage - 1) * pagination.pageSize
            const end = start + pagination.pageSize
            
            courseList.value = courses.slice(start, end)
            pagination.total = courses.length
          } else {
            ElMessage.error(response.message || '加载课程列表失败')
          }
        } catch (error) {
          console.error('加载课程列表失败:', error)
          ElMessage.error('加载课程列表失败，请稍后重试')
        } finally {
          loading.value = false
        }
      }
  
      // 教师姓名缓存 - 使用响应式对象而不是Map
      const teacherNameCache = ref({})

      // 预加载教师姓名
      const preloadTeacherNames = async (courses) => {
        const teacherIds = [...new Set(courses.map(course => course.teacherId).filter(Boolean))]
        
        // 过滤掉已缓存的教师ID
        const uncachedTeacherIds = teacherIds.filter(id => 
          id !== userStore.userInfo.id && !(id in teacherNameCache.value)
        )
        
        console.log('需要预加载的教师ID:', uncachedTeacherIds)
        
        if (uncachedTeacherIds.length === 0) {
          console.log('所有教师姓名已缓存')
          return
        }
        
        // 并发获取所有未缓存的教师姓名
        const promises = uncachedTeacherIds.map(async (teacherId) => {
          try {
            console.log(`正在获取教师 ${teacherId} 的姓名...`)
            const response = await getTeacherNameApi(teacherId)
            console.log(`教师 ${teacherId} API响应:`, response)
            
            if (response.code === 200 && response.data) {
              teacherNameCache.value[teacherId] = response.data
              console.log(`成功缓存教师 ${teacherId} 姓名: ${response.data}`)
            } else if (response.code === 0 && response.data) {
              // 兼容code为0的情况
              teacherNameCache.value[teacherId] = response.data
              console.log(`成功缓存教师 ${teacherId} 姓名: ${response.data}`)
            } else {
              console.warn(`教师 ${teacherId} API返回错误:`, response)
              teacherNameCache.value[teacherId] = teacherId || '未知教师'
            }
          } catch (error) {
            console.error(`获取教师 ${teacherId} 姓名失败:`, error)
            teacherNameCache.value[teacherId] = teacherId || '未知教师'
          }
        })
        
        await Promise.all(promises)
        console.log('教师姓名预加载完成，当前缓存:', teacherNameCache.value)
      }

      // 同步获取教师姓名（用于模板显示）
      const getTeacherNameSync = (teacherId) => {
        // 如果是当前用户，直接返回用户姓名
        if (teacherId === userStore.userInfo.id) {
          return userStore.userInfo.name || '当前用户'
        }
        
        // 从缓存获取
        const cachedName = teacherNameCache.value[teacherId]
        if (cachedName && cachedName !== teacherId) {
          return cachedName
        }
        
        // 如果缓存中没有或缓存的就是ID本身，尝试异步获取
        if (teacherId && !(teacherId in teacherNameCache.value)) {
          getTeacherName(teacherId).catch(error => {
            console.error(`获取教师 ${teacherId} 姓名失败:`, error)
          })
        }
        
        return teacherId || '未知教师'
      }

      // 异步获取教师姓名
      const getTeacherName = async (teacherId) => {
        // 如果是当前用户，直接返回用户姓名
        if (teacherId === userStore.userInfo.id) {
          return userStore.userInfo.name || '当前用户'
        }
        
        // 检查缓存
        if (teacherId in teacherNameCache.value) {
          const cachedName = teacherNameCache.value[teacherId]
          console.log(`从缓存获取教师 ${teacherId} 姓名: ${cachedName}`)
          return cachedName
        }
        
        try {
          console.log(`调用API获取教师 ${teacherId} 姓名...`)
          // 调用API获取教师姓名
          const response = await getTeacherNameApi(teacherId)
          console.log(`教师 ${teacherId} API响应:`, response)
          
          if (response.code === 200 && response.data) {
            const teacherName = response.data
            // 缓存结果
            teacherNameCache.value[teacherId] = teacherName
            console.log(`成功获取并缓存教师 ${teacherId} 姓名: ${teacherName}`)
            return teacherName
          } else if (response.code === 0 && response.data) {
            // 兼容code为0的情况
            const teacherName = response.data
            teacherNameCache.value[teacherId] = teacherName
            console.log(`成功获取并缓存教师 ${teacherId} 姓名: ${teacherName}`)
            return teacherName
          } else {
            // API调用失败，返回默认值
            console.warn(`教师 ${teacherId} API返回错误:`, response)
            const fallbackName = teacherId || '未知教师'
            teacherNameCache.value[teacherId] = fallbackName
            return fallbackName
          }
        } catch (error) {
          console.error(`获取教师 ${teacherId} 姓名失败:`, error)
          // 出错时返回默认值
          const fallbackName = teacherId || '未知教师'
          teacherNameCache.value[teacherId] = fallbackName
          return fallbackName
        }
      }
  
      onMounted(() => {
        console.log('课程列表组件挂载，用户信息:', userStore.userInfo)
        loadCourseList()
      })
  
      return {
        searchForm,
        pagination,
        courseList,
        selectedCourse,
        courseDetailVisible,
        loading,
        handleSearch,
        handleReset,
        viewCourse,
        editCourse,
        handleDeleteCourse,
        handleSizeChange,
        handleCurrentChange,
        formatDate,
        getTeacherName,
        getTeacherNameSync
      }
    }
  }
  </script>
  
  <style scoped>
  .course-list {
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
  
  .search-section {
    margin-bottom: 20px;
  }
  
  .course-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 20px;
    margin-bottom: 20px;
  }
  
  .course-card {
    background: #fff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
    transition: all 0.3s;
    cursor: pointer;
    position: relative;
  }
  
  .course-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px 0 rgba(0,0,0,.15);
  }
  
  .course-cover {
    position: relative;
    height: 180px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 48px;
  }
  
  .course-cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .course-content {
    padding: 20px;
  }
  
  .course-title {
    margin: 0 0 8px 0;
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    line-height: 1.4;
  }
  
  .course-description {
    margin: 0 0 16px 0;
    color: #606266;
    font-size: 14px;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .course-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 16px;
  }
  
  .meta-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #909399;
  }
  
  .course-progress {
    margin-bottom: 16px;
  }
  
  .progress-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    font-size: 12px;
    color: #606266;
  }
  
  .course-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px 16px;
    border-top: 1px solid #f0f0f0;
    margin-top: 16px;
  }
  
  .pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 20px;
    padding: 20px;
    background: #fff;
    border-radius: 8px;
  }
  
  .course-detail {
    padding: 20px 0;
  }
  
  .course-stats {
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid #f0f0f0;
  }
  
  .course-stats h4 {
    margin: 0 0 16px 0;
    font-size: 16px;
    color: #303133;
  }
  
  .stat-item {
    text-align: center;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;
  }
  
  .stat-number {
    display: block;
    font-size: 24px;
    font-weight: bold;
    color: #409eff;
    margin-bottom: 4px;
  }
  
  .stat-label {
    font-size: 14px;
    color: #606266;
  }
  
  /* 响应式设计 */
  @media (max-width: 768px) {
    .page-header {
      flex-direction: column;
      gap: 16px;
    }
  
    .course-grid {
      grid-template-columns: 1fr;
    }
  
    .course-meta {
      flex-direction: column;
      gap: 8px;
    }
  
    .course-actions {
      flex-direction: column;
      gap: 8px;
    }
  }
  
  .empty-state {
    grid-column: 1 / -1;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 300px;
  }
  </style>