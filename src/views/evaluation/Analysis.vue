<template>
  <div class="student-analysis">
    <div class="page-header">
      <h2>学生学情分析</h2>
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
import { ElMessage } from 'element-plus'
import { Document, Download, User, Reading, Clock, TrendCharts, Star } from '@element-plus/icons-vue'
import VChart from 'vue-echarts'

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
    const loading = ref(false)
    const selectedStudent = ref(null)
    const suggestionDialogVisible = ref(false)
    const editingSuggestion = ref({})
    const editingIndex = ref(-1)

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

    // 模拟数据
    const studentList = ref([
      { id: 1, name: '张三', avgScore: 85, studyTime: 120, status: 'excellent' },
      { id: 2, name: '李四', avgScore: 78, studyTime: 95, status: 'good' },
      { id: 3, name: '王五', avgScore: 65, studyTime: 60, status: 'warning' }
    ])

    const courseList = ref([
      { id: 1, name: 'Vue.js基础教程' },
      { id: 2, name: 'JavaScript进阶' },
      { id: 3, name: '数据结构与算法' }
    ])

    const analysisData = reactive({
      students: [
        {
          id: 1,
          name: '张三',
          avgScore: 85,
          studyTime: 120,
          status: 'excellent',
          studyRecords: [
            { id: 1, time: '2024-01-15 10:00', title: 'Vue.js基础学习', description: '学习了Vue.js的基本语法和组件', duration: 45 },
            { id: 2, time: '2024-01-15 14:30', title: '作业完成', description: '完成了Vue.js基础作业', duration: 30 }
          ],
          suggestions: [
            { title: '学习建议', content: '建议继续深入学习Vue.js的高级特性，如Vuex状态管理' },
            { title: '练习建议', content: '可以尝试开发一个完整的Vue.js项目来巩固所学知识' }
          ]
        },
        {
          id: 2,
          name: '李四',
          avgScore: 78,
          studyTime: 95,
          status: 'good',
          studyRecords: [
            { id: 3, time: '2024-01-15 09:00', title: 'JavaScript复习', description: '复习了JavaScript的基础知识', duration: 60 }
          ],
          suggestions: [
            { title: '学习建议', content: '建议加强JavaScript基础知识的掌握，特别是异步编程部分' }
          ]
        }
      ]
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
      const statusMap = {
        excellent: '优秀',
        good: '良好',
        warning: '需改进'
      }
      return statusMap[status] || '未知'
    }

    // 选择学生
    const selectStudent = (student) => {
      selectedStudent.value = student
      updateStats()
    }

    // 更新统计数据
    const updateStats = () => {
      if (selectedStudent.value) {
        stats.totalStudents = analysisData.students.length
        stats.avgScore = selectedStudent.value.avgScore
        stats.avgStudyTime = selectedStudent.value.studyTime
        stats.completionRate = Math.round(Math.random() * 20 + 80)

        homeworkStats.completed = Math.floor(Math.random() * 10 + 15)
        homeworkStats.pending = Math.floor(Math.random() * 5 + 3)
        homeworkStats.overdue = Math.floor(Math.random() * 3)
      }
    }

    // 筛选
    const handleFilter = () => {
      // 实现筛选逻辑
      ElMessage.success('筛选完成')
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
    const regenerateSuggestions = () => {
      if (selectedStudent.value) {
        // 模拟重新生成建议
        selectedStudent.value.suggestions = [
          { title: '学习建议', content: '基于最新学习数据分析，建议加强实践练习' },
          { title: '时间管理', content: '建议合理安排学习时间，保持每天2-3小时的学习' }
        ]
        ElMessage.success('建议已重新生成')
      }
    }

    // 编辑建议
    const editSuggestion = (index) => {
      editingIndex.value = index
      editingSuggestion.value = { ...selectedStudent.value.suggestions[index] }
      suggestionDialogVisible.value = true
    }

    // 保存建议
    const saveSuggestion = () => {
      if (editingIndex.value >= 0 && selectedStudent.value) {
        selectedStudent.value.suggestions[editingIndex.value] = { ...editingSuggestion.value }
        suggestionDialogVisible.value = false
        ElMessage.success('建议已保存')
      }
    }

    onMounted(() => {
      // 默认选择第一个学生
      if (analysisData.students.length > 0) {
        selectStudent(analysisData.students[0])
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
      saveSuggestion
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
  