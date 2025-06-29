<template>
  <div class="homework-grading">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1>作业批改</h1>
        <p>批改学生作业，评分并提供反馈意见</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" size="large" @click="batchGrade">
          <el-icon><Edit /></el-icon>
          批量批改
        </el-button>
        <el-button type="success" size="large" @click="autoGrade">
          <el-icon><MagicStick /></el-icon>
          自动批改
        </el-button>
        <el-button type="warning" size="large" @click="exportGrades">
          <el-icon><Download /></el-icon>
          导出成绩
        </el-button>
      </div>
    </div>

    <!-- 批改统计 -->
    <div class="grading-stats">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon total">
                <el-icon><Document /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-number">{{ gradingStats.total }}</div>
                <div class="stats-label">总提交数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon graded">
                <el-icon><Check /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-number">{{ gradingStats.graded }}</div>
                <div class="stats-label">已批改</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon pending">
                <el-icon><Clock /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-number">{{ gradingStats.pending }}</div>
                <div class="stats-label">待批改</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon average">
                <el-icon><TrendCharts /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-number">{{ gradingStats.averageScore }}</div>
                <div class="stats-label">平均分</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 作业选择和筛选 -->
    <el-card class="filter-card">
      <div class="filter-section">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-select v-model="selectedHomework" placeholder="选择要批改的作业" @change="loadSubmissions">
              <el-option
                v-for="homework in homeworks"
                :key="homework.id"
                :label="homework.title"
                :value="homework.id"
              >
                <div class="homework-option">
                  <span>{{ homework.title }}</span>
                  <el-tag :type="getStatusType(homework.status)" size="small">{{ homework.status }}</el-tag>
                </div>
              </el-option>
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-select v-model="filterStatus" placeholder="批改状态" clearable @change="handleFilter">
              <el-option label="全部" value="" />
              <el-option label="已批改" value="已批改" />
              <el-option label="待批改" value="待批改" />
              <el-option label="需要重批" value="需要重批" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-select v-model="filterClass" placeholder="选择班级" clearable @change="handleFilter">
              <el-option label="全部班级" value="" />
              <el-option label="计算机1班" value="计算机1班" />
              <el-option label="计算机2班" value="计算机2班" />
              <el-option label="数学1班" value="数学1班" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-input v-model="searchKeyword" placeholder="搜索学生姓名/学号" clearable @input="handleSearch">
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <!-- 提交列表 -->
    <div v-if="selectedHomework" class="submissions-container">
      <el-card>
        <template #header>
          <div class="submissions-header">
            <h3>{{ currentHomeworkInfo.title }} - 学生提交列表</h3>
            <div class="header-actions">
              <el-button size="small" @click="refreshSubmissions">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
              <el-button size="small" type="primary" @click="showBatchGradeDialog = true" :disabled="selectedSubmissions.length === 0">
                批量评分
              </el-button>
            </div>
          </div>
        </template>

        <el-table
          :data="filteredSubmissions"
          style="width: 100%"
          @selection-change="handleSelectionChange"
          row-key="id"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="studentName" label="学生姓名" width="120" />
          <el-table-column prop="studentId" label="学号" width="120" />
          <el-table-column prop="class" label="班级" width="120" />
          <el-table-column prop="submitTime" label="提交时间" width="180">
            <template #default="{ row }">
              {{ row.submitTime ? formatDate(row.submitTime) : '--' }}
            </template>
          </el-table-column>
          <el-table-column prop="gradingStatus" label="批改状态" width="120">
            <template #default="{ row }">
              <el-tag :type="getGradingStatusType(row.gradingStatus)" size="small">
                {{ row.gradingStatus }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="score" label="得分" width="100">
            <template #default="{ row }">
              <span v-if="row.score !== null" :class="getScoreClass(row.score, row.totalScore)">
                {{ row.score }}/{{ row.totalScore }}
              </span>
              <span v-else>--</span>
            </template>
          </el-table-column>
          <el-table-column prop="gradingTime" label="批改时间" width="180">
            <template #default="{ row }">
              {{ row.gradingTime ? formatDate(row.gradingTime) : '--' }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button
                v-if="row.submitTime"
                size="small"
                type="primary"
                @click="startGrading(row)"
              >
                <el-icon><Edit /></el-icon>
                {{ row.gradingStatus === '已批改' ? '重新批改' : '开始批改' }}
              </el-button>
              <el-button
                v-if="row.gradingStatus === '已批改'"
                size="small"
                @click="viewGradingDetail(row)"
              >
                <el-icon><View /></el-icon>
                查看详情
              </el-button>
              <el-button
                v-if="!row.submitTime"
                size="small"
                type="warning"
                @click="remindStudent(row)"
              >
                <el-icon><Bell /></el-icon>
                提醒
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- 批改界面 -->
    <el-dialog
      v-model="showGradingDialog"
      :title="`批改作业 - ${currentSubmission?.studentName}`"
      width="1200px"
      top="5vh"
      :close-on-click-modal="false"
    >
      <div v-if="currentSubmission" class="grading-interface">
        <div class="grading-header">
          <div class="student-info">
            <h3>{{ currentSubmission.studentName }} ({{ currentSubmission.studentId }})</h3>
            <div class="submission-meta">
              <span>提交时间：{{ formatDate(currentSubmission.submitTime) }}</span>
              <span>班级：{{ currentSubmission.class }}</span>
              <span>总分：{{ currentSubmission.totalScore }}分</span>
            </div>
          </div>
          <div class="grading-progress">
            <span>批改进度：{{ currentQuestionIndex + 1 }}/{{ currentSubmission.answers.length }}</span>
            <el-progress
              :percentage="Math.round(((currentQuestionIndex + 1) / currentSubmission.answers.length) * 100)"
              :stroke-width="8"
            />
          </div>
        </div>

        <div class="grading-content">
          <el-row :gutter="20">
            <!-- 题目和答案区域 -->
            <el-col :span="16">
              <div class="question-area">
                <div class="question-header">
                  <h4>第{{ currentQuestionIndex + 1 }}题 ({{ currentQuestion.score }}分)</h4>
                  <el-tag :type="currentQuestion.type === '选择题' ? 'success' : 'warning'" size="small">
                    {{ currentQuestion.type }}
                  </el-tag>
                </div>

                <div class="question-content">
                  <div class="question-text">
                    {{ currentQuestion.content }}
                  </div>

                  <!-- 选择题选项 -->
                  <div v-if="currentQuestion.options" class="question-options">
                    <div
                      v-for="(option, index) in currentQuestion.options"
                      :key="index"
                      class="option-item"
                      :class="{
                        'correct': currentQuestion.correctAnswer === String.fromCharCode(65 + index),
                        'student-answer': currentAnswer.answer === String.fromCharCode(65 + index)
                      }"
                    >
                      {{ String.fromCharCode(65 + index) }}. {{ option }}
                    </div>
                  </div>
                </div>

                <div class="answer-section">
                  <div class="answer-header">
                    <h5>学生答案：</h5>
                    <el-tag v-if="currentQuestion.type === '选择题'" :type="isAnswerCorrect ? 'success' : 'danger'">
                      {{ isAnswerCorrect ? '正确' : '错误' }}
                    </el-tag>
                  </div>

                  <div class="student-answer">
                    <div v-if="currentQuestion.type === '选择题'" class="choice-answer">
                      <strong>{{ currentAnswer.answer || '未作答' }}</strong>
                      <span v-if="currentQuestion.correctAnswer" class="correct-answer">
                        (正确答案：{{ currentQuestion.correctAnswer }})
                      </span>
                    </div>
                    <div v-else class="text-answer">
                      <el-input
                        v-model="currentAnswer.answer"
                        type="textarea"
                        :rows="4"
                        readonly
                        placeholder="学生未作答"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </el-col>

            <!-- 批改区域 -->
            <el-col :span="8">
              <div class="grading-panel">
                <div class="score-input">
                  <h5>评分：</h5>
                  <el-input-number
                    v-model="currentAnswer.score"
                    :min="0"
                    :max="currentQuestion.score"
                    :precision="1"
                    :step="0.5"
                    size="large"
                    style="width: 100%;"
                  />
                  <div class="score-buttons">
                    <el-button size="small" @click="currentAnswer.score = currentQuestion.score">满分</el-button>
                    <el-button size="small" @click="currentAnswer.score = Math.floor(currentQuestion.score / 2)">半分</el-button>
                    <el-button size="small" @click="currentAnswer.score = 0">零分</el-button>
                  </div>
                </div>

                <div class="feedback-input">
                  <h5>批改意见：</h5>
                  <el-input
                    v-model="currentAnswer.feedback"
                    type="textarea"
                    :rows="4"
                    placeholder="请输入批改意见（选填）"
                  />
                  <div class="feedback-templates">
                    <el-button
                      v-for="template in feedbackTemplates"
                      :key="template"
                      size="small"
                      @click="currentAnswer.feedback = template"
                    >
                      {{ template }}
                    </el-button>
                  </div>
                </div>

                <div class="grading-actions">
                  <el-button
                    v-if="currentQuestionIndex > 0"
                    @click="previousQuestion"
                  >
                    <el-icon><ArrowLeft /></el-icon>
                    上一题
                  </el-button>
                  <el-button
                    v-if="currentQuestionIndex < currentSubmission.answers.length - 1"
                    type="primary"
                    @click="nextQuestion"
                  >
                    下一题
                    <el-icon><ArrowRight /></el-icon>
                  </el-button>
                  <el-button
                    v-if="currentQuestionIndex === currentSubmission.answers.length - 1"
                    type="success"
                    @click="finishGrading"
                  >
                    <el-icon><Check /></el-icon>
                    完成批改
                  </el-button>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </el-dialog>

    <!-- 批改详情查看 -->
    <el-dialog v-model="showDetailDialog" title="批改详情" width="1000px" top="5vh">
      <div v-if="detailSubmission" class="grading-detail">
        <div class="detail-header">
          <h3>{{ detailSubmission.studentName }} ({{ detailSubmission.studentId }})</h3>
          <div class="detail-summary">
            <el-descriptions :column="3" border>
              <el-descriptions-item label="总分">{{ detailSubmission.score }}/{{ detailSubmission.totalScore }}</el-descriptions-item>
              <el-descriptions-item label="正确率">{{ Math.round((detailSubmission.score / detailSubmission.totalScore) * 100) }}%</el-descriptions-item>
              <el-descriptions-item label="批改时间">{{ formatDate(detailSubmission.gradingTime) }}</el-descriptions-item>
            </el-descriptions>
          </div>
        </div>

        <div class="detail-questions">
          <div v-for="(answer, index) in detailSubmission.answers" :key="index" class="detail-question">
            <div class="question-header">
              <span class="question-number">第{{ index + 1 }}题</span>
              <span class="question-score">{{ answer.score }}/{{ answer.maxScore }}分</span>
              <el-tag :type="answer.score === answer.maxScore ? 'success' : (answer.score > 0 ? 'warning' : 'danger')" size="small">
                {{ answer.score === answer.maxScore ? '正确' : (answer.score > 0 ? '部分正确' : '错误') }}
              </el-tag>
            </div>
            <div class="question-content">
              <p><strong>题目：</strong>{{ answer.question }}</p>
              <p><strong>学生答案：</strong>{{ answer.answer || '未作答' }}</p>
              <p v-if="answer.correctAnswer"><strong>正确答案：</strong>{{ answer.correctAnswer }}</p>
              <p v-if="answer.feedback"><strong>批改意见：</strong>{{ answer.feedback }}</p>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 批量批改对话框 -->
    <el-dialog v-model="showBatchGradeDialog" title="批量批改" width="600px">
      <el-form :model="batchGradeForm" label-width="100px">
        <el-form-item label="批改范围">
          <span>已选择 {{ selectedSubmissions.length }} 份作业</span>
        </el-form-item>
        <el-form-item label="批改方式">
          <el-radio-group v-model="batchGradeForm.method">
            <el-radio label="auto">自动批改（仅选择题）</el-radio>
            <el-radio label="score">统一给分</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="batchGradeForm.method === 'score'" label="统一分数">
          <el-input-number v-model="batchGradeForm.score" :min="0" :max="100" />
        </el-form-item>
        <el-form-item label="批改意见">
          <el-input v-model="batchGradeForm.feedback" type="textarea" :rows="3" placeholder="批量批改意见（选填）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showBatchGradeDialog = false">取消</el-button>
          <el-button type="primary" @click="confirmBatchGrade" :loading="batchGrading">确定批改</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Edit, MagicStick, Download, Document, Check, Clock, TrendCharts,
  Search, Refresh, Bell, View, ArrowLeft, ArrowRight
} from '@element-plus/icons-vue'

