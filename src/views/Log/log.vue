<template>
  <div class="log-management">
    <div class="page-header">
      <h2>{{ isAdmin ? '操作日志管理' : '我的操作日志' }}</h2>
      <div class="header-actions">
        <el-button v-if="isAdmin" type="success" @click="showAddLogDialog">
          <el-icon><Plus /></el-icon>
          添加日志
        </el-button>
        <el-button v-if="isAdmin" type="primary" @click="exportLogs">
          <el-icon><Download /></el-icon>
          导出日志
        </el-button>
        <el-button @click="refreshLogs">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 筛选条件 -->
    <div class="filter-section">
      <el-form :model="filterForm" inline>
        <el-form-item v-if="isAdmin" label="操作人员">
          <el-input v-model="filterForm.staffId" placeholder="输入操作人员编号" clearable />
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
        <el-form-item label="操作内容">
          <el-input v-model="filterForm.operationContent" placeholder="输入操作内容关键词" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter">筛选</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
      <!-- 筛选结果提示 -->
      <div v-if="hasActiveFilters" class="filter-result-tip">
        <el-tag type="info" size="small">
          当前筛选结果: {{ logList.length }} 条记录
          <span v-if="originalLogList.length > 0">
            (共 {{ originalLogList.length }} 条)
          </span>
        </el-tag>
      </div>
      <!-- 教师模式提示 -->
      <div v-if="isTeacher" class="teacher-mode-tip">
        <el-tag type="warning" size="small">
          <el-icon><InfoFilled /></el-icon>
          教师模式：只能查看自己的操作日志
        </el-tag>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="stats-section">
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="stat-card">
            <div class="stat-number">{{ stats.totalLogs }}</div>
            <div class="stat-label">{{ isAdmin ? '总日志数' : '我的日志数' }}</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="stat-card">
            <div class="stat-number">{{ stats.todayLogs }}</div>
            <div class="stat-label">{{ isAdmin ? '今日日志' : '今日操作' }}</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="stat-card">
            <div class="stat-number">{{ stats.activeUsers }}</div>
            <div class="stat-label">{{ isAdmin ? '活跃用户' : '操作类型' }}</div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 日志列表 -->
    <div class="log-table">
      <el-table
        :data="paginatedLogList"
        v-loading="loading"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="logId" label="日志ID" width="280" />
        <el-table-column prop="staffId" label="操作人员" width="120" />
        <el-table-column prop="operationContent" label="操作内容" min-width="300" />
        <el-table-column prop="operationTime" label="操作时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.operationTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="text" size="small" @click="viewLogDetail(row)">
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 添加日志对话框 -->
    <el-dialog
      v-model="addLogDialogVisible"
      title="添加操作日志"
      width="500px"
    >
      <el-form :model="addLogForm" :rules="addLogRules" ref="addLogFormRef" label-width="100px">
        <el-form-item v-if="isAdmin" label="操作人员" prop="staffId">
          <el-input v-model="addLogForm.staffId" placeholder="请输入操作人员编号" />
        </el-form-item>
        <el-form-item v-else label="操作人员">
          <el-input v-model="addLogForm.staffId" disabled />
        </el-form-item>
        <el-form-item label="操作内容" prop="operationContent">
          <el-input
            v-model="addLogForm.operationContent"
            type="textarea"
            :rows="4"
            placeholder="请输入操作内容描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addLogDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleAddLog" :loading="addLogLoading">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 日志详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="日志详情"
      width="600px"
    >
      <div v-if="selectedLog" class="log-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="日志ID">{{ selectedLog.logId }}</el-descriptions-item>
          <el-descriptions-item label="操作人员">{{ selectedLog.staffId }}</el-descriptions-item>
          <el-descriptions-item label="操作时间" :span="2">{{ formatDateTime(selectedLog.operationTime) }}</el-descriptions-item>
          <el-descriptions-item label="操作内容" :span="2">
            <div class="operation-content">{{ selectedLog.operationContent }}</div>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, Refresh, Plus, InfoFilled } from '@element-plus/icons-vue'
import { getLogList, getLogCount, addLog } from '@/api/log'
import { useUserStore } from '@/stores/user'

