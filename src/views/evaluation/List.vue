<template>
  <div class="analysis-list">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h2 class="page-title">学情分析</h2>
        <p class="page-description">分析学生学习情况，提供个性化建议和教学指导</p>
        <p class="user-info">{{ userStore.userName }} 的课程</p>
      </div>
    </div>

    <!-- 课程选择 -->
    <div class="course-selection card">
      <h3 class="section-title">选择课程</h3>
      <el-form :model="searchForm" inline>
        <el-form-item label="课程名称">
          <el-input
            v-model="searchForm.courseName"
            placeholder="请输入课程名称"
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
    <div class="course-list card">
      <div v-loading="loading">
        <div v-if="courseList.length === 0" class="empty-state">
          <el-empty description="暂无课程数据" />
        </div>
        
        <div v-else class="course-grid">
          <div
            v-for="course in courseList"
            :key="course.id"
            class="course-card"
            @click="selectCourse(course)"
          >
            <div class="course-header">
              <div class="course-icon">
                <el-icon><Reading /></el-icon>
              </div>
              <div class="course-info">
                <h4 class="course-name">{{ course.name }}</h4>
                <p class="course-code">{{ course.code }}</p>
              </div>
            </div>
            
            <div class="course-stats">
              <div class="stat-item">
                <span class="stat-label">学生数</span>
                <span class="stat-value">{{ course.studentCount || 0 }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">平均分</span>
                <span class="stat-value">{{ course.avgScore || 0 }}</span>
              </div>
            </div>
            
            <div class="course-actions">
              <el-button type="primary" size="small" @click.stop="selectCourse(course)">
                开始分析
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[8, 16, 24, 32]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { courseApi } from '@/api/course'
import { useUserStore } from '@/stores/user'
import { analysisApi } from '@/api/analysis'

export default {
  name: 'AnalysisList',
  setup() {
    const router = useRouter()
    const userStore = useUserStore()
    const loading = ref(false)

    // 搜索表单
    const searchForm = reactive({
      courseName: ''
    })

    // 分页信息
    const pagination = reactive({
      currentPage: 1,
      pageSize: 8,
      total: 0
    })

    // 课程列表
    const courseList = ref([])

    // 搜索课程
    const handleSearch = () => {
      loadCourseList()
    }

    // 重置搜索
    const handleReset = () => {
      searchForm.courseName = ''
      loadCourseList()
    }

    // 选择课程
    const selectCourse = (course) => {
      router.push({
        path: '/dashboard/analysis/detail',
        query: { courseId: course.id, courseName: course.name }
      })
    }

    // 分页大小改变
    const handleSizeChange = (size) => {
      pagination.pageSize = size
      loadCourseList()
    }

    // 当前页改变
    const handleCurrentChange = (page) => {
      pagination.currentPage = page
      loadCourseList()
    }

    // 加载课程列表
    const loadCourseList = async () => {
      loading.value = true
      
      try {
        let response
        
        // 根据用户角色决定获取哪些课程
        if (userStore.isAdmin) {
          // 管理员可以看到所有课程
          response = await courseApi.getAllCourses()
        } else {
          // 教师只能看到自己的课程
          const teacherId = userStore.userInfo.id
          if (!teacherId) {
            ElMessage.error('用户信息不完整，请重新登录')
            return
          }
          response = await courseApi.getCoursesByTeacher(teacherId)
        }
        
        if (response.code === 0) {
          let filteredCourses = response.data.map(course => ({
            id: course.courseId,
            name: course.courseName,
            code: course.courseId,
            teacherId: course.teacherId,
            time: course.time,
            classroom: course.classroom,
            evaluation: course.evaluation,
            studentCount: 0, // 后端可能需要添加
            avgScore: 0 // 后端可能需要添加
          }))

          // 应用搜索过滤
          if (searchForm.courseName) {
            filteredCourses = filteredCourses.filter(course =>
              course.name.toLowerCase().includes(searchForm.courseName.toLowerCase())
            )
          }

          // 分页处理
          const start = (pagination.currentPage - 1) * pagination.pageSize
          const end = start + pagination.pageSize
          
          const pagedCourses = filteredCourses.slice(start, end)

          // 动态获取每门课程的学生数
          await Promise.all(
            pagedCourses.map(async (course) => {
              try {
                const res = await analysisApi.getStudentsByCourse(course.id)
                if (res.code === 0 && Array.isArray(res.data)) {
                  course.studentCount = res.data.length
                } else {
                  course.studentCount = 0
                }
              } catch {
                course.studentCount = 0
              }
            })
          )

          courseList.value = pagedCourses
          pagination.total = filteredCourses.length
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

    onMounted(() => {
      loadCourseList()
    })

    return {
      loading,
      searchForm,
      pagination,
      courseList,
      userStore,
      handleSearch,
      handleReset,
      selectCourse,
      handleSizeChange,
      handleCurrentChange
    }
  }
}
</script>

<style scoped>
.analysis-list {
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

.user-info {
  margin: 8px 0 0 0 !important;
  color: #409eff !important;
  font-size: 12px !important;
  font-weight: 500;
}

.course-selection {
  margin-bottom: 20px;
}

.section-title {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.course-list {
  margin-bottom: 20px;
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
}

.course-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.course-card {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.course-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px 0 rgba(0,0,0,.1);
  border-color: #409eff;
}

.course-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.course-icon {
  font-size: 32px;
  color: #409eff;
  margin-right: 12px;
}

.course-info {
  flex: 1;
}

.course-name {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.course-code {
  margin: 0;
  font-size: 12px;
  color: #909399;
}

.course-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.course-actions {
  text-align: center;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .course-grid {
    grid-template-columns: 1fr;
  }

  .course-selection .el-form {
    flex-direction: column;
  }

  .course-selection .el-form-item {
    margin-right: 0;
    margin-bottom: 16px;
  }
}
</style> 