// 响应式数据
const selectedHomework = ref('')
const filterStatus = ref('')
const filterClass = ref('')
const searchKeyword = ref('')
const selectedSubmissions = ref([])
const showGradingDialog = ref(false)
const showDetailDialog = ref(false)
const showBatchGradeDialog = ref(false)
const currentSubmission = ref(null)
const detailSubmission = ref(null)
const currentQuestionIndex = ref(0)
const batchGrading = ref(false)

// 批改统计
const gradingStats = reactive({
  total: 45,
  graded: 28,
  pending: 17,
  averageScore: 78.5
})

// 批量批改表单
const batchGradeForm = reactive({
  method: 'auto',
  score: 0,
  feedback: ''
})

// 反馈模板
const feedbackTemplates = [
  '答案正确，很好！',
  '思路正确，但计算有误',
  '需要加强基础知识',
  '解题方法需要改进',
  '答案不完整',
  '未按要求作答'
]

// 模拟作业数据
const homeworks = ref([
  {
    id: 1,
    title: '高等数学第三章练习',
    status: '已完成',
    totalScore: 100
  },
  {
    id: 2,
    title: '计算机网络基础测试',
    status: '进行中',
    totalScore: 80
  }
])

// 当前作业信息
const currentHomeworkInfo = ref({})

