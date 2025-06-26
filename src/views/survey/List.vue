<template>
    <div class="survey-list">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-content">
          <h2 class="page-title">问卷调查</h2>
          <p class="page-description">创建和管理问卷调查，收集学生反馈和意见</p>
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="$router.push('/survey/create')">
            <el-icon><Plus /></el-icon>
            创建问卷
          </el-button>
        </div>
      </div>
  
      <!-- 统计卡片 -->
      <el-row :gutter="20" class="stats-row">
        <el-col :xs="12" :sm="6" :md="6" :lg="6">
          <div class="stat-card primary">
            <div class="stat-icon">
              <el-icon><List /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.total }}</div>
              <div class="stat-label">总问卷数</div>
            </div>
          </div>
        </el-col>
        
        <el-col :xs="12" :sm="6" :md="6" :lg="6">
          <div class="stat-card success">
            <div class="stat-icon">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.active }}</div>
              <div class="stat-label">进行中</div>
            </div>
          </div>
        </el-col>
        
        <el-col :xs="12" :sm="6" :md="6" :lg="6">
          <div class="stat-card warning">
            <div class="stat-icon">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.responses }}</div>
              <div class="stat-label">总回复数</div>
            </div>
          </div>
        </el-col>
        
        <el-col :xs="12" :sm="6" :md="6" :lg="6">
          <div class="stat-card danger">
            <div class="stat-icon">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.avgResponse }}%</div>
              <div class="stat-label">平均回复率</div>
            </div>
          </div>
        </el-col>
      </el-row>
  
      <!-- 搜索和筛选 -->
      <div class="search-section card">
        <el-form :model="searchForm" inline>
          <el-form-item label="问卷标题">
            <el-input
              v-model="searchForm.title"
              placeholder="请输入问卷标题"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="问卷状态">
            <el-select
              v-model="searchForm.status"
              placeholder="请选择状态"
              clearable
              style="width: 150px"
            >
              <el-option label="全部" value="" />
              <el-option label="草稿" value="draft" />
              <el-option label="进行中" value="active" />
              <el-option label="已结束" value="ended" />
            </el-select>
          </el-form-item>
          <el-form-item label="问卷类型">
            <el-select
              v-model="searchForm.type"
              placeholder="请选择类型"
              clearable
              style="width: 150px"
            >
              <el-option label="全部" value="" />
              <el-option label="课程评价" value="course" />
              <el-option label="教学反馈" value="teaching" />
              <el-option label="满意度调查" value="satisfaction" />
              <el-option label="其他" value="other" />
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
  
      <!-- 问卷列表 -->
      <div class="survey-grid">
        <div
          v-for="survey in surveyList"
          :key="survey.id"
          class="survey-card"
          @click="viewSurvey(survey)"
        >
          <div class="survey-header">
            <div class="survey-status" :class="survey.status">
              {{ getStatusText(survey.status) }}
            </div>
            <div class="survey-type">
              <el-tag :type="getTypeColor(survey.type)" size="small">
                {{ getTypeText(survey.type) }}
              </el-tag>
            </div>
          </div>
          
          <div class="survey-content">
            <h3 class="survey-title">{{ survey.title }}</h3>
            <p class="survey-description">{{ survey.description }}</p>
            
            <div class="survey-meta">
              <div class="meta-item">
                <el-icon><Calendar /></el-icon>
                <span>{{ formatDate(survey.startTime) }} - {{ formatDate(survey.endTime) }}</span>
              </div>
              <div class="meta-item">
                <el-icon><User /></el-icon>
                <span>{{ survey.responseCount }}/{{ survey.targetCount }} 人参与</span>
              </div>
              <div class="meta-item">
                <el-icon><Document /></el-icon>
                <span>{{ survey.questionCount }} 个问题</span>
              </div>
            </div>
            
            <div class="survey-progress">
              <div class="progress-info">
                <span>参与率</span>
                <span>{{ getResponseRate(survey) }}%</span>
              </div>
              <el-progress
                :percentage="getResponseRate(survey)"
                :stroke-width="6"
                :show-text="false"
                :color="getProgressColor(getResponseRate(survey))"
              />
            </div>
          </div>
          
          <div class="survey-actions">
            <el-button
              type="text"
              size="small"
              @click.stop="editSurvey(survey)"
            >
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button
              type="text"
              size="small"
              @click.stop="viewResults(survey)"
              :disabled="survey.responseCount === 0"
            >
              <el-icon><TrendCharts /></el-icon>
              结果
            </el-button>
            <el-button
              type="text"
              size="small"
              @click.stop="shareSurvey(survey)"
            >
              <el-icon><Share /></el-icon>
              分享
            </el-button>
            <el-dropdown @command="handleSurveyAction" @click.stop>
              <el-button type="text" size="small">
                <el-icon><MoreFilled /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item :command="{action: 'copy', survey}">
                    <el-icon><CopyDocument /></el-icon>复制问卷
                  </el-dropdown-item>
                  <el-dropdown-item :command="{action: 'export', survey}">
                    <el-icon><Download /></el-icon>导出数据
                  </el-dropdown-item>
                  <el-dropdown-item
                    :command="{action: 'delete', survey}"
                    divided
                  >
                    <el-icon><Delete /></el-icon>删除问卷
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
  
      <!-- 问卷详情对话框 -->
      <el-dialog
        v-model="surveyDetailVisible"
        :title="selectedSurvey?.title"
        width="800px"
        destroy-on-close
      >
        <div v-if="selectedSurvey" class="survey-detail">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="问卷标题">
              {{ selectedSurvey.title }}
            </el-descriptions-item>
            <el-descriptions-item label="问卷类型">
              <el-tag :type="getTypeColor(selectedSurvey.type)">
                {{ getTypeText(selectedSurvey.type) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="问卷状态">
              <el-tag :type="getStatusType(selectedSurvey.status)">
                {{ getStatusText(selectedSurvey.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="问题数量">
              {{ selectedSurvey.questionCount }}
            </el-descriptions-item>
            <el-descriptions-item label="开始时间">
              {{ formatDate(selectedSurvey.startTime) }}
            </el-descriptions-item>
            <el-descriptions-item label="结束时间">
              {{ formatDate(selectedSurvey.endTime) }}
            </el-descriptions-item>
            <el-descriptions-item label="目标人数">
              {{ selectedSurvey.targetCount }}
            </el-descriptions-item>
            <el-descriptions-item label="参与人数">
              {{ selectedSurvey.responseCount }}
            </el-descriptions-item>
            <el-descriptions-item label="问卷描述" :span="2">
              {{ selectedSurvey.description }}
            </el-descriptions-item>
          </el-descriptions>
          
          <div class="survey-stats">
            <h4>参与统计</h4>
            <el-row :gutter="20">
              <el-col :span="8">
                <div class="stat-item">
                  <div class="stat-number">{{ getResponseRate(selectedSurvey) }}%</div>
                  <div class="stat-label">参与率</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="stat-item">
                  <div class="stat-number">{{ selectedSurvey.responseCount }}</div>
                  <div class="stat-label">已参与</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="stat-item">
                  <div class="stat-number">{{ selectedSurvey.targetCount - selectedSurvey.responseCount }}</div>
                  <div class="stat-label">未参与</div>
                </div>
              </el-col>
            </el-row>
          </div>
        </div>
        
        <template #footer>
          <el-button @click="surveyDetailVisible = false">关闭</el-button>
          <el-button type="primary" @click="editSurvey(selectedSurvey)">
            编辑问卷
          </el-button>
        </template>
      </el-dialog>
  
      <!-- 分享对话框 -->
      <el-dialog
        v-model="shareVisible"
        title="分享问卷"
        width="500px"
      >
        <div class="share-content">
          <div class="share-item">
            <h4>问卷链接</h4>
            <el-input
              v-model="shareUrl"
              readonly
              class="share-input"
            >
              <template #append>
                <el-button @click="copyShareUrl">复制</el-button>
              </template>
            </el-input>
          </div>
          
          <div class="share-item">
            <h4>二维码</h4>
            <div class="qr-code">
              <div class="qr-placeholder">
                <el-icon size="64"><QrCode /></el-icon>
                <p>扫码参与问卷</p>
              </div>
            </div>
          </div>
        </div>
        
        <template #footer>
          <el-button @click="shareVisible = false">关闭</el-button>
          <el-button type="primary" @click="copyShareUrl">
            复制链接
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
    name: 'SurveyList',
    setup() {
      const router = useRouter()
  
      // 统计数据
      const stats = reactive({
        total: 24,
        active: 8,
        responses: 1256,
        avgResponse: 78
      })
  
      // 搜索表单
      const searchForm = reactive({
        title: '',
        status: '',
        type: ''
      })
  
      // 分页信息
      const pagination = reactive({
        currentPage: 1,
        pageSize: 12,
        total: 0
      })
  
      // 问卷列表
      const surveyList = ref([])
      
      // 选中的问卷
      const selectedSurvey = ref(null)
      const surveyDetailVisible = ref(false)
  
      // 分享相关
      const shareVisible = ref(false)
      const shareUrl = ref('')
  
      // 模拟问卷数据
      const mockSurveys = [
        {
          id: 1,
          title: 'Web前端开发课程满意度调查',
          description: '请对本学期的Web前端开发课程进行评价，您的意见对我们很重要',
          type: 'course',
          status: 'active',
          questionCount: 15,
          targetCount: 45,
          responseCount: 32,
          startTime: '2024-06-20 09:00:00',
          endTime: '2024-07-20 23:59:59',
          createTime: '2024-06-19 14:30:00'
        },
        {
          id: 2,
          title: '在线教学效果反馈调查',
          description: '收集学生对在线教学模式的反馈和建议',
          type: 'teaching',
          status: 'active',
          questionCount: 12,
          targetCount: 120,
          responseCount: 89,
          startTime: '2024-06-15 08:00:00',
          endTime: '2024-07-15 23:59:59',
          createTime: '2024-06-14 10:20:00'
        },
        {
          id: 3,
          title: '数据结构课程难度调查',
          description: '了解学生对数据结构课程难度的感受',
          type: 'course',
          status: 'ended',
          questionCount: 8,
          targetCount: 38,
          responseCount: 35,
          startTime: '2024-05-01 09:00:00',
          endTime: '2024-05-31 23:59:59',
          createTime: '2024-04-30 16:45:00'
        },
        {
          id: 4,
          title: '教学服务满意度调查',
          description: '评价教学服务质量，包括课程安排、教师服务等',
          type: 'satisfaction',
          status: 'draft',
          questionCount: 20,
          targetCount: 200,
          responseCount: 0,
          startTime: '2024-07-01 09:00:00',
          endTime: '2024-07-31 23:59:59',
          createTime: '2024-06-25 11:30:00'
        },
        {
          id: 5,
          title: '实验课程改进建议收集',
          description: '收集学生对实验课程的改进建议',
          type: 'other',
          status: 'active',
          questionCount: 10,
          targetCount: 60,
          responseCount: 23,
          startTime: '2024-06-10 09:00:00',
          endTime: '2024-07-10 23:59:59',
          createTime: '2024-06-09 13:15:00'
        },
        {
          id: 6,
          title: '期末考试安排意见调查',
          description: '收集学生对期末考试时间安排的意见',
          type: 'other',
          status: 'ended',
          questionCount: 6,
          targetCount: 150,
          responseCount: 142,
          startTime: '2024-05-15 09:00:00',
          endTime: '2024-05-25 23:59:59',
          createTime: '2024-05-14 09:00:00'
        }
      ]
  
      // 获取状态文本
      const getStatusText = (status) => {
        const statusMap = {
          draft: '草稿',
          active: '进行中',
          ended: '已结束'
        }
        return statusMap[status] || '未知'
      }
  
      // 获取状态类型
      const getStatusType = (status) => {
        const typeMap = {
          draft: 'info',
          active: 'success',
          ended: 'warning'
        }
        return typeMap[status] || 'info'
      }
  
      // 获取类型文本
      const getTypeText = (type) => {
        const typeMap = {
          course: '课程评价',
          teaching: '教学反馈',
          satisfaction: '满意度调查',
          other: '其他'
        }
        return typeMap[type] || '未知'
      }
  
      // 获取类型颜色
      const getTypeColor = (type) => {
        const colorMap = {
          course: 'primary',
          teaching: 'success',
          satisfaction: 'warning',
          other: 'info'
        }
        return colorMap[type] || 'info'
      }
  
      // 获取参与率
      const getResponseRate = (survey) => {
        if (survey.targetCount === 0) return 0
        return Math.round((survey.responseCount / survey.targetCount) * 100)
      }
  
      // 获取进度条颜色
      const getProgressColor = (percentage) => {
        if (percentage < 30) return '#f56c6c'
        if (percentage < 70) return '#e6a23c'
        return '#67c23a'
      }
  
      // 搜索问卷
      const handleSearch = () => {
        loadSurveyList()
      }
  
      // 重置搜索
      const handleReset = () => {
        Object.keys(searchForm).forEach(key => {
          searchForm[key] = ''
        })
        loadSurveyList()
      }
  
      // 查看问卷详情
      const viewSurvey = (survey) => {
        selectedSurvey.value = survey
        surveyDetailVisible.value = true
      }
  
      // 编辑问卷
      const editSurvey = (survey) => {
        router.push(`/survey/edit/${survey.id}`)
      }
  
      // 查看结果
      const viewResults = (survey) => {
        router.push(`/survey/result/${survey.id}`)
      }
  
      // 分享问卷
      const shareSurvey = (survey) => {
        shareUrl.value = `${window.location.origin}/survey/participate/${survey.id}`
        shareVisible.value = true
      }
  
      // 复制分享链接
      const copyShareUrl = () => {
        navigator.clipboard.writeText(shareUrl.value).then(() => {
          ElMessage.success('链接已复制到剪贴板')
          shareVisible.value = false
        }).catch(() => {
          ElMessage.error('复制失败')
        })
      }
  
      // 处理问卷操作
      const handleSurveyAction = ({ action, survey }) => {
        switch (action) {
          case 'copy':
            handleCopySurvey(survey)
            break
          case 'export':
            handleExportSurvey(survey)
            break
          case 'delete':
            handleDeleteSurvey(survey)
            break
        }
      }
  
      // 复制问卷
      const handleCopySurvey = (survey) => {
        ElMessage.success(`问卷 "${survey.title}" 复制成功`)
      }
  
      // 导出问卷
      const handleExportSurvey = (survey) => {
        ElMessage.success(`问卷 "${survey.title}" 数据导出成功`)
      }
  
      // 删除问卷
      const handleDeleteSurvey = (survey) => {
        ElMessageBox.confirm(
          `确定要删除问卷 "${survey.title}" 吗？此操作不可恢复。`,
          '删除确认',
          {
            confirmButtonText: '确定删除',
            cancelButtonText: '取消',
            type: 'warning'
          }
        ).then(() => {
          const index = surveyList.value.findIndex(s => s.id === survey.id)
          if (index > -1) {
            surveyList.value.splice(index, 1)
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
        loadSurveyList()
      }
  
      // 当前页改变
      const handleCurrentChange = (page) => {
        pagination.currentPage = page
        loadSurveyList()
      }
  
      // 加载问卷列表
      const loadSurveyList = () => {
        // 模拟API调用
        let filteredSurveys = [...mockSurveys]
  
        // 应用搜索过滤
        if (searchForm.title) {
          filteredSurveys = filteredSurveys.filter(survey =>
            survey.title.toLowerCase().includes(searchForm.title.toLowerCase())
          )
        }
        if (searchForm.status) {
          filteredSurveys = filteredSurveys.filter(survey =>
            survey.status === searchForm.status
          )
        }
        if (searchForm.type) {
          filteredSurveys = filteredSurveys.filter(survey =>
            survey.type === searchForm.type
          )
        }
  
        // 分页处理
        const start = (pagination.currentPage - 1) * pagination.pageSize
        const end = start + pagination.pageSize
        
        surveyList.value = filteredSurveys.slice(start, end)
        pagination.total = filteredSurveys.length
      }
  
      onMounted(() => {
        loadSurveyList()
      })
  
      return {
        stats,
        searchForm,
        pagination,
        surveyList,
        selectedSurvey,
        surveyDetailVisible,
        shareVisible,
        shareUrl,
        getStatusText,
        getStatusType,
        getTypeText,
        getTypeColor,
        getResponseRate,
        getProgressColor,
        handleSearch,
        handleReset,
        viewSurvey,
        editSurvey,
        viewResults,
        shareSurvey,
        copyShareUrl,
        handleSurveyAction,
        handleSizeChange,
        handleCurrentChange,
        formatDate
      }
    }
  }
  </script>
  
  <style scoped>
  .survey-list {
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
  
  .stats-row {
    margin-bottom: 20px;
  }
  
  .stat-card {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    display: flex;
    align-items: center;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
    transition: transform 0.3s, box-shadow 0.3s;
  }
  
  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px 0 rgba(0,0,0,.15);
  }
  
  .stat-card.primary {
    border-left: 4px solid #409eff;
  }
  
  .stat-card.success {
    border-left: 4px solid #67c23a;
  }
  
  .stat-card.warning {
    border-left: 4px solid #e6a23c;
  }
  
  .stat-card.danger {
    border-left: 4px solid #f56c6c;
  }
  
  .stat-icon {
    font-size: 32px;
    margin-right: 16px;
    opacity: 0.8;
  }
  
  .stat-card.primary .stat-icon {
    color: #409eff;
  }
  
  .stat-card.success .stat-icon {
    color: #67c23a;
  }
  
  .stat-card.warning .stat-icon {
    color: #e6a23c;
  }
  
  .stat-card.danger .stat-icon {
    color: #f56c6c;
  }
  
  .stat-content .stat-number {
    font-size: 28px;
    font-weight: bold;
    color: #303133;
    margin-bottom: 4px;
  }
  
  .stat-content .stat-label {
    font-size: 14px;
    color: #909399;
  }
  
  .search-section {
    margin-bottom: 20px;
  }
  
  .survey-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 20px;
    margin-bottom: 20px;
  }
  
  .survey-card {
    background: #fff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
    transition: all 0.3s;
    cursor: pointer;
    position: relative;
  }
  
  .survey-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px 0 rgba(0,0,0,.15);
  }
  
  .survey-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px 0;
  }
  
  .survey-status {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
    color: #fff;
  }
  
  .survey-status.draft {
    background: #909399;
  }
  
  .survey-status.active {
    background: #67c23a;
  }
  
  .survey-status.ended {
    background: #e6a23c;
  }
  
  .survey-content {
    padding: 16px 20px;
  }
  
  .survey-title {
    margin: 0 0 8px 0;
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    line-height: 1.4;
  }
  
  .survey-description {
    margin: 0 0 16px 0;
    color: #606266;
    font-size: 14px;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .survey-meta {
    margin-bottom: 16px;
  }
  
  .meta-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #909399;
    margin-bottom: 4px;
  }
  
  .survey-progress {
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
  
  .survey-actions {
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
  
  .survey-detail {
    padding: 20px 0;
  }
  
  .survey-stats {
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid #f0f0f0;
  }
  
  .survey-stats h4 {
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
  
  .share-content {
    padding: 20px 0;
  }
  
  .share-item {
    margin-bottom: 24px;
  }
  
  .share-item h4 {
    margin: 0 0 12px 0;
    font-size: 16px;
    color: #303133;
  }
  
  .share-input {
    width: 100%;
  }
  
  .qr-code {
    display: flex;
    justify-content: center;
  }
  
  .qr-placeholder {
    text-align: center;
    padding: 40px;
    border: 2px dashed #dcdfe6;
    border-radius: 8px;
    color: #909399;
  }
  
  .qr-placeholder p {
    margin: 8px 0 0 0;
    font-size: 14px;
  }
  
  /* 响应式设计 */
  @media (max-width: 768px) {
    .page-header {
      flex-direction: column;
      gap: 16px;
    }
  
    .survey-grid {
      grid-template-columns: 1fr;
    }
  
    .search-section .el-form {
      flex-direction: column;
    }
  
    .search-section .el-form-item {
      margin-right: 0;
      margin-bottom: 16px;
    }
  
    .survey-actions {
      flex-wrap: wrap;
      gap: 8px;
    }
  }
  </style>