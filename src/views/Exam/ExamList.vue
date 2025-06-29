<template>
  <div class="paper-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1>试卷管理</h1>
        <p>管理所有试卷，支持创建、编辑、发布、删除等操作</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" size="large" @click="createPaper">
          <el-icon><Plus /></el-icon>
          创建试卷
        </el-button>
        <el-button type="success" size="large" @click="uploadPaper">
          <el-icon><Upload /></el-icon>
          上传试卷
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon total">
                <el-icon><Document /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-number">{{ statistics.total }}</div>
                <div class="stats-label">试卷总数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon published">
                <el-icon><Check /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-number">{{ statistics.published }}</div>
                <div class="stats-label">已发布</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon draft">
                <el-icon><EditPen /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-number">{{ statistics.draft }}</div>
                <div class="stats-label">草稿</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon archived">
                <el-icon><Box /></el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-number">{{ statistics.archived }}</div>
                <div class="stats-label">已归档</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 搜索和筛选 -->
    <el-card class="filter-card">
      <div class="filter-section">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-input
              v-model="searchForm.keyword"
              placeholder="搜索试卷名称、描述..."
              clearable
              @input="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-col>
          <el-col :span="4">
            <el-select v-model="searchForm.subject" placeholder="选择科目" clearable @change="handleFilter">
              <el-option label="全部科目" value="" />
              <el-option label="数学" value="数学" />
              <el-option label="语文" value="语文" />
              <el-option label="英语" value="英语" />
              <el-option label="物理" value="物理" />
              <el-option label="化学" value="化学" />
              <el-option label="计算机" value="计算机" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-select v-model="searchForm.difficulty" placeholder="选择难度" clearable @change="handleFilter">
              <el-option label="全部难度" value="" />
              <el-option label="简单" value="简单" />
              <el-option label="中等" value="中等" />
              <el-option label="困难" value="困难" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-select v-model="searchForm.status" placeholder="选择状态" clearable @change="handleFilter">
              <el-option label="全部状态" value="" />
              <el-option label="草稿" value="草稿" />
              <el-option label="已发布" value="已发布" />
              <el-option label="已归档" value="已归档" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
          </el-col>
        </el-row>

        <div class="filter-actions">
          <div class="view-mode">
            <span>视图模式：</span>
            <el-radio-group v-model="viewMode" size="small">
              <el-radio-button label="card">卡片</el-radio-button>
              <el-radio-button label="table">表格</el-radio-button>
            </el-radio-group>
          </div>
          <div class="sort-options">
            <span>排序：</span>
            <el-select v-model="sortBy" size="small" @change="handleSort">
              <el-option label="创建时间" value="createTime" />
              <el-option label="更新时间" value="updateTime" />
              <el-option label="试卷名称" value="title" />
              <el-option label="题目数量" value="questionCount" />
            </el-select>
            <el-button size="small" @click="toggleSortOrder">
              <el-icon v-if="sortOrder === 'desc'"><SortDown /></el-icon>
              <el-icon v-else><SortUp /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 批量操作栏 -->
    <div v-if="selectedPapers.length > 0" class="batch-operations">
      <div class="batch-info">
        <span>已选择 {{ selectedPapers.length }} 份试卷</span>
      </div>
      <div class="batch-actions">
        <el-button size="small" @click="batchPublish" :disabled="!canBatchPublish">
          <el-icon><Promotion /></el-icon>
          批量发布
        </el-button>
        <el-button size="small" @click="batchArchive">
          <el-icon><Box /></el-icon>
          批量归档
        </el-button>
        <el-button size="small" @click="batchExport">
          <el-icon><Download /></el-icon>
          批量导出
        </el-button>
        <el-button size="small" type="danger" @click="batchDelete">
          <el-icon><Delete /></el-icon>
          批量删除
        </el-button>
        <el-button size="small" @click="clearSelection">取消选择</el-button>
      </div>
    </div>

    <!-- 试卷列表 - 卡片视图 -->
    <div v-if="viewMode === 'card'" class="papers-grid">
      <el-row :gutter="20">
        <el-col :span="8" v-for="paper in filteredPapers" :key="paper.id">
          <el-card class="paper-card" :class="{ 'selected': selectedPapers.includes(paper.id) }">
            <template #header>
              <div class="card-header">
                <el-checkbox
                  v-model="selectedPapers"
                  :label="paper.id"
                  @change="handleSelectionChange"
                />
                <el-tag :type="getStatusType(paper.status)" size="small">
                  {{ paper.status }}
                </el-tag>
                <el-dropdown @command="handleCardAction">
                  <el-button size="small" text>
                    <el-icon><MoreFilled /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item :command="{action: 'edit', paper}">
                        <el-icon><Edit /></el-icon>
                        编辑
                      </el-dropdown-item>
                      <el-dropdown-item :command="{action: 'preview', paper}">
                        <el-icon><View /></el-icon>
                        预览
                      </el-dropdown-item>
                      <el-dropdown-item :command="{action: 'copy', paper}">
                        <el-icon><CopyDocument /></el-icon>
                        复制
                      </el-dropdown-item>
                      <el-dropdown-item :command="{action: 'export', paper}">
                        <el-icon><Download /></el-icon>
                        导出
                      </el-dropdown-item>
                      <el-dropdown-item :command="{action: 'delete', paper}" divided>
                        <el-icon><Delete /></el-icon>
                        删除
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </template>

            <div class="paper-info" @click="viewPaper(paper)">
              <h3 class="paper-title">{{ paper.title }}</h3>
              <div class="paper-meta">
                <div class="meta-item">
                  <el-icon><Collection /></el-icon>
                  <span>{{ paper.subject }}</span>
                </div>
                <div class="meta-item">
                  <el-icon><Star /></el-icon>
                  <span>{{ paper.difficulty }}</span>
                </div>
                <div class="meta-item">
                  <el-icon><DocumentChecked /></el-icon>
                  <span>{{ paper.questionCount }}题</span>
                </div>
                <div class="meta-item">
                  <el-icon><Timer /></el-icon>
                  <span>{{ paper.estimatedTime }}分钟</span>
                </div>
              </div>
              <p class="paper-description">{{ paper.description || '暂无描述' }}</p>
              <div class="paper-stats">
                <div class="stat-item">
                  <span class="stat-label">总分：</span>
                  <span class="stat-value">{{ paper.totalScore }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">使用次数：</span>
                  <span class="stat-value">{{ paper.usageCount }}</span>
                </div>
              </div>
            </div>

            <template #footer>
              <div class="card-footer">
                <div class="time-info">
                  <div class="create-time">创建：{{ formatDate(paper.createTime) }}</div>
                  <div class="update-time">更新：{{ formatDate(paper.updateTime) }}</div>
                </div>
                <div class="card-actions">
                  <el-button size="small" type="primary" @click="editPaper(paper)">
                    <el-icon><Edit /></el-icon>
                    编辑
                  </el-button>
                  <el-button v-if="paper.status === '草稿'" size="small" type="success" @click="publishPaper(paper)">
                    <el-icon><Promotion /></el-icon>
                    发布
                  </el-button>
                  <el-button v-else-if="paper.status === '已发布'" size="small" type="warning" @click="archivePaper(paper)">
                    <el-icon><Box /></el-icon>
                    归档
                  </el-button>
                </div>
              </div>
            </template>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 试卷列表 - 表格视图 -->
    <div v-if="viewMode === 'table'" class="papers-table">
      <el-table
        :data="filteredPapers"
        style="width: 100%"
        @selection-change="handleTableSelectionChange"
        row-key="id"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="title" label="试卷名称" min-width="200">
          <template #default="{ row }">
            <div class="table-title">
              <span class="title-text" @click="viewPaper(row)">{{ row.title }}</span>
              <el-tag :type="getStatusType(row.status)" size="small">{{ row.status }}</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="subject" label="科目" width="100" />
        <el-table-column prop="difficulty" label="难度" width="100" />
        <el-table-column prop="questionCount" label="题目数" width="100" />
        <el-table-column prop="totalScore" label="总分" width="100" />
        <el-table-column prop="estimatedTime" label="用时(分钟)" width="120" />
        <el-table-column prop="usageCount" label="使用次数" width="120" />
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="editPaper(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button size="small" @click="previewPaper(row)">
              <el-icon><View /></el-icon>
              预览
            </el-button>
            <el-dropdown @command="handleTableAction">
              <el-button size="small">
                更多
                <el-icon><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item :command="{action: 'copy', paper: row}">
                    <el-icon><CopyDocument /></el-icon>
                    复制
                  </el-dropdown-item>
                  <el-dropdown-item :command="{action: 'export', paper: row}">
                    <el-icon><Download /></el-icon>
                    导出
                  </el-dropdown-item>
                  <el-dropdown-item v-if="row.status === '草稿'" :command="{action: 'publish', paper: row}">
                    <el-icon><Promotion /></el-icon>
                    发布
                  </el-dropdown-item>
                  <el-dropdown-item v-if="row.status === '已发布'" :command="{action: 'archive', paper: row}">
                    <el-icon><Box /></el-icon>
                    归档
                  </el-dropdown-item>
                  <el-dropdown-item :command="{action: 'delete', paper: row}" divided>
                    <el-icon><Delete /></el-icon>
                    删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="totalCount"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 预览对话框 -->
    <el-dialog v-model="showPreviewDialog" title="试卷预览" width="900px" top="5vh">
      <div v-if="previewPaperData" class="paper-preview">
        <div class="preview-header">
          <h2>{{ previewPaperData.title }}</h2>
          <div class="preview-info">
            <span>科目：{{ previewPaperData.subject }}</span>
            <span>难度：{{ previewPaperData.difficulty }}</span>
            <span>总分：{{ previewPaperData.totalScore }}分</span>
            <span>时间：{{ previewPaperData.estimatedTime }}分钟</span>
          </div>
        </div>
        <div class="preview-description">
          <p>{{ previewPaperData.description }}</p>
        </div>
        <div class="preview-questions">
          <div v-for="(question, index) in previewPaperData.questions" :key="question.id" class="preview-question">
            <div class="question-header">
              <span class="question-number">{{ index + 1 }}.</span>
              <span class="question-type">[{{ question.type }}]</span>
              <span class="question-score">({{ question.score }}分)</span>
            </div>
            <div class="question-content">{{ question.content }}</div>
            <div v-if="question.options" class="question-options">
              <div v-for="(option, optIndex) in question.options" :key="optIndex" class="option-item">
                {{ String.fromCharCode(65 + optIndex) }}. {{ option }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 创建试卷对话框 -->
    <el-dialog v-model="showCreateDialog" title="创建试卷" width="600px">
      <el-form :model="createForm" :rules="createRules" ref="createFormRef" label-width="100px">
        <el-form-item label="试卷名称" prop="title">
          <el-input v-model="createForm.title" placeholder="请输入试卷名称" />
        </el-form-item>
        <el-form-item label="科目" prop="subject">
          <el-select v-model="createForm.subject" placeholder="请选择科目" style="width: 100%;">
            <el-option label="数学" value="数学" />
            <el-option label="语文" value="语文" />
            <el-option label="英语" value="英语" />
            <el-option label="物理" value="物理" />
            <el-option label="化学" value="化学" />
            <el-option label="计算机" value="计算机" />
          </el-select>
        </el-form-item>
        <el-form-item label="难度等级" prop="difficulty">
          <el-select v-model="createForm.difficulty" placeholder="请选择难度" style="width: 100%;">
            <el-option label="简单" value="简单" />
            <el-option label="中等" value="中等" />
            <el-option label="困难" value="困难" />
          </el-select>
        </el-form-item>
        <el-form-item label="试卷描述">
          <el-input v-model="createForm.description" type="textarea" :rows="3" placeholder="请输入试卷描述（选填）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button type="primary" @click="confirmCreate" :loading="creating">创建</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()
import {
  Plus, Upload, Document, Check, EditPen, Box, Search, SortDown, SortUp,
  Promotion, Download, Delete, MoreFilled, Edit, View, CopyDocument,
  Collection, Star, DocumentChecked, Timer, ArrowDown
} from '@element-plus/icons-vue'

// 响应式数据
const viewMode = ref('card')
const currentPage = ref(1)
const pageSize = ref(20)
const totalCount = ref(0)
const selectedPapers = ref([])
const sortBy = ref('updateTime')
const sortOrder = ref('desc')
const showPreviewDialog = ref(false)
const showCreateDialog = ref(false)
const previewPaperData = ref(null)
const creating = ref(false)

// 表单引用
const createFormRef = ref()

// 搜索表单
const searchForm = reactive({
  keyword: '',
  subject: '',
  difficulty: '',
  status: ''
})

// 创建表单
const createForm = reactive({
  title: '',
  subject: '',
  difficulty: '',
  description: ''
})

// 创建表单验证规则
const createRules = {
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

// 统计数据
const statistics = reactive({
  total: 156,
  published: 89,
  draft: 45,
  archived: 22
})

// 模拟试卷数据
const papers = ref([
  {
    id: 1,
    title: '高等数学期末考试试卷',
    subject: '数学',
    difficulty: '困难',
    status: '已发布',
    questionCount: 25,
    totalScore: 100,
    estimatedTime: 120,
    usageCount: 156,
    description: '涵盖微积分、线性代数等核心知识点',
    createTime: '2024-01-15 10:30:00',
    updateTime: '2024-01-20 14:20:00',
    questions: [
      {
        id: 1,
        type: '选择题',
        score: 4,
        content: '函数f(x) = x² + 2x + 1的最小值是？',
        options: ['0', '1', '-1', '2']
      },
      {
        id: 2,
        type: '填空题',
        score: 6,
        content: '极限lim(x→0) (sin x)/x = ______'
      }
    ]
  },
  {
    id: 2,
    title: '计算机网络基础测试',
    subject: '计算机',
    difficulty: '中等',
    status: '草稿',
    questionCount: 20,
    totalScore: 80,
    estimatedTime: 90,
    usageCount: 0,
    description: '计算机网络协议、体系结构相关内容',
    createTime: '2024-01-18 09:15:00',
    updateTime: '2024-01-18 16:45:00',
    questions: []
  },
  {
    id: 3,
    title: '英语阅读理解专项练习',
    subject: '英语',
    difficulty: '中等',
    status: '已发布',
    questionCount: 15,
    totalScore: 75,
    estimatedTime: 60,
    usageCount: 89,
    description: '提高英语阅读理解能力的专项训练',
    createTime: '2024-01-10 14:20:00',
    updateTime: '2024-01-22 11:30:00',
    questions: []
  },
  {
    id: 4,
    title: '物理力学综合测试',
    subject: '物理',
    difficulty: '困难',
    status: '已归档',
    questionCount: 18,
    totalScore: 90,
    estimatedTime: 100,
    usageCount: 234,
    description: '力学基础知识综合应用',
    createTime: '2023-12-05 16:00:00',
    updateTime: '2024-01-05 10:15:00',
    questions: []
  },
  {
    id: 5,
    title: '化学有机化合物测试',
    subject: '化学',
    difficulty: '简单',
    status: '已发布',
    questionCount: 22,
    totalScore: 85,
    estimatedTime: 75,
    usageCount: 67,
    description: '有机化学基础知识点测试',
    createTime: '2024-01-12 11:45:00',
    updateTime: '2024-01-19 09:20:00',
    questions: []
  },
  {
    id: 6,
    title: '语文古诗词鉴赏',
    subject: '语文',
    difficulty: '中等',
    status: '草稿',
    questionCount: 12,
    totalScore: 60,
    estimatedTime: 45,
    usageCount: 0,
    description: '古诗词理解与鉴赏能力测试',
    createTime: '2024-01-20 15:30:00',
    updateTime: '2024-01-21 10:10:00',
    questions: []
  }
])

// 计算属性
const filteredPapers = computed(() => {
  let result = [...papers.value]

  // 关键词搜索
  if (searchForm.keyword) {
    const keyword = searchForm.keyword.toLowerCase()
    result = result.filter(paper =>
      paper.title.toLowerCase().includes(keyword) ||
      (paper.description && paper.description.toLowerCase().includes(keyword))
    )
  }

  // 科目筛选
  if (searchForm.subject) {
    result = result.filter(paper => paper.subject === searchForm.subject)
  }

  // 难度筛选
  if (searchForm.difficulty) {
    result = result.filter(paper => paper.difficulty === searchForm.difficulty)
  }

  // 状态筛选
  if (searchForm.status) {
    result = result.filter(paper => paper.status === searchForm.status)
  }

  // 排序
  result.sort((a, b) => {
    let aValue = a[sortBy.value]
    let bValue = b[sortBy.value]

    if (sortBy.value.includes('Time')) {
      aValue = new Date(aValue)
      bValue = new Date(bValue)
    }

    if (sortOrder.value === 'desc') {
      return bValue > aValue ? 1 : -1
    } else {
      return aValue > bValue ? 1 : -1
    }
  })

  totalCount.value = result.length

  // 分页
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return result.slice(start, end)
})

const canBatchPublish = computed(() => {
  return selectedPapers.value.some(id => {
    const paper = papers.value.find(p => p.id === id)
    return paper && paper.status === '草稿'
  })
})

// 方法
const getStatusType = (status) => {
  const statusMap = {
    '草稿': 'warning',
    '已发布': 'success',
    '已归档': 'info'
  }
  return statusMap[status] || 'default'
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

const handleSearch = () => {
  currentPage.value = 1
}

const handleFilter = () => {
  currentPage.value = 1
}

const handleSort = () => {
  // 排序逻辑已在计算属性中处理
}

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
}

const handleSelectionChange = () => {
  // 选择逻辑已由v-model处理
}

const handleTableSelectionChange = (selection) => {
  selectedPapers.value = selection.map(item => item.id)
}

const clearSelection = () => {
  selectedPapers.value = []
}

const handleCardAction = ({ action, paper }) => {
  switch (action) {
    case 'edit':
      editPaper(paper)
      break
    case 'preview':
      previewPaper(paper)
      break
    case 'copy':
      copyPaper(paper)
      break
    case 'export':
      exportPaper(paper)
      break
    case 'delete':
      deletePaper(paper)
      break
  }
}

const handleTableAction = ({ action, paper }) => {
  switch (action) {
    case 'copy':
      copyPaper(paper)
      break
    case 'export':
      exportPaper(paper)
      break
    case 'publish':
      publishPaper(paper)
      break
    case 'archive':
      archivePaper(paper)
      break
    case 'delete':
      deletePaper(paper)
      break
  }
}

const createPaper = () => {
  showCreateDialog.value = true
}

const uploadPaper = () => {
  ElMessage.info('跳转到试卷上传页面')
  router.push("/exam/upload")
  // 这里可以路由跳转到上传页面

}

const confirmCreate = async () => {
  if (!createFormRef.value) return

  await createFormRef.value.validate((valid) => {
    if (valid) {
      creating.value = true

      // 模拟创建试卷
      setTimeout(() => {
        const newPaper = {
          id: Date.now(),
          title: createForm.title,
          subject: createForm.subject,
          difficulty: createForm.difficulty,
          status: '草稿',
          questionCount: 0,
          totalScore: 0,
          estimatedTime: 60,
          usageCount: 0,
          description: createForm.description,
          createTime: new Date().toLocaleString(),
          updateTime: new Date().toLocaleString(),
          questions: []
        }

        papers.value.unshift(newPaper)
        statistics.total++
        statistics.draft++

        creating.value = false
        showCreateDialog.value = false

        // 重置表单
        Object.assign(createForm, {
          title: '',
          subject: '',
          difficulty: '',
          description: ''
        })

        ElMessage.success('试卷创建成功')

        // 跳转到编辑页面
        editPaper(newPaper)
      }, 1500)
    }
  })
}

const viewPaper = (paper) => {
  previewPaper(paper)
}

const editPaper = (paper) => {
  ElMessage.info(`跳转到编辑试卷：${paper.title}`)
  // 这里可以路由跳转到编辑页面
}

const previewPaper = (paper) => {
  previewPaperData.value = paper
  showPreviewDialog.value = true
}

const copyPaper = async (paper) => {
  try {
    await ElMessageBox.confirm(
      `确定要复制试卷"${paper.title}"吗？`,
      '确认复制',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info',
      }
    )

    const copiedPaper = {
      ...paper,
      id: Date.now(),
      title: paper.title + ' (副本)',
      status: '草稿',
      usageCount: 0,
      createTime: new Date().toLocaleString(),
      updateTime: new Date().toLocaleString()
    }

    papers.value.unshift(copiedPaper)
    statistics.total++
    statistics.draft++

    ElMessage.success('试卷复制成功')
  } catch {
    ElMessage.info('已取消复制')
  }
}

const exportPaper = (paper) => {
  ElMessage.info(`导出试卷：${paper.title}`)
  // 这里可以实现试卷导出功能
}

const publishPaper = async (paper) => {
  if (paper.questionCount === 0) {
    ElMessage.warning('试卷没有题目，无法发布')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要发布试卷"${paper.title}"吗？`,
      '确认发布',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    paper.status = '已发布'
    paper.updateTime = new Date().toLocaleString()
    statistics.published++
    statistics.draft--

    ElMessage.success('试卷发布成功')
  } catch {
    ElMessage.info('已取消发布')
  }
}

const archivePaper = async (paper) => {
  try {
    await ElMessageBox.confirm(
      `确定要归档试卷"${paper.title}"吗？归档后试卷将不再可用。`,
      '确认归档',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    paper.status = '已归档'
    paper.updateTime = new Date().toLocaleString()
    statistics.archived++
    statistics.published--

    ElMessage.success('试卷归档成功')
  } catch {
    ElMessage.info('已取消归档')
  }
}

const deletePaper = async (paper) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除试卷"${paper.title}"吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error',
      }
    )

    const index = papers.value.findIndex(p => p.id === paper.id)
    if (index > -1) {
      papers.value.splice(index, 1)
      statistics.total--

      if (paper.status === '草稿') statistics.draft--
      else if (paper.status === '已发布') statistics.published--
      else if (paper.status === '已归档') statistics.archived--

      ElMessage.success('试卷删除成功')
    }
  } catch {
    ElMessage.info('已取消删除')
  }
}

const batchPublish = async () => {
  const draftPapers = selectedPapers.value.filter(id => {
    const paper = papers.value.find(p => p.id === id)
    return paper && paper.status === '草稿' && paper.questionCount > 0
  })

  if (draftPapers.length === 0) {
    ElMessage.warning('没有可发布的草稿试卷')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要发布选中的 ${draftPapers.length} 份试卷吗？`,
      '确认批量发布',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    draftPapers.forEach(id => {
      const paper = papers.value.find(p => p.id === id)
      if (paper) {
        paper.status = '已发布'
        paper.updateTime = new Date().toLocaleString()
        statistics.published++
        statistics.draft--
      }
    })

    selectedPapers.value = []
    ElMessage.success(`成功发布 ${draftPapers.length} 份试卷`)
  } catch {
    ElMessage.info('已取消批量发布')
  }
}

const batchArchive = async () => {
  const publishedPapers = selectedPapers.value.filter(id => {
    const paper = papers.value.find(p => p.id === id)
    return paper && paper.status === '已发布'
  })

  if (publishedPapers.length === 0) {
    ElMessage.warning('没有可归档的已发布试卷')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要归档选中的 ${publishedPapers.length} 份试卷吗？`,
      '确认批量归档',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    publishedPapers.forEach(id => {
      const paper = papers.value.find(p => p.id === id)
      if (paper) {
        paper.status = '已归档'
        paper.updateTime = new Date().toLocaleString()
        statistics.archived++
        statistics.published--
      }
    })

    selectedPapers.value = []
    ElMessage.success(`成功归档 ${publishedPapers.length} 份试卷`)
  } catch {
    ElMessage.info('已取消批量归档')
  }
}

const batchExport = () => {
  if (selectedPapers.value.length === 0) {
    ElMessage.warning('请先选择要导出的试卷')
    return
  }

  ElMessage.info(`批量导出 ${selectedPapers.value.length} 份试卷`)
  // 这里可以实现批量导出功能
}

const batchDelete = async () => {
  if (selectedPapers.value.length === 0) {
    ElMessage.warning('请先选择要删除的试卷')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedPapers.value.length} 份试卷吗？此操作不可恢复。`,
      '确认批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error',
      }
    )

    selectedPapers.value.forEach(id => {
      const index = papers.value.findIndex(p => p.id === id)
      if (index > -1) {
        const paper = papers.value[index]
        papers.value.splice(index, 1)
        statistics.total--

        if (paper.status === '草稿') statistics.draft--
        else if (paper.status === '已发布') statistics.published--
        else if (paper.status === '已归档') statistics.archived--
      }
    })

    selectedPapers.value = []
    ElMessage.success('批量删除成功')
  } catch {
    ElMessage.info('已取消批量删除')
  }
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page) => {
  currentPage.value = page
}

