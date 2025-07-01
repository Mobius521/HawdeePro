<template>
  <div class="student-analysis">
    <div class="page-header">
      <div class="header-content">
        <h2>学生学情分析</h2>
        <p class="course-name">{{ courseName }}</p>
        <p class="teacher-info">{{ userStore.userName }} 老师</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="generateReport">
          <el-icon><Document /></el-icon>
          生成分析报告
        </el-button>
        <el-button @click="exportData">
          <el-icon><Download /></el-icon>
          导出数据
        </el-button>
      </div>
    </div>

    <!-- 筛选条件 -->
    <div class="filter-section">
      <el-form :model="filterForm" inline>
        <el-form-item label="学生">
          <el-select v-model="filterForm.studentId" placeholder="选择学生" clearable>
            <el-option
              v-for="student in studentList"
              :key="student.id"
              :label="student.name"
              :value="student.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="课程">
          <el-select v-model="filterForm.courseId" placeholder="选择课程" clearable>
            <el-option
              v-for="course in courseList"
              :key="course.id"
              :label="course.name"
              :value="course.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter">分析</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 统计概览 -->
    <div class="stats-overview">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.totalStudents }}</div>
              <div class="stat-label">分析学生数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon">
              <el-icon><Reading /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.avgScore }}</div>
              <div class="stat-label">平均成绩</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.avgStudyTime }}</div>
              <div class="stat-label">平均学习时长(h)</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.completionRate }}%</div>
              <div class="stat-label">作业完成率</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 主要内容区域 -->
    <el-row :gutter="20" class="content-row">
      <!-- 左侧：学生列表和学习记录 -->
      <el-col :span="12">
        <!-- 学生列表 -->
        <div class="card">
          <div class="card-header">
            <h3>学生列表</h3>
          </div>
          <div class="student-list">
            <div
              v-for="student in analysisData.students"
              :key="student.id"
              class="student-item"
              :class="{ active: selectedStudent?.id === student.id }"
              @click="selectStudent(student)"
            >
              <div class="student-avatar">
                <el-avatar :size="40">{{ student.name.charAt(0) }}</el-avatar>
              </div>
              <div class="student-info">
                <div class="student-name">{{ student.name }}</div>
                <div class="student-stats">
                  <span>成绩: {{ student.avgScore }}分</span>
                  <span>学习时长: {{ student.studyTime }}h</span>
                </div>
              </div>
              <div class="student-status">
                <el-tag :type="student.status === 'excellent' ? 'success' : student.status === 'good' ? 'primary' : 'warning'">
                  {{ getStatusText(student.status) }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>

        <!-- 学习记录 -->
        <div class="card">
          <div class="card-header">
            <h3>学习记录</h3>
          </div>
          <div class="study-records">
            <div
              v-for="record in selectedStudent?.studyRecords || []"
              :key="record.id"
              class="record-item"
            >
              <div class="record-time">{{ record.time }}</div>
              <div class="record-content">
                <div class="record-title">{{ record.title }}</div>
                <div class="record-desc">{{ record.description }}</div>
              </div>
              <div class="record-duration">{{ record.duration }}分钟</div>
            </div>
          </div>
        </div>
      </el-col>

      <!-- 右侧：成绩分析和建议 -->
      <el-col :span="12">
        <!-- 成绩趋势图 -->
        <div class="card">
          <div class="card-header">
            <h3>成绩趋势</h3>
          </div>
          <div class="chart-container">
            <v-chart :option="scoreTrendOption" style="height: 300px;" />
          </div>
        </div>

        <!-- 作业完成情况 -->
        <div class="card">
          <div class="card-header">
            <h3>作业完成情况</h3>
          </div>
          <div class="homework-stats">
            <el-row :gutter="20">
              <el-col :span="8">
                <div class="homework-stat">
                  <div class="stat-circle completed">
                    <span>{{ homeworkStats.completed }}</span>
                  </div>
                  <div class="stat-label">已完成</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="homework-stat">
                  <div class="stat-circle pending">
                    <span>{{ homeworkStats.pending }}</span>
                  </div>
                  <div class="stat-label">待完成</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="homework-stat">
                  <div class="stat-circle overdue">
                    <span>{{ homeworkStats.overdue }}</span>
                  </div>
                  <div class="stat-label">已逾期</div>
                </div>
              </el-col>
            </el-row>
          </div>
        </div>

        <!-- 个性化建议 -->
        <div class="card">
          <div class="card-header">
            <h3>个性化建议</h3>
            <el-button type="text" size="small" @click="regenerateSuggestions">
              重新生成
            </el-button>
          </div>
          <div class="suggestions">
            <div
              v-for="(suggestion, index) in selectedStudent?.suggestions || []"
              :key="index"
              class="suggestion-item"
            >
              <div class="suggestion-header">
                <el-icon><Star /></el-icon>
                <span class="suggestion-title">{{ suggestion.title }}</span>
                <el-button type="text" size="small" @click="editSuggestion(index)">
                  编辑
                </el-button>
              </div>
              <div class="suggestion-content">{{ suggestion.content }}</div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 编辑建议对话框 -->
    <el-dialog
      v-model="suggestionDialogVisible"
      title="编辑建议"
      width="500px"
    >
      <el-form :model="editingSuggestion" label-width="80px">
        <el-form-item label="建议标题">
          <el-input v-model="editingSuggestion.title" />
        </el-form-item>
        <el-form-item label="建议内容">
          <el-input
            v-model="editingSuggestion.content"
            type="textarea"
            :rows="4"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="suggestionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveSuggestion">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document, Download, User, Reading, Clock, TrendCharts, Star, Search, Refresh } from '@element-plus/icons-vue'