// 提交数据
const submissions = ref([])

// 模拟试题数据
const questions = ref([
  {
    id: 1,
    type: '选择题',
    content: '函数f(x) = x² + 2x + 1的最小值是？',
    options: ['0', '1', '-1', '2'],
    correctAnswer: 'A',
    score: 5
  },
  {
    id: 2,
    type: '填空题',
    content: '极限lim(x→0) (sin x)/x = ______',
    correctAnswer: '1',
    score: 10
  },
  {
    id: 3,
    type: '解答题',
    content: '求函数f(x) = x³ - 3x² + 2的极值点',
    score: 15
  }
])

// 计算属性
const filteredSubmissions = computed(() => {
  let result = [...submissions.value]

  if (filterStatus.value) {
    result = result.filter(s => s.gradingStatus === filterStatus.value)
  }

  if (filterClass.value) {
    result = result.filter(s => s.class === filterClass.value)
  }

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(s =>
      s.studentName.toLowerCase().includes(keyword) ||
      s.studentId.toLowerCase().includes(keyword)
    )
  }

  return result
})

const currentQuestion = computed(() => {
  if (!currentSubmission.value || !questions.value[currentQuestionIndex.value]) {
    return {}
  }
  return questions.value[currentQuestionIndex.value]
})

const currentAnswer = computed(() => {
  if (!currentSubmission.value || !currentSubmission.value.answers[currentQuestionIndex.value]) {
    return {}
  }
  return currentSubmission.value.answers[currentQuestionIndex.value]
})

