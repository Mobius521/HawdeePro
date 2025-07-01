<template>
  <div class="course-schedule">
    <div class="page-header">
      <h2>课程表</h2>
      <div class="header-actions">
        <el-button type="primary" @click="exportSchedule">
          <el-icon><Download /></el-icon>
          导出课表
        </el-button>
        <el-button @click="printSchedule">
          <el-icon><Printer /></el-icon>
          打印课表
        </el-button>
      </div>
    </div>

    <!-- 筛选条件 -->
    <div class="filter-section">
      <el-form :model="filterForm" inline>
        <el-form-item label="教师" v-if="!userStore.isTeacher">
          <el-select v-model="filterForm.teacherId" placeholder="选择教师" clearable>
            <el-option label="全部教师" value="" />
            <el-option 
              v-for="teacher in availableTeachers" 
              :key="teacher.id" 
              :label="teacher.name" 
              :value="teacher.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="课程名称/教师">
          <el-input
            v-model="filterForm.courseName"
            placeholder="搜索课程名称或教师姓名"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter">筛选</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
      
      <!-- 筛选结果统计 -->
      <div class="filter-stats" v-if="(!userStore.isTeacher && filterForm.teacherId) || filterForm.courseName">
        <el-text type="info" size="small">
          共找到 {{ filteredCourseList.length }} 门课程
          <span v-if="!userStore.isTeacher && filterForm.teacherId">（按教师筛选）</span>
          <span v-if="filterForm.courseName">（按关键词筛选）</span>
        </el-text>
      </div>
    </div>

    <!-- 课表视图切换 -->
    <div class="view-toggle">
      <el-radio-group v-model="viewMode" @change="handleViewChange">
        <el-radio-button label="weekly">周视图</el-radio-button>
        <el-radio-button label="daily">日视图</el-radio-button>
        <el-radio-button label="list">列表视图</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 加载状态 -->
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

    <!-- 周视图 -->
    <div v-else-if="viewMode === 'weekly'" class="weekly-view">
      <div class="schedule-header">
        <el-button @click="previousWeek">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <h3>{{ currentWeekText }}</h3>
        <el-button @click="nextWeek">
          <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>

      <div class="schedule-table">
        <table>
          <thead>
            <tr>
              <th class="time-column">时间</th>
              <th v-for="day in weekDays" :key="day.key" class="day-column">
                {{ day.label }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="timeSlot in timeSlots" :key="timeSlot.id">
              <td class="time-slot">
                <div class="time-label">{{ timeSlot.label }}</div>
                <div class="time-range">{{ timeSlot.range }}</div>
              </td>
              <td
                v-for="day in weekDays"
                :key="day.key"
                class="schedule-cell"
                @click="addCourse(day.key, timeSlot.id)"
              >
                <div
                  v-for="course in getCoursesByDayAndTime(day.key, timeSlot.id)"
                  :key="course.id"
                  class="course-item"
                  @click.stop="viewCourseDetail(course)"
                >
                  <div class="course-name">{{ course.name }}</div>
                  <div class="course-location">{{ course.classroom }}</div>
                  <div class="course-teacher">{{ getTeacherName(course.teacherId) }}</div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 日视图 -->
    <div v-else-if="viewMode === 'daily'" class="daily-view">
      <div class="daily-header">
        <el-button @click="previousDay">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <h3>{{ currentDayText }}</h3>
        <el-button @click="nextDay">
          <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>

      <div class="daily-schedule">
        <div
          v-for="timeSlot in timeSlots"
          :key="timeSlot.id"
          class="daily-time-slot"
        >
          <div class="time-info">
            <div class="time-label">{{ timeSlot.label }}</div>
            <div class="time-range">{{ timeSlot.range }}</div>
          </div>
          <div class="course-list">
            <div
              v-for="course in getCoursesByDayAndTime(currentDay, timeSlot.id)"
              :key="course.id"
              class="course-card"
              @click="viewCourseDetail(course)"
            >
              <div class="course-header">
                <span class="course-name">{{ course.name }}</span>
                <el-tag type="primary" size="small">
                  课程
                </el-tag>
              </div>
              <div class="course-details">
                <div class="detail-item">
                  <el-icon><Location /></el-icon>
                  <span>{{ course.classroom }}</span>
                </div>
                <div class="detail-item">
                  <el-icon><User /></el-icon>
                  <span>{{ getTeacherName(course.teacherId) }}</span>
                </div>
                <div class="detail-item">
                  <el-icon><Clock /></el-icon>
                  <span>{{ course.time }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 列表视图 -->
    <div v-else-if="viewMode === 'list'" class="list-view">
      <el-table :data="filteredCourseList" stripe style="width: 100%">
        <el-table-column prop="name" label="课程名称" min-width="150" />
        <el-table-column label="授课教师" width="120">
          <template #default="{ row }">
            {{ getTeacherName(row.teacherId) }}
          </template>
        </el-table-column>
        <el-table-column prop="classroom" label="上课地点" width="120" />
        <el-table-column prop="time" label="上课时间" width="150" />
        <el-table-column prop="evaluation" label="课程评价" width="120" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="text" size="small" @click="viewCourseDetail(row)">
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 课程详情对话框 -->
    <el-dialog
      v-model="courseDetailVisible"
      title="课程详情"
      width="600px"
    >
      <div v-if="selectedCourse" class="course-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="课程名称">{{ selectedCourse.name }}</el-descriptions-item>
          <el-descriptions-item label="课程ID">{{ selectedCourse.id }}</el-descriptions-item>
          <el-descriptions-item label="授课教师">{{ getTeacherName(selectedCourse.teacherId) }}</el-descriptions-item>
          <el-descriptions-item label="上课地点">{{ selectedCourse.classroom || '未设置' }}</el-descriptions-item>
          <el-descriptions-item label="上课时间">{{ selectedCourse.time || '未设置' }}</el-descriptions-item>
          <el-descriptions-item label="课程评价">{{ selectedCourse.evaluation || '暂无评价' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDate(selectedCourse.createTime) }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, Printer, ArrowLeft, ArrowRight, Location, User, Clock } from '@element-plus/icons-vue'
import { courseApi, courseUtils } from '@/api/course'
import { useUserStore } from '@/stores/user'

export default {
  name: 'CourseSchedule',
  components: {
    Download,
    Printer,
    ArrowLeft,
    ArrowRight,
    Location,
    User,
    Clock
  },
  setup() {
    const userStore = useUserStore()
    const viewMode = ref('weekly')
    const currentWeek = ref(1)
    const currentDay = ref('monday')
    const courseDetailVisible = ref(false)
    const selectedCourse = ref(null)
    const loading = ref(false)
    const courseList = ref([])

    const filterForm = reactive({
      teacherId: '',
      courseName: ''
    })

    // 周次和日期配置
    const weekDays = [
      { key: 'monday', label: '周一' },
      { key: 'tuesday', label: '周二' },
      { key: 'wednesday', label: '周三' },
      { key: 'thursday', label: '周四' },
      { key: 'friday', label: '周五' },
      { key: 'saturday', label: '周六' },
      { key: 'sunday', label: '周日' }
    ]

    const timeSlots = [
      { id: 1, label: '第1-2节', range: '08:00-09:40' },
      { id: 2, label: '第3-4节', range: '10:00-11:40' },
      { id: 3, label: '第5-6节', range: '14:00-15:40' },
      { id: 4, label: '第7-8节', range: '16:00-17:40' },
      { id: 5, label: '第9-10节', range: '19:00-20:40' }
    ]

    // 计算属性
    const currentWeekText = computed(() => `第${currentWeek.value}周`)
    const currentDayText = computed(() => {
      const dayMap = {
        monday: '周一',
        tuesday: '周二',
        wednesday: '周三',
        thursday: '周四',
        friday: '周五',
        saturday: '周六',
        sunday: '周日'
      }
      return dayMap[currentDay.value]
    })

    // 过滤后的课程列表
    const filteredCourseList = computed(() => {
      let filtered = courseList.value

      // 只有非教师身份才应用教师筛选
      if (!userStore.isTeacher && filterForm.teacherId) {
        filtered = filtered.filter(course => course.teacherId === filterForm.teacherId)
      }

      if (filterForm.courseName) {
        filtered = filtered.filter(course => 
          course.name.toLowerCase().includes(filterForm.courseName.toLowerCase()) ||
          getTeacherName(course.teacherId).toLowerCase().includes(filterForm.courseName.toLowerCase())
        )
      }

      return filtered
    })

    // 可用的教师列表（用于筛选）
    const availableTeachers = computed(() => {
      const teacherSet = new Set()
      const teachers = []
      
      courseList.value.forEach(course => {
        if (course.teacherId && !teacherSet.has(course.teacherId)) {
          teacherSet.add(course.teacherId)
          teachers.push({
            id: course.teacherId,
            name: getTeacherName(course.teacherId)
          })
        }
      })
      
      return teachers.sort((a, b) => a.name.localeCompare(b.name))
    })

    // 解析时间字符串，提取星期和时间段
    const parseTimeString = (timeString) => {
      if (!timeString) return { day: null, timeSlot: null }
      
      // 解析如 "周一第1-2节" 的格式
      const dayMatch = timeString.match(/(周[一二三四五六日])/)
      const timeMatch = timeString.match(/第(\d+)-(\d+)节/)
      
      if (dayMatch && timeMatch) {
        const dayMap = {
          '周一': 'monday',
          '周二': 'tuesday',
          '周三': 'wednesday',
          '周四': 'thursday',
          '周五': 'friday',
          '周六': 'saturday',
          '周日': 'sunday'
        }
        
        const day = dayMap[dayMatch[1]]
        const startSlot = parseInt(timeMatch[1])
        const endSlot = parseInt(timeMatch[2])
        
        // 根据开始节次确定时间段ID
        let timeSlot = null
        if (startSlot <= 2) timeSlot = 1
        else if (startSlot <= 4) timeSlot = 2
        else if (startSlot <= 6) timeSlot = 3
        else if (startSlot <= 8) timeSlot = 4
        else if (startSlot <= 10) timeSlot = 5
        
        return { day, timeSlot }
      }
      
      return { day: null, timeSlot: null }
    }

    // 根据日期和时间段获取课程
    const getCoursesByDayAndTime = (day, timeSlot) => {
      // 使用筛选后的课程列表
      return filteredCourseList.value.filter(course => {
        const { day: courseDay, timeSlot: courseTimeSlot } = parseTimeString(course.time)
        return courseDay === day && courseTimeSlot === timeSlot
      })
    }

    // 获取教师姓名
    const getTeacherName = (teacherId) => {
      // 如果是当前用户，直接返回用户姓名
      if (teacherId === userStore.userInfo.id) {
        return userStore.userInfo.name || '当前用户'
      }
      
      // 教师映射表 - 与课程列表页面保持一致
      const teacherMap = {
        '512351': 'asd',
        '141414': 'teacher'
      }
      
      // 优先从映射表获取，如果没有则返回ID
      return teacherMap[teacherId] || teacherId || '未知教师'
    }

    // 加载课程数据
    const loadCourseData = async () => {
      try {
        loading.value = true
        
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
          courseList.value = response.data.map(courseUtils.transformCourseData)
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

    // 筛选
    const handleFilter = () => {
      // 筛选逻辑已经在计算属性中处理，这里只是提示
      const totalCount = courseList.value.length
      const filteredCount = filteredCourseList.value.length
      
      if ((!userStore.isTeacher && filterForm.teacherId) || filterForm.courseName) {
        ElMessage.success(`筛选完成，共找到 ${filteredCount} 门课程（总共 ${totalCount} 门）`)
      } else {
        ElMessage.info('已显示所有课程')
      }
    }

    // 重置筛选
    const resetFilter = () => {
      Object.assign(filterForm, {
        teacherId: '',
        courseName: ''
      })
    }

    // 视图切换
    const handleViewChange = (mode) => {
      viewMode.value = mode
    }

    // 周次导航
    const previousWeek = () => {
      if (currentWeek.value > 1) {
        currentWeek.value--
      }
    }

    const nextWeek = () => {
      if (currentWeek.value < 20) {
        currentWeek.value++
      }
    }

    // 日期导航
    const previousDay = () => {
      const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      const currentIndex = dayOrder.indexOf(currentDay.value)
      if (currentIndex > 0) {
        currentDay.value = dayOrder[currentIndex - 1]
      }
    }

    const nextDay = () => {
      const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      const currentIndex = dayOrder.indexOf(currentDay.value)
      if (currentIndex < dayOrder.length - 1) {
        currentDay.value = dayOrder[currentIndex + 1]
      }
    }

    // 添加课程
    const addCourse = (day, timeSlot) => {
      ElMessage.info('添加课程功能开发中...')
    }

    // 查看课程详情
    const viewCourseDetail = (course) => {
      selectedCourse.value = course
      courseDetailVisible.value = true
    }

    // 导出课表
    const exportSchedule = () => {
      ElMessage.success('课表导出功能开发中...')
    }

    // 打印课表
    const printSchedule = () => {
      ElMessage.success('课表打印功能开发中...')
    }

    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return '未知'
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('zh-CN')
      } catch (error) {
        return dateString
      }
    }

    onMounted(() => {
      // 初始化用户信息
      userStore.initUserInfo()
      // 加载课程数据
      loadCourseData()
    })

    return {
      userStore,
      viewMode,
      currentWeek,
      currentDay,
      filterForm,
      weekDays,
      timeSlots,
      courseList,
      filteredCourseList,
      courseDetailVisible,
      selectedCourse,
      loading,
      currentWeekText,
      currentDayText,
      getCoursesByDayAndTime,
      handleFilter,
      resetFilter,
      handleViewChange,
      previousWeek,
      nextWeek,
      previousDay,
      nextDay,
      addCourse,
      viewCourseDetail,
      exportSchedule,
      printSchedule,
      getTeacherName,
      formatDate,
      availableTeachers
    }
  }
}
</script>

<style scoped>
.course-schedule {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.filter-section {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.filter-stats {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.view-toggle {
  margin-bottom: 20px;
  text-align: center;
}

.weekly-view,
.daily-view {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.schedule-header,
.daily-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #ebeef5;
}

.schedule-header h3,
.daily-header h3 {
  margin: 0;
  color: #303133;
}

.schedule-table {
  overflow-x: auto;
}

.schedule-table table {
  width: 100%;
  border-collapse: collapse;
}

.schedule-table th,
.schedule-table td {
  border: 1px solid #ebeef5;
  padding: 10px;
  text-align: center;
  vertical-align: top;
}

.time-column {
  width: 100px;
  background: #f5f7fa;
}

.day-column {
  width: 140px;
  background: #f5f7fa;
}

.time-slot {
  background: #f5f7fa;
}

.time-label {
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.time-range {
  font-size: 12px;
  color: #909399;
}

.schedule-cell {
  min-height: 80px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.schedule-cell:hover {
  background-color: #f0f9ff;
}

.course-item {
  margin-bottom: 5px;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  background-color: #ecf5ff;
  border-left: 3px solid #409eff;
}

.course-name {
  font-weight: bold;
  color: #303133;
  margin-bottom: 3px;
}

.course-location {
  color: #606266;
  margin-bottom: 2px;
}

.course-teacher {
  color: #909399;
  font-size: 11px;
}

.daily-schedule {
  padding: 20px;
}

.daily-time-slot {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 20px;
}

.time-info {
  width: 120px;
  text-align: center;
  padding-right: 20px;
}

.course-list {
  flex: 1;
}

.course-card {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: box-shadow 0.3s;
  border-left: 4px solid #409eff;
}

.course-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.course-name {
  font-weight: bold;
  color: #303133;
}

.course-details {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.detail-item {
  display: flex;
  align-items: center;
  color: #606266;
  font-size: 14px;
}

.detail-item .el-icon {
  margin-right: 8px;
  color: #909399;
}

.list-view {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.course-detail {
  padding: 20px 0;
}
</style> 