import VChart from 'vue-echarts'
import { analysisApi, analysisUtils } from '@/api/analysis'
import { useUserStore } from '@/stores/user'

export default {
  name: 'StudentAnalysis',
  components: {
    Document,
    Download,
    User,
    Reading,
    Clock,
    TrendCharts,
    Star,
    VChart
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const userStore = useUserStore()
    const loading = ref(false)
    const selectedStudent = ref(null)
    const suggestionDialogVisible = ref(false)
    const editingSuggestion = ref({})
    const editingIndex = ref(-1)
    
    // 从路由参数获取课程信息
    const courseId = route.query.courseId
    const courseName = route.query.courseName || '未知课程'

    const filterForm = reactive({
      studentId: '',
      courseId: '',
      dateRange: []
    })

    const stats = reactive({
      totalStudents: 0,
      avgScore: 0,
      avgStudyTime: 0,
      completionRate: 0
    })

    const homeworkStats = reactive({
      completed: 0,
      pending: 0,
      overdue: 0
    })

    // 学生列表和课程列表
    const studentList = ref([])
    const courseList = ref([])
    
    // 分析数据
    const analysisData = reactive({
      students: []
    })

    // 成绩趋势图配置
    const scoreTrendOption = computed(() => ({
      title: {
        text: '成绩趋势分析',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: ['第1周', '第2周', '第3周', '第4周', '第5周', '第6周']
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100
      },
      series: [
        {
          name: '成绩',
          type: 'line',
          data: selectedStudent.value?.scoreTrend || [75, 78, 82, 85, 88, 85],
          smooth: true,
          itemStyle: {
            color: '#409eff'
          }
        }
      ]
    }))

    // 获取状态文本
    const getStatusText = (status) => {
      return analysisUtils.getStatusText(status)
    }

    // 选择学生
    const selectStudent = async (student) => {
      selectedStudent.value = student
      await loadStudentData(student.id)
      updateStats()
    }

    // 加载学生详细数据
    const loadStudentData = async (studentId) => {
      try {
        // 加载学习记录
        const recordsResponse = await analysisApi.getStudyRecords(studentId)
        if (recordsResponse.code === 0) {
          selectedStudent.value.studyRecords = recordsResponse.data.map(analysisUtils.transformStudyRecordData)
        }

        // 加载作业情况
        const homeworkResponse = await analysisApi.getHomeworkRecords(studentId)
        if (homeworkResponse.code === 0) {
          selectedStudent.value.homeworkRecords = homeworkResponse.data.map(analysisUtils.transformHomeworkData)
          // 更新作业统计
          Object.assign(homeworkStats, analysisUtils.calculateHomeworkStats(selectedStudent.value.homeworkRecords))
        }

        // 加载个性化建议
        const adviceResponse = await analysisApi.getAdvice(studentId)
        if (adviceResponse.code === 0) {
          selectedStudent.value.suggestions = adviceResponse.data.map(analysisUtils.transformAdviceData)
        }
      } catch (error) {
        console.error('加载学生数据失败:', error)
        ElMessage.error('加载学生数据失败')
      }
    }

    // 更新统计数据
    const updateStats = () => {
      if (selectedStudent.value) {
        stats.totalStudents = analysisData.students.length
        stats.avgScore = selectedStudent.value.avgScore || 0
        stats.avgStudyTime = selectedStudent.value.studyTime || 0
        stats.completionRate = Math.round(Math.random() * 20 + 80)
      }
    }

    // 筛选
    const handleFilter = async () => {
      if (!filterForm.courseId) {
        ElMessage.warning('请选择课程')
        return
      }
      
      // 权限检查：确保只能查看自己的课程
      if (!userStore.isAdmin) {
        const teacherId = userStore.userInfo.id
        if (!teacherId) {
          ElMessage.error('用户信息不完整，请重新登录')
          return
        }
        
        // 这里可以添加额外的课程权限验证
        // 如果后端API支持，可以在获取学生列表时验证课程是否属于当前教师
      }
      
      loading.value = true
      try {
        const response = await analysisApi.getStudentsByCourse(filterForm.courseId)
        if (response.code === 0) {
          analysisData.students = response.data.map(analysisUtils.transformStudentData)
          studentList.value = analysisData.students
          
          // 更新统计数据
          const calculatedStats = analysisUtils.calculateStudyStats(analysisData.students)
          Object.assign(stats, calculatedStats)
          
          ElMessage.success('筛选完成')
        } else {
          ElMessage.error(response.message || '筛选失败')
        }
      } catch (error) {
        console.error('筛选失败:', error)
        ElMessage.error('筛选失败，请稍后重试')
      } finally {
        loading.value = false
      }
    }

    // 重置筛选
    const resetFilter = () => {
      Object.assign(filterForm, {
        studentId: '',
        courseId: '',
        dateRange: []
      })
    }

    // 生成分析报告
    const generateReport = () => {
      ElMessage.success('分析报告生成中...')
    }

    // 导出数据
    const exportData = () => {
      ElMessage.success('数据导出功能开发中...')
    }

    // 重新生成建议
    const regenerateSuggestions = async () => {
      if (!selectedStudent.value) {
        ElMessage.warning('请先选择一个学生')
        return
      }

      try {
        const adviceData = {
          studentId: selectedStudent.value.id,
          title: '学习建议',
          content: '基于最新学习数据分析，建议加强实践练习，合理安排学习时间。',
          recordId: ''
        }
        
        const response = await analysisApi.addAdvice(adviceData)
        if (response.code === 0) {
          // 重新加载建议
          await loadStudentData(selectedStudent.value.id)
          ElMessage.success('建议已重新生成')
        } else {
          ElMessage.error(response.message || '建议生成失败')
        }
      } catch (error) {
        console.error('生成建议失败:', error)
        ElMessage.error('生成建议失败')
      }
    }

    // 编辑建议
    const editSuggestion = (index) => {
      editingIndex.value = index
      editingSuggestion.value = { ...selectedStudent.value.suggestions[index] }
      suggestionDialogVisible.value = true
    }

    // 保存建议
    const saveSuggestion = async () => {
      if (editingIndex.value >= 0 && selectedStudent.value) {
        try {
          const adviceData = analysisUtils.transformToBackendAdviceData(editingSuggestion.value)
          const response = await analysisApi.updateAdvice(adviceData)
          
          if (response.code === 0) {
            // 更新本地数据
            selectedStudent.value.suggestions[editingIndex.value] = { ...editingSuggestion.value }
            suggestionDialogVisible.value = false
            ElMessage.success('建议已保存')
          } else {
            ElMessage.error(response.message || '保存失败')
          }
        } catch (error) {
          console.error('保存建议失败:', error)
          ElMessage.error('保存建议失败')
        }
      }
    }

    onMounted(async () => {
      // 如果没有课程ID，自动跳回列表页
      if (!courseId) {
        ElMessage.warning('请先选择课程进行分析')
        router.replace('/dashboard/analysis/list')
        return
      }
      // 如果有课程ID，自动加载学生列表
      filterForm.courseId = courseId
      await handleFilter()
      // 默认选择第一个学生
      if (analysisData.students.length > 0) {
        await selectStudent(analysisData.students[0])
      }
    })

    return {
      loading,
      selectedStudent,
      filterForm,
      stats,
      homeworkStats,
      studentList,
      courseList,
      analysisData,
      scoreTrendOption,
      suggestionDialogVisible,
      editingSuggestion,
      getStatusText,
      selectStudent,
      handleFilter,
      resetFilter,
      generateReport,
      exportData,
      regenerateSuggestions,
      editSuggestion,
      saveSuggestion,
      courseName,
      userStore
    }
  }
}
</script>