const isAnswerCorrect = computed(() => {
  if (currentQuestion.value.type !== '选择题') return false
  return currentAnswer.value.answer === currentQuestion.value.correctAnswer
})

// 方法
const getStatusType = (status) => {
  const statusMap = {
    '进行中': 'primary',
    '已完成': 'success',
    '已逾期': 'danger'
  }
  return statusMap[status] || 'default'
}

const getGradingStatusType = (status) => {
  const statusMap = {
    '已批改': 'success',
    '待批改': 'warning',
    '需要重批': 'danger'
  }
  return statusMap[status] || 'default'
}

const getScoreClass = (score, totalScore) => {
  const percentage = (score / totalScore) * 100
  if (percentage >= 90) return 'score-excellent'
  if (percentage >= 80) return 'score-good'
  if (percentage >= 60) return 'score-pass'
  return 'score-fail'
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const loadSubmissions = () => {
  if (!selectedHomework.value) return

  // 模拟加载提交数据
  const homework = homeworks.value.find(h => h.id === selectedHomework.value)
  currentHomeworkInfo.value = homework

  submissions.value = [
    {
      id: 1,
      studentName: '张三',
      studentId: '2021001',
      class: '计算机1班',
      submitTime: '2024-01-22 14:30:00',
      gradingStatus: '已批改',
      score: 85,
      totalScore: homework.totalScore,
      gradingTime: '2024-01-23 10:15:00',
      answers: [
        { answer: 'A', score: 5, maxScore: 5, feedback: '正确', question: '函数f(x) = x² + 2x + 1的最小值是？', correctAnswer: 'A' },
        { answer: '1', score: 10, maxScore: 10, feedback: '正确', question: '极限lim(x→0) (sin x)/x = ______', correctAnswer: '1' },
        { answer: '解：f\'(x) = 3x² - 6x...', score: 12, maxScore: 15, feedback: '解题思路正确，但计算过程有小错误', question: '求函数f(x) = x³ - 3x² + 2的极值点' }
      ]
    },
    {
      id: 2,
      studentName: '李四',
      studentId: '2021002',
      class: '计算机1班',
      submitTime: '2024-01-22 16:45:00',
      gradingStatus: '待批改',
      score: null,
      totalScore: homework.totalScore,
      gradingTime: null,
      answers: [
        { answer: 'B', score: null, maxScore: 5, feedback: '', question: '函数f(x) = x² + 2x + 1的最小值是？', correctAnswer: 'A' },
        { answer: '0', score: null, maxScore: 10, feedback: '', question: '极限lim(x→0) (sin x)/x = ______', correctAnswer: '1' },
        { answer: '不会做', score: null, maxScore: 15, feedback: '', question: '求函数f(x) = x³ - 3x² + 2的极值点' }
      ]
    },
    {
      id: 3,
      studentName: '王五',
      studentId: '2021003',
      class: '计算机2班',
      submitTime: null,
      gradingStatus: '未提交',
      score: null,
      totalScore: homework.totalScore,
      gradingTime: null,
      answers: []
    }
  ]

  updateGradingStats()
}

const updateGradingStats = () => {
  const total = submissions.value.filter(s => s.submitTime).length
  const graded = submissions.value.filter(s => s.gradingStatus === '已批改').length
  const pending = total - graded
  const scores = submissions.value.filter(s => s.score !== null).map(s => s.score)
  const averageScore = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : 0

  Object.assign(gradingStats, {
    total,
    graded,
    pending,
    averageScore
  })
}

const handleFilter = () => {
  // 筛选逻辑已在计算属性中处理
}

const handleSearch = () => {
  // 搜索逻辑已在计算属性中处理
}

const handleSelectionChange = (selection) => {
  selectedSubmissions.value = selection
}

const refreshSubmissions = () => {
  loadSubmissions()
  ElMessage.success('数据已刷新')
}

const startGrading = (submission) => {
  currentSubmission.value = { ...submission }
  currentQuestionIndex.value = 0

  // 初始化答案分数
  currentSubmission.value.answers.forEach((answer, index) => {
    if (answer.score === null) {
      // 自动批改选择题
      if (questions.value[index].type === '选择题') {
        answer.score = answer.answer === questions.value[index].correctAnswer ? questions.value[index].score : 0
      } else {
        answer.score = 0
      }
    }
  })

  showGradingDialog.value = true
}

const viewGradingDetail = (submission) => {
  detailSubmission.value = submission
  showDetailDialog.value = true
}

const remindStudent = (submission) => {
  ElMessage.success(`已提醒学生 ${submission.studentName} 完成作业`)
}

const previousQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
  }
}

