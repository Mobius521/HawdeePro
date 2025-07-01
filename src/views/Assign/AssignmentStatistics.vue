<template>
  <div class="assignment-statistics">
    <div class="page-header">
      <h2>作业统计</h2>
      <div class="header-actions">
        <el-button type="primary" @click="exportStatistics">
          <el-icon><Download /></el-icon>
          导出统计
        </el-button>
        <el-button @click="refreshData">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
      </div>
    </div>

    <!-- 筛选条件 -->
    <div class="filter-section">
      <el-form :model="filterForm" inline>
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
        <el-form-item label="作业状态">
          <el-select v-model="filterForm.status" placeholder="选择状态" clearable>
            <el-option label="全部" value="" />
            <el-option label="已发布" value="published" />
            <el-option label="进行中" value="ongoing" />
            <el-option label="已截止" value="closed" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter">筛选</el-button>
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
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.totalAssignments }}</div>
              <div class="stat-label">总作业数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.totalStudents }}</div>
              <div class="stat-label">参与学生</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon">
              <el-icon><Check /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.completionRate }}%</div>
              <div class="stat-label">完成率</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon">
              <el-icon><Star /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.avgScore }}</div>
              <div class="stat-label">平均分</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 主要内容区域 -->
    <el-row :gutter="20" class="content-row">
      <!-- 左侧：作业列表 -->
      <el-col :span="12">
        <div class="card">
          <div class="card-header">
            <h3>作业列表</h3>
          </div>
          <div class="assignment-list">
            <div
              v-for="assignment in assignmentList"
              :key="assignment.id"
              class="assignment-item"
              :class="{ active: selectedAssignment?.id === assignment.id }"
              @click="selectAssignment(assignment)"
            >
              <div class="assignment-header">
                <div class="assignment-title">{{ assignment.title }}</div>
                <el-tag :type="getStatusColor(assignment.status)" size="small">
                  {{ getStatusText(assignment.status) }}
                </el-tag>
              </div>
              <div class="assignment-info">
                <span>课程: {{ assignment.courseName }}</span>
                <span>截止时间: {{ assignment.deadline }}</span>
              </div>
              <div class="assignment-stats">
                <span>提交: {{ assignment.submittedCount }}/{{ assignment.totalCount }}</span>
                <span>平均分: {{ assignment.avgScore }}分</span>
              </div>
            </div>
          </div>
        </div>
      </el-col>

      <!-- 右侧：详细统计 -->
      <el-col :span="12">
        <!-- 成绩分布图 -->
        <div class="card">
          <div class="card-header">
            <h3>成绩分布</h3>
          </div>
          <div class="chart-container">
            <v-chart :option="scoreDistributionOption" style="height: 300px;" />
          </div>
        </div>

        <!-- 提交趋势图 -->
        <div class="card">
          <div class="card-header">
            <h3>提交趋势</h3>
          </div>
          <div class="chart-container">
            <v-chart :option="submissionTrendOption" style="height: 300px;" />
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 作业详情表格 -->
    <div class="card">
      <div class="card-header">
        <h3>作业详情</h3>
      </div>
      <div class="assignment-detail-table">
        <el-table :data="assignmentDetails" stripe style="width: 100%">
          <el-table-column prop="studentName" label="学生姓名" width="120" />
          <el-table-column prop="studentId" label="学号" width="120" />
          <el-table-column prop="submitTime" label="提交时间" width="180" />
          <el-table-column prop="score" label="得分" width="100">
            <template #default="{ row }">
              <span :class="getScoreClass(row.score)">{{ row.score }}分</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getSubmissionStatusColor(row.status)">
                {{ getSubmissionStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="feedback" label="评语" min-width="200" />
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-button type="text" size="small" @click="viewSubmission(row)">
                查看详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 提交详情对话框 -->
    <el-dialog
      v-model="submissionDialogVisible"
      title="提交详情"
      width="600px"
    >
      <div v-if="selectedSubmission" class="submission-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="学生姓名">{{ selectedSubmission.studentName }}</el-descriptions-item>
          <el-descriptions-item label="学号">{{ selectedSubmission.studentId }}</el-descriptions-item>
          <el-descriptions-item label="提交时间">{{ selectedSubmission.submitTime }}</el-descriptions-item>
          <el-descriptions-item label="得分">{{ selectedSubmission.score }}分</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getSubmissionStatusColor(selectedSubmission.status)">
              {{ getSubmissionStatusText(selectedSubmission.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="评语" :span="2">{{ selectedSubmission.feedback }}</el-descriptions-item>
        </el-descriptions>
        
        <div class="submission-content">
          <h4>提交内容</h4>
          <div class="content-preview">
            <pre>{{ selectedSubmission.content }}</pre>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, Refresh, Document, User, Check, Star } from '@element-plus/icons-vue'
import VChart from 'vue-echarts'

export default {
  name: 'AssignmentStatistics',
  components: {
    Download,
    Refresh,
    Document,
    User,
    Check,
    Star,
    VChart
  },
  setup() {
    const loading = ref(false)
    const selectedAssignment = ref(null)
    const submissionDialogVisible = ref(false)
    const selectedSubmission = ref(null)

    const filterForm = reactive({
      courseId: '',
      dateRange: [],
      status: ''
    })

    const stats = reactive({
      totalAssignments: 0,
      totalStudents: 0,
      completionRate: 0,
      avgScore: 0
    })

    // 模拟数据
    const courseList = ref([
      { id: 1, name: 'Vue.js基础教程' },
      { id: 2, name: 'JavaScript进阶' },
      { id: 3, name: '数据结构与算法' }
    ])

    const assignmentList = ref([
      {
        id: 1,
        title: 'Vue.js组件开发作业',
        courseName: 'Vue.js基础教程',
        status: 'closed',
        deadline: '2024-01-15 23:59',
        submittedCount: 25,
        totalCount: 30,
        avgScore: 85
      },
      {
        id: 2,
        title: 'JavaScript异步编程练习',
        courseName: 'JavaScript进阶',
        status: 'ongoing',
        deadline: '2024-01-20 23:59',
        submittedCount: 18,
        totalCount: 30,
        avgScore: 78
      }
    ])

    const assignmentDetails = ref([
      {
        id: 1,
        studentName: '张三',
        studentId: '2021001',
        submitTime: '2024-01-15 20:30:25',
        score: 90,
        status: 'submitted',
        feedback: '代码结构清晰，功能实现完整',
        content: '// Vue组件代码\n<template>\n  <div class="component">\n    <h1>{{ title }}</h1>\n  </div>\n</template>'
      },
      {
        id: 2,
        studentName: '李四',
        studentId: '2021002',
        submitTime: '2024-01-15 22:15:10',
        score: 85,
        status: 'submitted',
        feedback: '基本功能实现，可以进一步优化',
        content: '// 作业代码内容...'
      }
    ])

    // 成绩分布图配置
    const scoreDistributionOption = computed(() => ({
      title: {
        text: '成绩分布统计',
        left: 'center'
      },
      tooltip: {
        trigger: 'item'
      },
      series: [
        {
          name: '成绩分布',
          type: 'pie',
          radius: '50%',
          data: [
            { value: 8, name: '90-100分' },
            { value: 12, name: '80-89分' },
            { value: 15, name: '70-79分' },
            { value: 10, name: '60-69分' },
            { value: 5, name: '60分以下' }
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    }))

    // 提交趋势图配置
    const submissionTrendOption = computed(() => ({
      title: {
        text: '提交趋势',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: ['第1天', '第2天', '第3天', '第4天', '第5天', '第6天', '第7天']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '提交人数',
          type: 'line',
          data: [5, 8, 12, 15, 18, 22, 25],
          smooth: true,
          itemStyle: {
            color: '#409eff'
          }
        }
      ]
    }))

    // 获取状态颜色
    const getStatusColor = (status) => {
      const colorMap = {
        published: 'info',
        ongoing: 'warning',
        closed: 'success'
      }
      return colorMap[status] || 'info'
    }

    // 获取状态文本
    const getStatusText = (status) => {
      const textMap = {
        published: '已发布',
        ongoing: '进行中',
        closed: '已截止'
      }
      return textMap[status] || '未知'
    }

    // 获取提交状态颜色
    const getSubmissionStatusColor = (status) => {
      const colorMap = {
        submitted: 'success',
        late: 'warning',
        not_submitted: 'danger'
      }
      return colorMap[status] || 'info'
    }

    // 获取提交状态文本
    const getSubmissionStatusText = (status) => {
      const textMap = {
        submitted: '已提交',
        late: '逾期提交',
        not_submitted: '未提交'
      }
      return textMap[status] || '未知'
    }

    // 获取分数样式
    const getScoreClass = (score) => {
      if (score >= 90) return 'score-excellent'
      if (score >= 80) return 'score-good'
      if (score >= 70) return 'score-average'
      if (score >= 60) return 'score-pass'
      return 'score-fail'
    }

    // 选择作业
    const selectAssignment = (assignment) => {
      selectedAssignment.value = assignment
      updateStats()
    }

    // 更新统计数据
    const updateStats = () => {
      stats.totalAssignments = assignmentList.value.length
      stats.totalStudents = 30
      stats.completionRate = Math.round((25 / 30) * 100)
      stats.avgScore = 82
    }

    // 筛选
    const handleFilter = () => {
      ElMessage.success('筛选完成')
    }

    // 重置筛选
    const resetFilter = () => {
      Object.assign(filterForm, {
        courseId: '',
        dateRange: [],
        status: ''
      })
    }

    // 导出统计
    const exportStatistics = () => {
      ElMessage.success('统计导出功能开发中...')
    }

    // 刷新数据
    const refreshData = () => {
      ElMessage.success('数据已刷新')
    }

    // 查看提交详情
    const viewSubmission = (submission) => {
      selectedSubmission.value = submission
      submissionDialogVisible.value = true
    }

    onMounted(() => {
      // 默认选择第一个作业
      if (assignmentList.value.length > 0) {
        selectAssignment(assignmentList.value[0])
      }
    })

    return {
      loading,
      selectedAssignment,
      filterForm,
      stats,
      courseList,
      assignmentList,
      assignmentDetails,
      submissionDialogVisible,
      selectedSubmission,
      scoreDistributionOption,
      submissionTrendOption,
      getStatusColor,
      getStatusText,
      getSubmissionStatusColor,
      getSubmissionStatusText,
      getScoreClass,
      selectAssignment,
      handleFilter,
      resetFilter,
      exportStatistics,
      refreshData,
      viewSubmission
    }
  }
}
</script>

<style scoped>
.assignment-statistics {
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
}

.card-header h3 {
  margin: 0;
  color: #303133;
}

.assignment-list {
  max-height: 400px;
  overflow-y: auto;
}

.assignment-item {
  padding: 15px 20px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.3s;
}

.assignment-item:hover {
  background-color: #f5f7fa;
}

.assignment-item.active {
  background-color: #ecf5ff;
}

.assignment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.assignment-title {
  font-weight: bold;
  color: #303133;
}

.assignment-info {
  display: flex;
  gap: 20px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;
}

.assignment-stats {
  display: flex;
  gap: 20px;
  font-size: 12px;
  color: #909399;
}

.chart-container {
  padding: 20px;
}

.assignment-detail-table {
  padding: 20px;
}

.score-excellent {
  color: #67c23a;
  font-weight: bold;
}

.score-good {
  color: #409eff;
  font-weight: bold;
}

.score-average {
  color: #e6a23c;
  font-weight: bold;
}

.score-pass {
  color: #f56c6c;
  font-weight: bold;
}

.score-fail {
  color: #f56c6c;
  font-weight: bold;
}

.submission-detail {
  padding: 20px 0;
}

.submission-content {
  margin-top: 20px;
}

.submission-content h4 {
  margin-bottom: 10px;
  color: #303133;
}

.content-preview {
  background: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
}

.content-preview pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #606266;
}
</style>
  