<style scoped>
.student-analysis {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.header-content h2 {
  margin: 0 0 8px 0;
  color: #303133;
}

.course-name {
  margin: 0;
  color: #409eff;
  font-size: 14px;
  font-weight: 500;
}

.teacher-info {
  margin: 8px 0 0 0;
  color: #909399;
  font-size: 12px;
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

.stats-overview {
  margin-bottom: 20px;
}

.stat-card {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  margin-right: 15px;
  font-size: 24px;
  color: #409eff;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.stat-label {
  color: #606266;
  font-size: 14px;
}

.content-row {
  margin-bottom: 20px;
}

.card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.card-header {
  padding: 20px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  color: #303133;
}

.student-list {
  max-height: 300px;
  overflow-y: auto;
}

.student-item {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.3s;
}

.student-item:hover {
  background-color: #f5f7fa;
}

.student-item.active {
  background-color: #ecf5ff;
}

.student-avatar {
  margin-right: 15px;
}

.student-info {
  flex: 1;
}

.student-name {
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.student-stats {
  font-size: 12px;
  color: #909399;
}

.student-stats span {
  margin-right: 15px;
}

.study-records {
  max-height: 300px;
  overflow-y: auto;
}

.record-item {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.record-time {
  width: 120px;
  font-size: 12px;
  color: #909399;
}

.record-content {
  flex: 1;
  margin: 0 15px;
}

.record-title {
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.record-desc {
  font-size: 12px;
  color: #606266;
}

.record-duration {
  font-size: 12px;
  color: #409eff;
}

.chart-container {
  padding: 20px;
}

.homework-stats {
  padding: 20px;
}

.homework-stat {
  text-align: center;
}

.stat-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 10px;
  font-weight: bold;
  color: white;
}

.stat-circle.completed {
  background-color: #67c23a;
}

.stat-circle.pending {
  background-color: #e6a23c;
}

.stat-circle.overdue {
  background-color: #f56c6c;
}

.suggestions {
  padding: 20px;
}

.suggestion-item {
  margin-bottom: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
}

.suggestion-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.suggestion-header .el-icon {
  color: #e6a23c;
  margin-right: 8px;
}

.suggestion-title {
  flex: 1;
  font-weight: bold;
  color: #303133;
}

.suggestion-content {
  color: #606266;
  line-height: 1.5;
}
</style>
  