const nextQuestion = () => {
  if (currentQuestionIndex.value < currentSubmission.value.answers.length - 1) {
    currentQuestionIndex.value++
  }
}

const finishGrading = async () => {
  try {
    await ElMessageBox.confirm(
      '确定完成批改吗？批改结果将保存并通知学生。',
      '确认完成批改',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    // 计算总分
    const totalScore = currentSubmission.value.answers.reduce((sum, answer) => sum + (answer.score || 0), 0)

    // 更新提交记录
    const submissionIndex = submissions.value.findIndex(s => s.id === currentSubmission.value.id)
    if (submissionIndex > -1) {
      submissions.value[submissionIndex] = {
        ...currentSubmission.value,
        score: totalScore,
        gradingStatus: '已批改',
        gradingTime: new Date().toLocaleString()
      }
    }

    updateGradingStats()
    showGradingDialog.value = false
    ElMessage.success('批改完成！')
  } catch {
    ElMessage.info('已取消')
  }
}

const batchGrade = () => {
  if (selectedSubmissions.value.length === 0) {
    ElMessage.warning('请先选择要批改的作业')
    return
  }
  showBatchGradeDialog.value = true
}

const confirmBatchGrade = async () => {
  batchGrading.value = true

  try {
    // 模拟批量批改
    await new Promise(resolve => setTimeout(resolve, 2000))

    selectedSubmissions.value.forEach(submission => {
      const submissionIndex = submissions.value.findIndex(s => s.id === submission.id)
      if (submissionIndex > -1) {
        if (batchGradeForm.method === 'auto') {
          // 自动批改选择题
          submission.answers.forEach((answer, index) => {
            if (questions.value[index].type === '选择题') {
              answer.score = answer.answer === questions.value[index].correctAnswer ? questions.value[index].score : 0
            }
          })
        } else {
          // 统一给分
          submission.answers.forEach(answer => {
            answer.score = batchGradeForm.score
          })
        }

        const totalScore = submission.answers.reduce((sum, answer) => sum + (answer.score || 0), 0)
        submissions.value[submissionIndex] = {
          ...submission,
          score: totalScore,
          gradingStatus: '已批改',
          gradingTime: new Date().toLocaleString()
        }
      }
    })

    updateGradingStats()
    selectedSubmissions.value = []
    showBatchGradeDialog.value = false
    batchGrading.value = false

    ElMessage.success('批量批改完成！')
  } catch (error) {
    batchGrading.value = false
    ElMessage.error('批量批改失败')
  }
}

const autoGrade = async () => {
  try {
    await ElMessageBox.confirm(
      '自动批改将对所有选择题进行批改，是否继续？',
      '确认自动批改',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info',
      }
    )

    // 模拟自动批改
    submissions.value.forEach(submission => {
      if (submission.submitTime && submission.gradingStatus === '待批改') {
        submission.answers.forEach((answer, index) => {
          if (questions.value[index].type === '选择题') {
            answer.score = answer.answer === questions.value[index].correctAnswer ? questions.value[index].score : 0
            answer.feedback = answer.score > 0 ? '正确' : '错误'
          }
        })

        const hasSubjectiveQuestions = submission.answers.some((answer, index) =>
          questions.value[index].type !== '选择题'
        )

        if (!hasSubjectiveQuestions) {
          const totalScore = submission.answers.reduce((sum, answer) => sum + (answer.score || 0), 0)
          submission.score = totalScore
          submission.gradingStatus = '已批改'
          submission.gradingTime = new Date().toLocaleString()
        }
      }
    })

    updateGradingStats()
    ElMessage.success('自动批改完成！')
  } catch {
    ElMessage.info('已取消自动批改')
  }
}

