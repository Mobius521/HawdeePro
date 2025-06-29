<template>
    <div class="paper-edit">
      <div class="header">
        <h2>修改试卷</h2>
        <div class="header-actions">
          <el-button @click="goBack">
            <el-icon><ArrowLeft /></el-icon>
            返回试卷列表
          </el-button>
          <el-button type="info" @click="previewPaper">
            <el-icon><View /></el-icon>
            预览试卷
          </el-button>
          <el-button type="success" @click="autoSave" :loading="autoSaving">
            <el-icon><Clock /></el-icon>
            自动保存
          </el-button>
        </div>
      </div>
  
      <!-- 保存状态提示 -->
      <div v-if="saveStatus" class="save-status" :class="saveStatus.type">
        <el-icon><InfoFilled /></el-icon>
        {{ saveStatus.message }}
      </div>
  
      <!-- 试卷基本信息 -->
      <el-card class="edit-card">
        <template #header>
          <div class="card-header">
            <span>试卷基本信息</span>
            <el-tag v-if="paperForm.status" :type="paperForm.status === '已发布' ? 'success' : 'warning'">
              {{ paperForm.status }}
            </el-tag>
          </div>
        </template>
  
        <el-form :model="paperForm" :rules="paperRules" ref="paperFormRef" label-width="120px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="试卷名称" prop="title">
                <el-input
                  v-model="paperForm.title"
                  placeholder="请输入试卷名称"
                  @change="markAsModified"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="科目" prop="subject">
                <el-select
                  v-model="paperForm.subject"
                  placeholder="请选择科目"
                  style="width: 100%;"
                  @change="markAsModified"
                >
                  <el-option label="数学" value="数学" />
                  <el-option label="语文" value="语文" />
                  <el-option label="英语" value="英语" />
                  <el-option label="物理" value="物理" />
                  <el-option label="化学" value="化学" />
                  <el-option label="计算机" value="计算机" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
  
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="难度等级" prop="difficulty">
                <el-select
                  v-model="paperForm.difficulty"
                  placeholder="请选择难度"
                  style="width: 100%;"
                  @change="markAsModified"
                >
                  <el-option label="简单" value="简单" />
                  <el-option label="中等" value="中等" />
                  <el-option label="困难" value="困难" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="总分">
                <el-input-number
                  v-model="paperForm.totalScore"
                  :min="50"
                  :max="200"
                  :step="10"
                  style="width: 100%;"
                  @change="markAsModified"
                />
                <span style="margin-left: 10px; color: #909399;">
                  (当前题目总分: {{ totalQuestionScore }})
                </span>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="预计用时">
                <el-input-number
                  v-model="paperForm.estimatedTime"
                  :min="30"
                  :max="300"
                  :step="15"
                  style="width: 100%;"
                  @change="markAsModified"
                />
                <span style="margin-left: 10px;">分钟</span>
              </el-form-item>
            </el-col>
          </el-row>
  
          <el-form-item label="试卷描述">
            <el-input
              v-model="paperForm.description"
              type="textarea"
              :rows="3"
              placeholder="请输入试卷描述（选填）"
              @change="markAsModified"
            />
          </el-form-item>
        </el-form>
      </el-card>
  
      <!-- 题目管理 -->
      <el-card class="edit-card">
        <template #header>
          <div class="card-header">
            <span>题目管理 (共 {{ questions.length }} 题，总分: {{ totalQuestionScore }})</span>
            <div class="header-buttons">
              <el-button type="success" size="small" @click="addQuestion">
                <el-icon><Plus /></el-icon>
                添加题目
              </el-button>
              <el-button type="warning" size="small" @click="batchEdit" :disabled="selectedQuestions.length === 0">
                <el-icon><Edit /></el-icon>
                批量编辑 ({{ selectedQuestions.length }})
              </el-button>
              <el-button type="danger" size="small" @click="batchDelete" :disabled="selectedQuestions.length === 0">
                <el-icon><Delete /></el-icon>
                批量删除
              </el-button>
            </div>
          </div>
        </template>
  
        <div class="questions-container">
          <div v-if="questions.length === 0" class="empty-questions">
            <el-empty description="暂无题目，请点击上方按钮添加题目" />
          </div>
  
          <div v-for="(question, index) in questions" :key="question.id" class="question-card" :class="{ 'selected': selectedQuestions.includes(index) }">
            <div class="question-header">
              <div class="question-left">
                <el-checkbox
                  v-model="selectedQuestions"
                  :label="index"
                  @change="onQuestionSelect"
                />
                <span class="question-number">第 {{ index + 1 }} 题</span>
              </div>
              <div class="question-actions">
                <el-button size="small" @click="moveUp(index)" :disabled="index === 0">
                  <el-icon><ArrowUp /></el-icon>
                  上移
                </el-button>
                <el-button size="small" @click="moveDown(index)" :disabled="index === questions.length - 1">
                  <el-icon><ArrowDown /></el-icon>
                  下移
                </el-button>
                <el-button size="small" @click="copyQuestion(index)">
                  <el-icon><CopyDocument /></el-icon>
                  复制
                </el-button>
                <el-button size="small" type="primary" @click="editQuestion(index)">
                  <el-icon><Edit /></el-icon>
                  修改
                </el-button>
                <el-button size="small" type="danger" @click="deleteQuestion(index)">
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </div>
            </div>
  
            <div class="question-content">
              <div class="question-info">
                <el-tag size="small" type="primary">{{ question.type }}</el-tag>
                <el-tag size="small" type="warning">{{ question.score }}分</el-tag>
                <el-tag v-if="question.difficulty" size="small" type="info">{{ question.difficulty }}</el-tag>
                <span v-if="question.modified" class="modified-indicator">
                  <el-icon><EditPen /></el-icon>
                  已修改
                </span>
              </div>
              <div class="question-text">{{ question.content }}</div>
              <div v-if="question.options && question.options.length > 0" class="question-options">
                <div v-for="(option, optIndex) in question.options" :key="optIndex" class="option-item">
                  {{ String.fromCharCode(65 + optIndex) }}. {{ option }}
                </div>
              </div>
              <div v-if="question.answer" class="question-answer">
                <strong>答案：</strong>{{ question.answer }}
              </div>
              <div v-if="question.explanation" class="question-explanation">
                <strong>解析：</strong>{{ question.explanation }}
              </div>
            </div>
          </div>
        </div>
  
        <!-- 批量操作栏 -->
        <div v-if="selectedQuestions.length > 0" class="batch-actions">
          <span>已选择 {{ selectedQuestions.length }} 道题目</span>
          <div class="batch-buttons">
            <el-button size="small" @click="batchChangeScore">批量改分</el-button>
            <el-button size="small" @click="batchChangeDifficulty">批量改难度</el-button>
            <el-button size="small" @click="clearSelection">取消选择</el-button>
          </div>
        </div>
      </el-card>
  
      <!-- 操作按钮 -->
      <div class="form-actions">
        <el-button size="large" @click="saveDraft" :loading="saving">
          <el-icon><Document /></el-icon>
          保存草稿
        </el-button>
        <el-button
          type="primary"
          size="large"
          @click="saveChanges"
          :loading="saving"
          :disabled="!hasChanges"
        >
          <el-icon><Check /></el-icon>
          保存修改
        </el-button>
        <el-button
          v-if="paperForm.status === '草稿'"
          type="success"
          size="large"
          @click="publishPaper"
          :loading="publishing"
        >
          <el-icon><Promotion /></el-icon>
          发布试卷
        </el-button>
      </div>
  
      <!-- 添加/编辑题目对话框 -->
      <el-dialog v-model="showQuestionDialog" :title="editingIndex >= 0 ? '修改题目' : '添加题目'" width="900px">
        <el-form :model="questionForm" :rules="questionRules" ref="questionFormRef" label-width="100px">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="题目类型" prop="type">
                <el-select v-model="questionForm.type" placeholder="请选择题目类型" @change="onQuestionTypeChange">
                  <el-option label="选择题" value="选择题" />
                  <el-option label="填空题" value="填空题" />
                  <el-option label="判断题" value="判断题" />
                  <el-option label="简答题" value="简答题" />
                  <el-option label="计算题" value="计算题" />
                  <el-option label="证明题" value="证明题" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="分值" prop="score">
                <el-input-number v-model="questionForm.score" :min="1" :max="50" style="width: 100%;" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="难度">
                <el-select v-model="questionForm.difficulty" placeholder="选择难度">
                  <el-option label="简单" value="简单" />
                  <el-option label="中等" value="中等" />
                  <el-option label="困难" value="困难" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
  
          <el-form-item label="题目内容" prop="content">
            <el-input
              v-model="questionForm.content"
              type="textarea"
              :rows="4"
              placeholder="请输入题目内容"
            />
          </el-form-item>
  
          <!-- 选择题选项 -->
          <div v-if="questionForm.type === '选择题'">
            <el-form-item label="选项设置">
              <div v-for="(option, index) in questionForm.options" :key="index" class="option-input">
                <span class="option-label">{{ String.fromCharCode(65 + index) }}.</span>
                <el-input v-model="questionForm.options[index]" placeholder="请输入选项内容" />
                <el-button
                  v-if="questionForm.options.length > 2"
                  size="small"
                  type="danger"
                  @click="removeOption(index)"
                >
                  删除
                </el-button>
              </div>
              <el-button
                v-if="questionForm.options.length < 6"
                size="small"
                type="primary"
                @click="addOption"
              >
                添加选项
              </el-button>
            </el-form-item>
  
            <el-form-item label="正确答案" prop="answer">
              <el-select v-model="questionForm.answer" placeholder="请选择正确答案">
                <el-option
                  v-for="(option, index) in questionForm.options"
                  :key="index"
                  :label="`${String.fromCharCode(65 + index)}. ${option}`"
                  :value="String.fromCharCode(65 + index)"
                />
              </el-select>
            </el-form-item>
          </div>
  
          <!-- 判断题 -->
          <div v-if="questionForm.type === '判断题'">
            <el-form-item label="正确答案" prop="answer">
              <el-radio-group v-model="questionForm.answer">
                <el-radio label="正确">正确</el-radio>
                <el-radio label="错误">错误</el-radio>
              </el-radio-group>
            </el-form-item>
          </div>
  
          <!-- 其他题型的答案 -->
          <div v-if="['填空题', '简答题', '计算题', '证明题'].includes(questionForm.type)">
            <el-form-item label="参考答案" prop="answer">
              <el-input
                v-model="questionForm.answer"
                type="textarea"
                :rows="3"
                placeholder="请输入参考答案"
              />
            </el-form-item>
          </div>
  
          <el-form-item label="解析说明">
            <el-input
              v-model="questionForm.explanation"
              type="textarea"
              :rows="2"
              placeholder="请输入解析说明（选填）"
            />
          </el-form-item>
        </el-form>
  
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="showQuestionDialog = false">取消</el-button>
            <el-button type="primary" @click="saveQuestion">确定</el-button>
          </span>
        </template>
      </el-dialog>
  
      <!-- 批量改分对话框 -->
      <el-dialog v-model="showBatchScoreDialog" title="批量改分" width="400px">
        <el-form label-width="80px">
          <el-form-item label="新分值">
            <el-input-number v-model="batchScore" :min="1" :max="50" style="width: 100%;" />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="showBatchScoreDialog = false">取消</el-button>
            <el-button type="primary" @click="confirmBatchScore">确定</el-button>
          </span>
        </template>
      </el-dialog>
  
      <!-- 批量改难度对话框 -->
      <el-dialog v-model="showBatchDifficultyDialog" title="批量改难度" width="400px">
        <el-form label-width="80px">
          <el-form-item label="难度等级">
            <el-select v-model="batchDifficulty" placeholder="请选择难度" style="width: 100%;">
              <el-option label="简单" value="简单" />
              <el-option label="中等" value="中等" />
              <el-option label="困难" value="困难" />
            </el-select>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="showBatchDifficultyDialog = false">取消</el-button>
            <el-button type="primary" @click="confirmBatchDifficulty">确定</el-button>
          </span>
        </template>
      </el-dialog>
  
      <!-- 预览对话框 -->
      <el-dialog v-model="showPreviewDialog" title="试卷预览" width="900px" top="5vh">
        <div class="paper-preview">
          <div class="preview-header">
            <h2>{{ paperForm.title }}</h2>
            <div class="preview-info">
              <span>科目：{{ paperForm.subject }}</span>
              <span>总分：{{ paperForm.totalScore }}分</span>
              <span>时间：{{ paperForm.estimatedTime }}分钟</span>
            </div>
          </div>
  
          <div class="preview-content">
            <div v-for="(question, index) in questions" :key="question.id" class="preview-question">
              <div class="preview-question-header">
                <span class="preview-question-number">{{ index + 1 }}.</span>
                <span class="preview-question-type">[{{ question.type }}]</span>
                <span class="preview-question-score">({{ question.score }}分)</span>
              </div>
              <div class="preview-question-content">{{ question.content }}</div>
              <div v-if="question.options && question.options.length > 0" class="preview-question-options">
                <div v-for="(option, optIndex) in question.options" :key="optIndex" class="preview-option-item">
                  {{ String.fromCharCode(65 + optIndex) }}. {{ option }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-dialog>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import {
    ArrowLeft, View, Clock, InfoFilled, Plus, Edit, Delete,
    ArrowUp, ArrowDown, CopyDocument, EditPen, Document,
    Check, Promotion
  } from '@element-plus/icons-vue'
  
  // 响应式数据
  const saving = ref(false)
  const publishing = ref(false)
  const autoSaving = ref(false)
  const showQuestionDialog = ref(false)
  const showBatchScoreDialog = ref(false)
  const showBatchDifficultyDialog = ref(false)
  const showPreviewDialog = ref(false)
  const editingIndex = ref(-1)
  const selectedQuestions = ref([])
  const batchScore = ref(5)
  const batchDifficulty = ref('')
  const hasChanges = ref(false)
  const saveStatus = ref(null)
  
  // 表单引用
  const paperFormRef = ref()
  const questionFormRef = ref()
  
  // 试卷表单（模拟从后端加载的数据）
  const paperForm = reactive({
    id: 1,
    title: '高等数学函数与极限练习题',
    subject: '数学',
    difficulty: '中等',
    totalScore: 100,
    estimatedTime: 90,
    description: '本试卷主要考查函数与极限相关知识点',
    status: '草稿',
    createTime: '2024-01-15 10:30:00',
    updateTime: '2024-01-15 10:30:00'
  })
  
  // 题目列表（模拟从后端加载的数据）
  const questions = ref([
    {
      id: 1,
      type: '选择题',
      score: 5,
      difficulty: '简单',
      content: '函数f(x) = x² + 2x + 1的最小值是？',
      options: ['0', '1', '-1', '2'],
      answer: 'A',
      explanation: '配方得f(x) = (x+1)²，最小值为0',
      modified: false
    },
    {
      id: 2,
      type: '填空题',
      score: 8,
      difficulty: '中等',
      content: '极限lim(x→0) (sin x)/x = ______',
      answer: '1',
      explanation: '这是重要极限之一',
      modified: false
    },
    {
      id: 3,
      type: '计算题',
      score: 15,
      difficulty: '困难',
      content: '计算定积分∫₀¹ x²dx',
      answer: '解：∫₀¹ x²dx = [x³/3]₀¹ = 1/3 - 0 = 1/3',
      explanation: '利用牛顿-莱布尼茨公式计算',
      modified: false
    }
  ])
  
  // 题目表单
  const questionForm = reactive({
    type: '',
    score: 5,
    difficulty: '',
    content: '',
    options: ['', ''],
    answer: '',
    explanation: ''
  })
  
  // 表单验证规则
  const paperRules = {
    title: [
      { required: true, message: '请输入试卷名称', trigger: 'blur' }
    ],
    subject: [
      { required: true, message: '请选择科目', trigger: 'change' }
    ],
    difficulty: [
      { required: true, message: '请选择难度等级', trigger: 'change' }
    ]
  }
  
  const questionRules = {
    type: [
      { required: true, message: '请选择题目类型', trigger: 'change' }
    ],
    score: [
      { required: true, message: '请输入分值', trigger: 'blur' }
    ],
    content: [
      { required: true, message: '请输入题目内容', trigger: 'blur' }
    ],
    answer: [
      { required: true, message: '请输入答案', trigger: 'blur' }
    ]
  }
  
  // 计算属性
  const totalQuestionScore = computed(() => {
    return questions.value.reduce((sum, question) => sum + question.score, 0)
  })
  
  // 自动保存定时器
  let autoSaveTimer = null
  
  // 方法
  const markAsModified = () => {
    hasChanges.value = true
    clearSaveStatus()
  }
  
  const clearSaveStatus = () => {
    if (saveStatus.value) {
      setTimeout(() => {
        saveStatus.value = null
      }, 3000)
    }
  }
  
  const showSaveStatus = (message, type = 'success') => {
    saveStatus.value = { message, type }
    clearSaveStatus()
  }
  
  const goBack = async () => {
    if (hasChanges.value) {
      try {
        await ElMessageBox.confirm(
          '您有未保存的修改，确定要离开吗？',
          '确认离开',
          {
            confirmButtonText: '离开',
            cancelButtonText: '取消',
            type: 'warning',
          }
        )
        ElMessage.info('返回试卷列表')
      } catch {
        return
      }
    } else {
      ElMessage.info('返回试卷列表')
    }
  }
  
  const previewPaper = () => {
    showPreviewDialog.value = true
  }
  
  const autoSave = async () => {
    if (!hasChanges.value) {
      ElMessage.info('没有需要保存的修改')
      return
    }
  
    autoSaving.value = true
  
    // 模拟自动保存
    setTimeout(() => {
      autoSaving.value = false
      hasChanges.value = false
      paperForm.updateTime = new Date().toLocaleString()
      showSaveStatus('自动保存成功', 'success')
    }, 1000)
  }
  
  const addQuestion = () => {
    editingIndex.value = -1
    resetQuestionForm()
    showQuestionDialog.value = true
  }
  
  const editQuestion = (index) => {
    editingIndex.value = index
    const question = questions.value[index]
    Object.assign(questionForm, {
      type: question.type,
      score: question.score,
      difficulty: question.difficulty || '',
      content: question.content,
      options: question.options ? [...question.options] : ['', ''],
      answer: question.answer,
      explanation: question.explanation || ''
    })
    showQuestionDialog.value = true
  }
  
  const deleteQuestion = async (index) => {
    try {
      await ElMessageBox.confirm(
        '确定要删除这道题目吗？',
        '确认删除',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
  
      questions.value.splice(index, 1)
      markAsModified()
      ElMessage.success('删除成功')
    } catch {
      ElMessage.info('已取消删除')
    }
  }
  
  const copyQuestion = (index) => {
    const originalQuestion = questions.value[index]
    const copiedQuestion = {
      ...originalQuestion,
      id: Date.now(),
      content: originalQuestion.content + ' (副本)',
      modified: true
    }
    questions.value.splice(index + 1, 0, copiedQuestion)
    markAsModified()
    ElMessage.success('题目复制成功')
  }
  
  const moveUp = (index) => {
    if (index > 0) {
      const temp = questions.value[index]
      questions.value[index] = questions.value[index - 1]
      questions.value[index - 1] = temp
      markAsModified()
      ElMessage.success('题目上移成功')
    }
  }
  
  const moveDown = (index) => {
    if (index < questions.value.length - 1) {
      const temp = questions.value[index]
      questions.value[index] = questions.value[index + 1]
      questions.value[index + 1] = temp
      markAsModified()
      ElMessage.success('题目下移成功')
    }
  }
  
  const onQuestionSelect = () => {
    // 选择逻辑已由v-model处理
  }
  
  const batchEdit = () => {
    ElMessage.info('批量编辑功能：可以批量修改题目类型、分值、难度等')
  }
  
  const batchDelete = async () => {
    if (selectedQuestions.value.length === 0) {
      ElMessage.warning('请先选择要删除的题目')
      return
    }
  
    try {
      await ElMessageBox.confirm(
        `确定要删除选中的 ${selectedQuestions.value.length} 道题目吗？`,
        '确认批量删除',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
  
      // 按索引从大到小排序，避免删除时索引变化
      const sortedIndexes = [...selectedQuestions.value].sort((a, b) => b - a)
      sortedIndexes.forEach(index => {
        questions.value.splice(index, 1)
      })
  
      selectedQuestions.value = []
      markAsModified()
      ElMessage.success('批量删除成功')
    } catch {
      ElMessage.info('已取消删除')
    }
  }
  
  const batchChangeScore = () => {
    if (selectedQuestions.value.length === 0) {
      ElMessage.warning('请先选择要改分的题目')
      return
    }
    showBatchScoreDialog.value = true
  }
  
  const batchChangeDifficulty = () => {
    if (selectedQuestions.value.length === 0) {
      ElMessage.warning('请先选择要改难度的题目')
      return
    }
    showBatchDifficultyDialog.value = true
  }
  
  const confirmBatchScore = () => {
    selectedQuestions.value.forEach(index => {
      questions.value[index].score = batchScore.value
      questions.value[index].modified = true
    })
    showBatchScoreDialog.value = false
    selectedQuestions.value = []
    markAsModified()
    ElMessage.success('批量改分成功')
  }
  
  const confirmBatchDifficulty = () => {
    selectedQuestions.value.forEach(index => {
      questions.value[index].difficulty = batchDifficulty.value
      questions.value[index].modified = true
    })
    showBatchDifficultyDialog.value = false
    selectedQuestions.value = []
    markAsModified()
    ElMessage.success('批量改难度成功')
  }
  
  const clearSelection = () => {
    selectedQuestions.value = []
  }
  
  const onQuestionTypeChange = (type) => {
    if (type === '选择题') {
      questionForm.options = ['', '']
      questionForm.answer = ''
    } else if (type === '判断题') {
      questionForm.options = []
      questionForm.answer = ''
    } else {
      questionForm.options = []
      questionForm.answer = ''
    }
  }
  
  const addOption = () => {
    if (questionForm.options.length < 6) {
      questionForm.options.push('')
    }
  }
  
  const removeOption = (index) => {
    if (questionForm.options.length > 2) {
      questionForm.options.splice(index, 1)
      // 如果删除的选项是正确答案，清空答案
      const answerIndex = questionForm.answer.charCodeAt(0) - 65
      if (answerIndex === index) {
        questionForm.answer = ''
      } else if (answerIndex > index) {
        // 如果正确答案在删除选项之后，需要调整
        questionForm.answer = String.fromCharCode(answerIndex + 64)
      }
    }
  }
  
  const resetQuestionForm = () => {
    Object.assign(questionForm, {
      type: '',
      score: 5,
      difficulty: '',
      content: '',
      options: ['', ''],
      answer: '',
      explanation: ''
    })
  }
  
  const saveQuestion = async () => {
    if (!questionFormRef.value) return
  
    await questionFormRef.value.validate((valid) => {
      if (valid) {
        const questionData = {
          id: editingIndex.value >= 0 ? questions.value[editingIndex.value].id : Date.now(),
          type: questionForm.type,
          score: questionForm.score,
          difficulty: questionForm.difficulty,
          content: questionForm.content,
          options: questionForm.type === '选择题' ? [...questionForm.options] : null,
          answer: questionForm.answer,
          explanation: questionForm.explanation,
          modified: true
        }
  
        if (editingIndex.value >= 0) {
          questions.value[editingIndex.value] = questionData
          ElMessage.success('题目修改成功')
        } else {
          questions.value.push(questionData)
          ElMessage.success('题目添加成功')
        }
  
        markAsModified()
        showQuestionDialog.value = false
        resetQuestionForm()
      }
    })
  }
  
  const saveDraft = async () => {
    if (!paperFormRef.value) return
  
    await paperFormRef.value.validate((valid) => {
      if (valid) {
        if (questions.value.length === 0) {
          ElMessage.warning('请至少添加一道题目')
          return
        }
  
        saving.value = true
  
        // 模拟保存草稿
        setTimeout(() => {
          saving.value = false
          hasChanges.value = false
          paperForm.status = '草稿'
          paperForm.updateTime = new Date().toLocaleString()
          showSaveStatus('草稿保存成功', 'success')
        }, 1500)
      }
    })
  }
  
  const saveChanges = async () => {
    if (!paperFormRef.value) return
  
    await paperFormRef.value.validate((valid) => {
      if (valid) {
        if (questions.value.length === 0) {
          ElMessage.warning('请至少添加一道题目')
          return
        }
  
        saving.value = true
  
        // 模拟保存修改
        setTimeout(() => {
          saving.value = false
          hasChanges.value = false
          paperForm.updateTime = new Date().toLocaleString()
  
          // 清除题目的修改标记
          questions.value.forEach(question => {
            question.modified = false
          })
  
          showSaveStatus('修改保存成功', 'success')
        }, 2000)
      }
    })
  }
  
  const publishPaper = async () => {
    if (!paperFormRef.value) return
  
    await paperFormRef.value.validate((valid) => {
      if (valid) {
        if (questions.value.length === 0) {
          ElMessage.warning('请至少添加一道题目')
          return
        }
  
        if (Math.abs(totalQuestionScore.value - paperForm.totalScore) > 0.1) {
          ElMessage.warning(`题目总分(${totalQuestionScore.value})与设定总分(${paperForm.totalScore})不一致，请调整`)
          return
        }
  
        publishing.value = true
  
        // 模拟发布
        setTimeout(() => {
          publishing.value = false
          hasChanges.value = false
          paperForm.status = '已发布'
          paperForm.updateTime = new Date().toLocaleString()
          showSaveStatus('试卷发布成功', 'success')
        }, 2000)
      }
    })
  }
  
  // 启动自动保存
  const startAutoSave = () => {
    autoSaveTimer = setInterval(() => {
      if (hasChanges.value && !saving.value && !publishing.value) {
        autoSave()
      }
    }, 30000) // 每30秒自动保存一次
  }
  
  onMounted(() => {
    // 模拟从后端加载试卷数据
    ElMessage.success('试卷数据加载完成')
    startAutoSave()
  })
  
  onBeforeUnmount(() => {
    if (autoSaveTimer) {
      clearInterval(autoSaveTimer)
    }
  })
  </script>
  
  <style scoped>
  .paper-edit {
    padding: 20px;
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .header h2 {
    margin: 0;
    color: #303133;
  }
  
  .header-actions {
    display: flex;
    gap: 10px;
  }
  
  .save-status {
    padding: 10px 15px;
    margin-bottom: 20px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
  }
  
  .save-status.success {
    background-color: #f0f9ff;
    color: #409eff;
    border: 1px solid #b3d8ff;
  }
  
  .save-status.warning {
    background-color: #fdf6ec;
    color: #e6a23c;
    border: 1px solid #f5dab1;
  }
  
  .save-status.error {
    background-color: #fef0f0;
    color: #f56c6c;
    border: 1px solid #fbc4c4;
  }
  
  .edit-card {
    margin-bottom: 20px;
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .header-buttons {
    display: flex;
    gap: 10px;
  }
  
  .questions-container {
    min-height: 200px;
  }
  
  .empty-questions {
    text-align: center;
    padding: 40px 0;
  }
  
  .question-card {
    border: 1px solid #dcdfe6;
    border-radius: 6px;
    margin-bottom: 15px;
    background-color: #fafafa;
    transition: all 0.3s;
  }
  
  .question-card.selected {
    border-color: #409eff;
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
  }
  
  .question-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 15px;
    background-color: #f5f7fa;
    border-bottom: 1px solid #dcdfe6;
  }
  
  .question-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .question-number {
    font-weight: bold;
    color: #409eff;
  }
  
  .question-actions {
    display: flex;
    gap: 5px;
    flex-wrap: wrap;
  }
  
  .question-content {
    padding: 15px;
  }
  
  .question-info {
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }
  
  .modified-indicator {
    color: #e6a23c;
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 2px;
  }
  
  .question-text {
    font-size: 15px;
    line-height: 1.6;
    margin-bottom: 10px;
    color: #303133;
  }
  
  .question-options {
    margin: 10px 0;
  }
  
  .option-item {
    padding: 3px 0;
    color: #606266;
  }
  
  .question-answer {
    margin-top: 10px;
    padding: 8px 12px;
    background-color: #f0f9ff;
    border-left: 3px solid #409eff;
    border-radius: 4px;
    font-size: 14px;
  }
  
  .question-explanation {
    margin-top: 8px;
    padding: 8px 12px;
    background-color: #f9f9f9;
    border-left: 3px solid #67c23a;
    border-radius: 4px;
    font-size: 14px;
    color: #606266;
  }
  
  .batch-actions {
    margin-top: 15px;
    padding: 15px;
    background-color: #ecf5ff;
    border-radius: 4px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .batch-buttons {
    display: flex;
    gap: 10px;
  }
  
  .form-actions {
    text-align: center;
    padding: 30px 0;
    border-top: 1px solid #dcdfe6;
    margin-top: 20px;
  }
  
  .form-actions .el-button {
    margin: 0 10px;
  }
  
  .option-input {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
  }
  
  .option-label {
    width: 30px;
    font-weight: bold;
    color: #409eff;
  }
  
  .option-input .el-input {
    flex: 1;
    margin: 0 10px;
  }
  
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
  }
  
  .paper-preview {
    max-height: 600px;
    overflow-y: auto;
  }
  
  .preview-header {
    text-align: center;
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 2px solid #dcdfe6;
  }
  
  .preview-header h2 {
    margin: 0 0 10px 0;
    color: #303133;
  }
  
  .preview-info {
    display: flex;
    justify-content: center;
    gap: 30px;
    color: #606266;
  }
  
  .preview-question {
    margin-bottom: 25px;
    padding: 15px;
    background-color: #fafafa;
    border-radius: 6px;
  }
  
  .preview-question-header {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    font-weight: bold;
  }
  
  .preview-question-number {
    color: #409eff;
    margin-right: 10px;
    font-size: 16px;
  }
  
  .preview-question-type {
    background-color: #e1f3d8;
    color: #67c23a;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    margin-right: 10px;
  }
  
  .preview-question-score {
    color: #f56c6c;
    font-size: 14px;
  }
  
  .preview-question-content {
    font-size: 15px;
    line-height: 1.6;
    margin-bottom: 10px;
    color: #303133;
  }
  
  .preview-question-options {
    margin: 10px 0;
  }
  
  .preview-option-item {
    padding: 5px 0;
    color: #606266;
    font-size: 14px;
  }
  
  /* 响应式设计 */
  @media (max-width: 768px) {
    .header {
      flex-direction: column;
      gap: 15px;
      align-items: stretch;
    }
  
    .header-actions {
      justify-content: center;
      flex-wrap: wrap;
    }
  
    .question-header {
      flex-direction: column;
      gap: 10px;
      align-items: stretch;
    }
  
    .question-left {
      justify-content: flex-start;
    }
  
    .question-actions {
      justify-content: center;
    }
  
    .batch-actions {
      flex-direction: column;
      gap: 15px;
      align-items: stretch;
    }
  
    .batch-buttons {
      justify-content: center;
    }
  
    .preview-info {
      flex-direction: column;
      gap: 10px;
    }
  }
  </style>