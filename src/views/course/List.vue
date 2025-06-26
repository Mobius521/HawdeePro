<template>
    <div class="course-list">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-content">
          <h2 class="page-title">课程管理</h2>
          <p class="page-description">管理您的所有课程，包括创建、编辑和删除课程</p>
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="$router.push('/course/create')">
            <el-icon><Plus /></el-icon>
            创建课程
          </el-button>
        </div>
      </div>
  
      <!-- 搜索和筛选 -->
      <div class="search-section card">
        <el-form :model="searchForm" inline>
          <el-form-item label="课程名称">
            <el-input
              v-model="searchForm.name"
              placeholder="请输入课程名称"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="课程状态">
            <el-select
              v-model="searchForm.status"
              placeholder="请选择状态"
              clearable
              style="width: 150px"
            >
              <el-option label="全部" value="" />
              <el-option label="进行中" value="active" />
              <el-option label="已结束" value="finished" />
              <el-option label="未开始" value="pending" />
            </el-select>
          </el-form-item>
          <el-form-item label="学期">
            <el-select
              v-model="searchForm.semester"
              placeholder="请选择学期"
              clearable
              style="width: 150px"
            >
              <el-option label="2024春季" value="2024-spring" />
              <el-option label="2024秋季" value="2024-autumn" />
              <el-option label="2023春季" value="2023-spring" />
            </el-select>
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
        <div
          v-for="course in courseList"
          :key="course.id"
          class="course-card"
          @click="viewCourse(course)"
        >
          <div class="course-cover">
            <img :src="course.cover || '/default-course.jpg'" :alt="course.name" />
            <div class="course-status" :class="course.status">
              {{ getStatusText(course.status) }}
            </div>
          </div>
          
          <div class="course-content">
            <h3 class="course-title">{{ course.name }}</h3>
            <p class="course-description">{{ course.description }}</p>
            
            <div class="course-meta">
              <div class="meta-item">
                <el-icon><User /></el-icon>
                <span>{{ course.studentCount }} 学生</span>
              </div>
              <div class="meta-item">
                <el-icon><Clock /></el-icon>
                <span>{{ course.duration }} 学时</span>
              </div>
              <div class="meta-item">
                <el-icon><Calendar /></el-icon>
                <span>{{ course.semester }}</span>
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
              @click.stop="manageCourse(course)"
            >
              <el-icon><Setting /></el-icon>
              管理
            </el-button>
            <el-dropdown @command="handleCourseAction" @click.stop>
              <el-button type="text" size="small">
                <el-icon><MoreFilled /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item :command="{action: 'copy', course}">
                    <el-icon><CopyDocument /></el-icon>复制课程
                  </el-dropdown-item>
                  <el-dropdown-item :command="{action: 'export', course}">
                    <el-icon><Download /></el-icon>导出数据
                  </el-dropdown-item>
                  <el-dropdown-item
                    :command="{action: 'delete', course}"
                    divided
                  >
                    <el-icon><Delete /></el-icon>删除课程
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
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
            <el-descriptions-item label="课程代码">
              {{ selectedCourse.code }}
            </el-descriptions-item>
            <el-descriptions-item label="学分">
              {{ selectedCourse.credits }}
            </el-descriptions-item>
            <el-descriptions-item label="学时">
              {{ selectedCourse.duration }}
            </el-descriptions-item>
            <el-descriptions-item label="学期">
              {{ selectedCourse.semester }}
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="getStatusType(selectedCourse.status)">
                {{ getStatusText(selectedCourse.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="学生人数">
              {{ selectedCourse.studentCount }}
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">
              {{ formatDate(selectedCourse.createTime) }}
            </el-descriptions-item>
            <el-descriptions-item label="课程描述" :span="2">
              {{ selectedCourse.description }}
            </el-descriptions-item>
          </el-descriptions>
          
          <div class="course-stats">
            <h4>课程统计</h4>
            <el-row :gutter="20">
              <el-col :span="8">
                <div class="stat-item">
                  <div class="stat-number">{{ selectedCourse.chapterCount || 12 }}</div>
                  <div class="stat-label">章节数</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="stat-item">
                  <div class="stat-number">{{ selectedCourse.resourceCount || 45 }}</div>
                  <div class="stat-label">资源数</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="stat-item">
                  <div class="stat-number">{{ selectedCourse.homeworkCount || 8 }}</div>
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
  import { formatDate } from '@/utils'
  
  export default {
    name: 'CourseList',
    setup() {
      const router = useRouter()
  
      // 搜索表单
      const searchForm = reactive({
        name: '',
        status: '',
        semester: ''
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
  
      // 模拟课程数据
      const mockCourses = [
        {
          id: 1,
          name: 'Web前端开发基础',
          code: 'CS101',
          description: '学习HTML、CSS、JavaScript等前端技术,掌握现代Web开发技能',
          cover: '',
          status: 'active',
          semester: '2024春季',
          credits: 3,
          duration: 48,
          studentCount: 45,
          progress: 75,
          createTime: '2024-02-15',
          chapterCount: 12,
          resourceCount: 35,
          homeworkCount: 6
        },
        {
          id: 2,
          name: '数据结构与算法',
          code: 'CS102',
          description: '深入学习各种数据结构和算法，提升编程思维和解决问题的能力',
          cover: '',
          status: 'active',
          semester: '2024春季',
          credits: 4,
          duration: 64,
          studentCount: 38,
          progress: 60,
          createTime: '2024-02-10',
          chapterCount: 15,
          resourceCount: 42,
          homeworkCount: 8
        },
        {
          id: 3,
          name: '数据库系统原理',
          code: 'CS103',
          description: '学习关系数据库理论、SQL语言、数据库设计和优化技术',
          cover: '',
          status: 'finished',
          semester: '2023秋季',
          credits: 3,
          duration: 48,
          studentCount: 52,
          progress: 100,
          createTime: '2023-09-01',
          chapterCount: 10,
          resourceCount: 28,
          homeworkCount: 5
        },
        {
          id: 4,
          name: '计算机网络',
          code: 'CS104',
          description: '学习计算机网络的基本概念、协议和技术，理解网络通信原理',
          cover: '',
          status: 'pending',
          semester: '2024秋季',
          credits: 3,
          duration: 48,
          studentCount: 0,
          progress: 0,
          createTime: '2024-06-01',
          chapterCount: 8,
          resourceCount: 15,
          homeworkCount: 0
        },
        {
          id: 5,
          name: '软件工程',
          code: 'CS105',
          description: '学习软件开发的工程化方法，包括需求分析、设计、测试等',
          cover: '',
          status: 'active',
          semester: '2024春季',
          credits: 4,
          duration: 64,
          studentCount: 41,
          progress: 45,
          createTime: '2024-02-20',
          chapterCount: 14,
          resourceCount: 38,
          homeworkCount: 7
        },
        {
          id: 6,
          name: '人工智能导论',
          code: 'CS106',
          description: '介绍人工智能的基本概念、方法和应用，包括机器学习基础',
          cover: '',
          status: 'active',
          semester: '2024春季',
          credits: 3,
          duration: 48,
          studentCount: 35,
          progress: 30,
          createTime: '2024-03-01',
          chapterCount: 11,
          resourceCount: 32,
          homeworkCount: 4
        }
      ]
  
      // 获取状态文本
      const getStatusText = (status) => {
        const statusMap = {
          active: '进行中',
          finished: '已结束',
          pending: '未开始'
        }
        return statusMap[status] || '未知'
      }
  
      // 获取状态类型
      const getStatusType = (status) => {
        const typeMap = {
          active: 'success',
          finished: 'info',
          pending: 'warning'
        }
        return typeMap[status] || 'info'
      }
  
      // 搜索课程
      const handleSearch = () => {
        loadCourseList()
      }
  
      // 重置搜索
      const handleReset = () => {
        Object.keys(searchForm).forEach(key => {
          searchForm[key] = ''
        })
        loadCourseList()
      }
  
      // 查看课程详情
      const viewCourse = (course) => {
        selectedCourse.value = course
        courseDetailVisible.value = true
      }
  
      // 编辑课程
      const editCourse = (course) => {
        router.push(`/course/edit/${course.id}`)
      }
  
      // 管理课程
      const manageCourse = (course) => {
        router.push(`/course/manage/${course.id}`)
      }
  
      // 处理课程操作
      const handleCourseAction = ({ action, course }) => {
        switch (action) {
          case 'copy':
            handleCopyCourse(course)
            break
          case 'export':
            handleExportCourse(course)
            break
          case 'delete':
            handleDeleteCourse(course)
            break
        }
      }
  
      // 复制课程
      const handleCopyCourse = (course) => {
        ElMessage.success(`课程 "${course.name}" 复制成功`)
      }
  
      // 导出课程
      const handleExportCourse = (course) => {
        ElMessage.success(`课程 "${course.name}" 导出成功`)
      }
  
      // 删除课程
      const handleDeleteCourse = (course) => {
        ElMessageBox.confirm(
          `确定要删除课程 "${course.name}" 吗？此操作不可恢复。`,
          '删除确认',
          {
            confirmButtonText: '确定删除',
            cancelButtonText: '取消',
            type: 'warning'
          }
        ).then(() => {
          // 模拟删除操作
          const index = courseList.value.findIndex(c => c.id === course.id)
          if (index > -1) {
            courseList.value.splice(index, 1)
            pagination.total--
          }
          ElMessage.success('删除成功')
        }).catch(() => {
          ElMessage.info('已取消删除')
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
      const loadCourseList = () => {
        // 模拟API调用
        let filteredCourses = [...mockCourses]
  
        // 应用搜索过滤
        if (searchForm.name) {
          filteredCourses = filteredCourses.filter(course =>
            course.name.toLowerCase().includes(searchForm.name.toLowerCase())
          )
        }
        if (searchForm.status) {
          filteredCourses = filteredCourses.filter(course =>
            course.status === searchForm.status
          )
        }
        if (searchForm.semester) {
          filteredCourses = filteredCourses.filter(course =>
            course.semester === searchForm.semester
          )
        }
  
        // 分页处理
        const start = (pagination.currentPage - 1) * pagination.pageSize
        const end = start + pagination.pageSize
        
        courseList.value = filteredCourses.slice(start, end)
        pagination.total = filteredCourses.length
      }
  
      onMounted(() => {
        loadCourseList()
      })
  
      return {
        searchForm,
        pagination,
        courseList,
        selectedCourse,
        courseDetailVisible,
        getStatusText,
        getStatusType,
        handleSearch,
        handleReset,
        viewCourse,
        editCourse,
        manageCourse,
        handleCourseAction,
        handleSizeChange,
        handleCurrentChange,
        formatDate
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
  
  .course-status {
    position: absolute;
    top: 12px;
    right: 12px;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
    color: #fff;
  }
  
  .course-status.active {
    background: rgba(103, 194, 58, 0.9);
  }
  
  .course-status.finished {
    background: rgba(144, 147, 153, 0.9);
  }
  
  .course-status.pending {
    background: rgba(230, 162, 60, 0.9);
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
  </style>