export default {
  name: 'LogManagement',
  components: {
    Download,
    Refresh,
    Plus,
    InfoFilled
  },
  setup() {
    const userStore = useUserStore()
    const loading = ref(false)
    const addLogLoading = ref(false)
    const logList = ref([])
    const detailDialogVisible = ref(false)
    const addLogDialogVisible = ref(false)
    const selectedLog = ref(null)
    const addLogFormRef = ref(null)

    // 判断用户身份
    const isAdmin = computed(() => userStore.isAdmin)
    const isTeacher = computed(() => userStore.isTeacher)
    const currentUserId = computed(() => userStore.userInfo?.id || userStore.userInfo?.name || '')

    const filterForm = reactive({
      staffId: '',
      dateRange: [],
      operationContent: ''
    })

    const addLogForm = reactive({
      staffId: '',
      operationContent: ''
    })

    const addLogRules = {
      staffId: [
        { required: true, message: '请输入操作人员编号', trigger: 'blur' }
      ],
      operationContent: [
        { required: true, message: '请输入操作内容', trigger: 'blur' }
      ]
    }

    const stats = reactive({
      totalLogs: 0,
      todayLogs: 0,
      activeUsers: 0
    })

    const pagination = reactive({
      currentPage: 1,
      pageSize: 20,
      total: 0
    })

    // 原始日志数据
    const originalLogList = ref([])

    // 获取日志列表
    const getLogListData = async () => {
      loading.value = true
      try {
        const response = await getLogList()
        if (response.code === 0) {
          originalLogList.value = response.data || []
          applyFilters()
        } else {
          ElMessage.error(response.message || '获取日志列表失败')
        }
      } catch (error) {
        console.error('获取日志列表失败:', error)
        ElMessage.error(error.message || '获取日志列表失败')
      } finally {
        loading.value = false
      }
    }

    // 应用筛选条件
    const applyFilters = () => {
      let filteredLogs = [...originalLogList.value]

      // 教师只能查看自己的日志
      if (isTeacher.value) {
        filteredLogs = filteredLogs.filter(log => 
          log.staffId === currentUserId.value
        )
        console.log('教师模式：只显示当前用户的日志，用户ID:', currentUserId.value)
      }

      // 按操作人员筛选（仅管理员可用）
      if (isAdmin.value && filterForm.staffId) {
        filteredLogs = filteredLogs.filter(log => 
          log.staffId && log.staffId.toLowerCase().includes(filterForm.staffId.toLowerCase())
        )
      }

      // 按时间范围筛选
      if (filterForm.dateRange && filterForm.dateRange.length === 2) {
        const startDate = new Date(filterForm.dateRange[0])
        const endDate = new Date(filterForm.dateRange[1])
        endDate.setHours(23, 59, 59, 999) // 设置为当天结束时间

        filteredLogs = filteredLogs.filter(log => {
          if (!log.operationTime) return false
          const logDate = new Date(log.operationTime)
          return logDate >= startDate && logDate <= endDate
        })
      }

      // 按操作内容筛选
      if (filterForm.operationContent) {
        filteredLogs = filteredLogs.filter(log => 
          log.operationContent && log.operationContent.toLowerCase().includes(filterForm.operationContent.toLowerCase())
        )
      }

      // 更新日志列表
      logList.value = filteredLogs

      // 计算统计信息
      const today = new Date().toISOString().split('T')[0]
      
      if (isTeacher.value) {
        // 教师模式：只统计自己的日志
        const myLogs = originalLogList.value.filter(log => log.staffId === currentUserId.value)
        stats.todayLogs = myLogs.filter(log => 
          log.operationTime && log.operationTime.startsWith(today)
        ).length
        
        // 计算操作类型数（去重）
        const uniqueOperations = new Set(myLogs.map(log => {
          const content = log.operationContent || ''
          return content.split('：')[0] || content.split(':')[0] || '其他'
        }))
        stats.activeUsers = uniqueOperations.size
      } else {
        // 管理员模式：统计所有日志
        stats.todayLogs = originalLogList.value.filter(log => 
          log.operationTime && log.operationTime.startsWith(today)
        ).length
        
        // 计算活跃用户数（去重）
        const uniqueUsers = new Set(originalLogList.value.map(log => log.staffId))
        stats.activeUsers = uniqueUsers.size
      }

      // 更新分页总数
      pagination.total = filteredLogs.length
      pagination.currentPage = 1

      // 调试信息
      console.log('筛选条件:', filterForm)
      console.log('原始数据量:', originalLogList.value.length)
      console.log('筛选后数据量:', filteredLogs.length)
      console.log('用户身份:', isAdmin.value ? '管理员' : isTeacher.value ? '教师' : '其他')
    }

    // 分页后的日志列表
    const paginatedLogList = computed(() => {
      const start = (pagination.currentPage - 1) * pagination.pageSize
      const end = start + pagination.pageSize
      return logList.value.slice(start, end)
    })

    // 判断是否有活跃的筛选条件
    const hasActiveFilters = computed(() => {
      return filterForm.staffId || 
             (filterForm.dateRange && filterForm.dateRange.length === 2) || 
             filterForm.operationContent
    })

    // 获取日志总数
    const getLogCountData = async () => {
      try {
        const response = await getLogCount()
        if (response.code === 0) {
          stats.totalLogs = response.data || 0
          pagination.total = response.data || 0
        }
      } catch (error) {
        console.error('获取日志总数失败:', error)
        // 如果获取总数失败，使用列表长度作为总数
        stats.totalLogs = logList.value.length
        pagination.total = logList.value.length
      }
    }

    // 筛选
    const handleFilter = () => {
      applyFilters()
    }

    // 重置筛选
    const resetFilter = () => {
      if (isAdmin.value) {
        // 管理员模式：重置所有筛选条件
        Object.assign(filterForm, {
          staffId: '',
          dateRange: [],
          operationContent: ''
        })
      } else {
        // 教师模式：只重置时间和内容筛选，不清空操作人员
        Object.assign(filterForm, {
          dateRange: [],
          operationContent: ''
        })
      }
      applyFilters()
    }

    // 查看日志详情
    const viewLogDetail = (log) => {
      selectedLog.value = log
      detailDialogVisible.value = true
    }

    // 显示添加日志对话框
    const showAddLogDialog = () => {
      addLogDialogVisible.value = true
      // 重置表单
      Object.assign(addLogForm, {
        staffId: isTeacher.value ? currentUserId.value : '',
        operationContent: ''
      })
    }

    // 添加日志
    const handleAddLog = async () => {
      if (!addLogFormRef.value) return
      
      try {
        await addLogFormRef.value.validate()
        addLogLoading.value = true
        
        const response = await addLog(addLogForm)
        if (response.code === 0) {
          ElMessage.success('添加日志成功')
          addLogDialogVisible.value = false
          // 刷新数据
          await getLogListData()
          await getLogCountData()
        } else {
          ElMessage.error(response.message || '添加日志失败')
        }
      } catch (error) {
        console.error('添加日志失败:', error)
        ElMessage.error(error.message || '添加日志失败')
      } finally {
        addLogLoading.value = false
      }
    }

    // 导出日志
    const exportLogs = () => {
      ElMessage.success('日志导出功能开发中...')
    }

    // 刷新日志
    const refreshLogs = () => {
      getLogListData()
      getLogCountData()
    }

    // 分页处理
    const handleSizeChange = (size) => {
      pagination.pageSize = size
      pagination.currentPage = 1
      applyFilters()
    }

    const handleCurrentChange = (page) => {
      pagination.currentPage = page
      // 分页不需要重新筛选，只需要更新当前页
    }

    // 格式化日期时间
    const formatDateTime = (dateTimeStr) => {
      if (!dateTimeStr) return ''
      try {
        const date = new Date(dateTimeStr)
        return date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      } catch (error) {
        return dateTimeStr
      }
    }

    onMounted(() => {
      getLogListData()
      getLogCountData()
    })

    return {
      loading,
      addLogLoading,
      logList,
      originalLogList,
      paginatedLogList,
      filterForm,
      addLogForm,
      addLogRules,
      addLogFormRef,
      stats,
      pagination,
      detailDialogVisible,
      addLogDialogVisible,
      selectedLog,
      hasActiveFilters,
      isAdmin,
      isTeacher,
      handleFilter,
      resetFilter,
      viewLogDetail,
      showAddLogDialog,
      handleAddLog,
      exportLogs,
      refreshLogs,
      handleSizeChange,
      handleCurrentChange,
      formatDateTime
    }
  }
}
</script>

<style scoped>
.log-management {
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

.filter-result-tip {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #ebeef5;
}

.teacher-mode-tip {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #ebeef5;
}

.stats-section {
  margin-bottom: 20px;
}

.stat-card {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 5px;
}

.stat-label {
  color: #606266;
  font-size: 14px;
}

.log-table {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.pagination-wrapper {
  padding: 20px;
  text-align: right;
}

.log-detail .operation-content {
  background: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 200px;
  overflow-y: auto;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>