const exportGrades = () => {
  ElMessage.info('导出成绩功能')
  // 这里可以实现成绩导出功能
}

// 监听作业选择变化
watch(selectedHomework, (newVal) => {
  if (newVal) {
    loadSubmissions()
  }
})

onMounted(() => {
  ElMessage.success('批改系统加载完成')
})
</script>

<style scoped>
.homework-grading {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-left h1 {
  margin: 0 0 10px 0;
  color: #303133;
  font-size: 28px;
}

.header-left p {
  margin: 0;
  color: #606266;
  font-size: 16px;
}

.header-actions {
  display: flex;
  gap: 15px;
}

.grading-stats {
  margin-bottom: 30px;
}

.stats-card {
  border-radius: 12px;
  overflow: hidden;
}

.stats-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stats-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.stats-icon.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stats-icon.graded {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stats-icon.pending {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.stats-icon.average {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stats-number {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
  line-height: 1;
}

.stats-label {
  color: #606266;
  font-size: 14px;
  margin-top: 5px;
}

.filter-card {
  margin-bottom: 20px;
  border-radius: 12px;
}

.filter-section {
  padding: 10px 0;
}

.homework-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.submissions-container {
  margin-bottom: 30px;
}

.submissions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.submissions-header h3 {
  margin: 0;
  color: #303133;
}

.score-excellent {
  color: #67c23a;
  font-weight: bold;
}

.score-good {
  color: #409eff;
  font-weight: bold;
}

.score-pass {
  color: #e6a23c;
  font-weight: bold;
}

.score-fail {
  color: #f56c6c;
  font-weight: bold;
}

.grading-interface {
  max-height: 70vh;
  overflow-y: auto;
}

.grading-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #ebeef5;
}

.student-info h3 {
  margin: 0 0 10px 0;
  color: #303133;
}

.submission-meta {
  display: flex;
  gap: 20px;
  color: #606266;
  font-size: 14px;
}

.grading-progress {
  text-align: right;
  min-width: 200px;
}

.grading-content {
  margin-bottom: 20px;
}

.question-area {
  background: white;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #ebeef5;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.question-header h4 {
  margin: 0;
  color: #303133;
}

.question-content {
  margin-bottom: 20px;
}

.question-text {
  font-size: 16px;
  line-height: 1.6;
  color: #303133;
  margin-bottom: 15px;
}

.question-options {
  margin: 15px 0;
}

.option-item {
  padding: 8px 12px;
  margin: 5px 0;
  border-radius: 6px;
  border: 1px solid #dcdfe6;
  transition: all 0.3s;
}

.option-item.correct {
  background-color: #f0f9ff;
  border-color: #67c23a;
  color: #67c23a;
}

.option-item.student-answer {
  background-color: #fef0f0;
  border-color: #f56c6c;
}

.option-item.student-answer.correct {
  background-color: #f0f9ff;
  border-color: #67c23a;
  color: #67c23a;
}

.answer-section {
  margin-top: 20px;
}

.answer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.answer-header h5 {
  margin: 0;
  color: #303133;
}

.student-answer {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
}

.choice-answer {
  font-size: 16px;
}

.correct-answer {
  color: #67c23a;
  margin-left: 10px;
}

.grading-panel {
  background: white;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  height: fit-content;
}

.score-input {
  margin-bottom: 20px;
}

.score-input h5 {
  margin: 0 0 10px 0;
  color: #303133;
}

.score-buttons {
  display: flex;
  gap: 5px;
  margin-top: 10px;
}

.feedback-input {
  margin-bottom: 20px;
}

.feedback-input h5 {
  margin: 0 0 10px 0;
  color: #303133;
}

.feedback-templates {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 10px;
}

.grading-actions {
  display: flex;
  gap: 10px;
  justify-content: space-between;
}

.grading-detail {
  max-height: 600px;
  overflow-y: auto;
}

.detail-header {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #ebeef5;
}

.detail-header h3 {
  margin: 0 0 15px 0;
  color: #303133;
}

.detail-summary {
  margin-top: 15px;
}

.detail-questions {
  margin-top: 20px;
}

.detail-question {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #fafafa;
  border-radius: 8px;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.question-number {
  font-weight: bold;
  color: #409eff;
}

.question-score {
  font-weight: bold;
  color: #303133;
}

.question-content p {
  margin: 8px 0;
  line-height: 1.6;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .page-header {
    flex-direction: column;
    gap: 20px;
    align-items: stretch;
  }

  .header-actions {
    justify-content: center;
  }

  .grading-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .grading-progress {
    text-align: left;
  }
}

@media (max-width: 768px) {
  .homework-grading {
    padding: 10px;
  }

  .submission-meta {
    flex-direction: column;
    gap: 5px;
  }

  .grading-actions {
    flex-direction: column;
  }

  .score-buttons {
    flex-direction: column;
  }

  .feedback-templates {
    flex-direction: column;
  }
}
</style>