onMounted(() => {
  ElMessage.success('试卷管理系统加载完成')
})
</script>

<style scoped>
.paper-management {
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

.stats-cards {
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

.stats-icon.published {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stats-icon.draft {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stats-icon.archived {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
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

.filter-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.view-mode, .sort-options {
  display: flex;
  align-items: center;
  gap: 10px;
}

.batch-operations {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ecf5ff;
  padding: 15px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.batch-info {
  color: #409eff;
  font-weight: bold;
}

.batch-actions {
  display: flex;
  gap: 10px;
}

.papers-grid {
  margin-bottom: 30px;
}

.paper-card {
  margin-bottom: 20px;
  border-radius: 12px;
  transition: all 0.3s;
  cursor: pointer;
}

.paper-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.paper-card.selected {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.paper-info {
  padding: 10px 0;
}

.paper-title {
  margin: 0 0 15px 0;
  color: #303133;
  font-size: 18px;
  font-weight: bold;
  line-height: 1.4;
}

.paper-meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 15px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #606266;
  font-size: 14px;
}

.paper-description {
  color: #909399;
  font-size: 14px;
  line-height: 1.5;
  margin: 15px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.paper-stats {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
}

.stat-item {
  font-size: 14px;
}

.stat-label {
  color: #909399;
}

.stat-value {
  color: #303133;
  font-weight: bold;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.time-info {
  font-size: 12px;
  color: #909399;
}

.create-time, .update-time {
  margin-bottom: 2px;
}

.card-actions {
  display: flex;
  gap: 10px;
}

.papers-table {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 30px;
}

.table-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.title-text {
  cursor: pointer;
  color: #409eff;
  text-decoration: none;
}

.title-text:hover {
  text-decoration: underline;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.paper-preview {
  max-height: 600px;
  overflow-y: auto;
}

.preview-header {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #ebeef5;
}

.preview-header h2 {
  margin: 0 0 15px 0;
  color: #303133;
}

.preview-info {
  display: flex;
  justify-content: center;
  gap: 30px;
  color: #606266;
  flex-wrap: wrap;
}

.preview-description {
  margin-bottom: 30px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  color: #606266;
  line-height: 1.6;
}

.preview-question {
  margin-bottom: 25px;
  padding: 20px;
  background-color: #fafafa;
  border-radius: 8px;
}

.question-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  font-weight: bold;
}

.question-number {
  color: #409eff;
  margin-right: 10px;
  font-size: 16px;
}

.question-type {
  background-color: #e1f3d8;
  color: #67c23a;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  margin-right: 10px;
}

.question-score {
  color: #f56c6c;
  font-size: 14px;
}

.question-content {
  font-size: 15px;
  line-height: 1.6;
  margin-bottom: 15px;
  color: #303133;
}

.question-options {
  margin: 15px 0;
}

.option-item {
  padding: 5px 0;
  color: #606266;
  font-size: 14px;
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
}

@media (max-width: 768px) {
  .paper-management {
    padding: 10px;
  }

  .filter-actions {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .batch-operations {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .batch-actions {
    justify-content: center;
    flex-wrap: wrap;
  }

  .paper-meta {
    grid-template-columns: 1fr;
  }

  .card-footer {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .card-actions {
    justify-content: center;
  }

  .preview-info {
    flex-direction: column;
    gap: 10px;
  }
}
</style>