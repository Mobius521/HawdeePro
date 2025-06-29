<template>
  <div class="system-monitor">
    <div class="page-header">
      <h2>系统监控</h2>
      <div class="header-actions">
        <el-button type="primary" @click="refreshData">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
        <el-button @click="exportLogs">
          <el-icon><Download /></el-icon>
          导出日志
        </el-button>
      </div>
    </div>

    <!-- 系统状态概览 -->
    <el-row :gutter="20" class="status-overview">
      <el-col :span="6">
        <div class="status-card">
          <div class="status-icon success">
            <el-icon><Monitor /></el-icon>
          </div>
          <div class="status-content">
            <div class="status-title">系统状态</div>
            <div class="status-value">正常运行</div>
            <div class="status-desc">运行时间: {{ systemStatus.uptime }}</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="status-card">
          <div class="status-icon primary">
            <el-icon><Cpu /></el-icon>
          </div>
          <div class="status-content">
            <div class="status-title">CPU使用率</div>
            <div class="status-value">{{ systemStatus.cpuUsage }}%</div>
            <div class="status-desc">核心数: {{ systemStatus.cpuCores }}</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="status-card">
          <div class="status-icon warning">
            <el-icon><Memory /></el-icon>
          </div>
          <div class="status-content">
            <div class="status-title">内存使用率</div>
            <div class="status-value">{{ systemStatus.memoryUsage }}%</div>
            <div class="status-desc">{{ systemStatus.memoryUsed }}/{{ systemStatus.memoryTotal }}</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="status-card">
          <div class="status-icon info">
            <el-icon><HardDisk /></el-icon>
          </div>
          <div class="status-content">
            <div class="status-title">磁盘使用率</div>
            <div class="status-value">{{ systemStatus.diskUsage }}%</div>
            <div class="status-desc">{{ systemStatus.diskUsed }}/{{ systemStatus.diskTotal }}</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 性能监控图表 -->
    <el-row :gutter="20" class="chart-section">
      <el-col :span="12">
        <div class="chart-card">
          <div class="chart-header">
            <h3>CPU使用率趋势</h3>
            <el-select v-model="cpuTimeRange" size="small">
              <el-option label="最近1小时" value="1h" />
              <el-option label="最近6小时" value="6h" />
              <el-option label="最近24小时" value="24h" />
            </el-select>
          </div>
          <div class="chart-container">
            <v-chart :option="cpuChartOption" style="height: 300px;" />
          </div>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="chart-card">
          <div class="chart-header">
            <h3>内存使用率趋势</h3>
            <el-select v-model="memoryTimeRange" size="small">
              <el-option label="最近1小时" value="1h" />
              <el-option label="最近6小时" value="6h" />
              <el-option label="最近24小时" value="24h" />
            </el-select>
          </div>
          <div class="chart-container">
            <v-chart :option="memoryChartOption" style="height: 300px;" />
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 访问统计 -->
    <el-row :gutter="20" class="stats-section">
      <el-col :span="8">
        <div class="stats-card">
          <div class="stats-header">
            <h3>今日访问统计</h3>
          </div>
          <div class="stats-content">
            <div class="stat-item">
              <span class="stat-label">总访问量</span>
              <span class="stat-value">{{ todayStats.totalVisits }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">独立访客</span>
              <span class="stat-value">{{ todayStats.uniqueVisitors }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">页面浏览量</span>
              <span class="stat-value">{{ todayStats.pageViews }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">平均停留时间</span>
              <span class="stat-value">{{ todayStats.avgDuration }}</span>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="stats-card">
          <div class="stats-header">
            <h3>用户活跃度</h3>
          </div>
          <div class="stats-content">
            <div class="stat-item">
              <span class="stat-label">在线用户</span>
              <span class="stat-value">{{ userStats.onlineUsers }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">今日新增</span>
              <span class="stat-value">{{ userStats.newUsers }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">活跃教师</span>
              <span class="stat-value">{{ userStats.activeTeachers }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">活跃助教</span>
              <span class="stat-value">{{ userStats.activeAssistants }}</span>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="stats-card">
          <div class="stats-header">
            <h3>系统错误</h3>
          </div>
          <div class="stats-content">
            <div class="stat-item">
              <span class="stat-label">今日错误</span>
              <span class="stat-value error">{{ errorStats.todayErrors }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">本周错误</span>
              <span class="stat-value error">{{ errorStats.weekErrors }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">错误率</span>
              <span class="stat-value error">{{ errorStats.errorRate }}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">平均响应时间</span>
              <span class="stat-value">{{ errorStats.avgResponseTime }}ms</span>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 系统日志 -->
    <div class="log-section">
      <div class="log-header">
        <h3>系统日志</h3>
        <div class="log-filters">
          <el-select v-model="logLevel" placeholder="日志级别" size="small" style="width: 120px;">
            <el-option label="全部" value="" />
            <el-option label="ERROR" value="error" />
            <el-option label="WARN" value="warn" />
            <el-option label="INFO" value="info" />
            <el-option label="DEBUG" value="debug" />
          </el-select>
          <el-date-picker
            v-model="logDateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            size="small"
            style="width: 300px;"
          />
          <el-button type="primary" size="small" @click="searchLogs">搜索</el-button>
          <el-button size="small" @click="clearLogFilters">清空</el-button>
        </div>
      </div>
      <div class="log-table">
        <el-table :data="logList" v-loading="logLoading" style="width: 100%" max-height="400">
          <el-table-column prop="timestamp" label="时间" width="180" />
          <el-table-column prop="level" label="级别" width="80">
            <template #default="{ row }">
              <el-tag :type="getLogLevelType(row.level)" size="small">
                {{ row.level.toUpperCase() }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="module" label="模块" width="120" />
          <el-table-column prop="message" label="消息" show-overflow-tooltip />
          <el-table-column prop="user" label="用户" width="120" />
          <el-table-column prop="ip" label="IP地址" width="130" />
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import VChart from 'vue-echarts'

export default {
  name: 'SystemMonitor',
  components: {
    VChart
  },
  setup() {
    const logLoading = ref(false)
    const cpuTimeRange = ref('1h')
    const memoryTimeRange = ref('1h')
    const logLevel = ref('')
    const logDateRange = ref([])

    // 系统状态
    const systemStatus = reactive({
      uptime: '15天 8小时 32分钟',
      cpuUsage: 45,
      cpuCores: 8,
      memoryUsage: 68,
      memoryUsed: '8.2GB',
      memoryTotal: '12GB',
      diskUsage: 72,
      diskUsed: '720GB',
      diskTotal: '1TB'
    })

    // 今日统计
    const todayStats = reactive({
      totalVisits: 1256,
      uniqueVisitors: 342,
      pageViews: 4567,
      avgDuration: '12分30秒'
    })

    // 用户统计
    const userStats = reactive({
      onlineUsers: 89,
      newUsers: 23,
      activeTeachers: 45,
      activeAssistants: 12
    })

    // 错误统计
    const errorStats = reactive({
      todayErrors: 5,
      weekErrors: 23,
      errorRate: 0.12,
      avgResponseTime: 245
    })

    // CPU图表配置
    const cpuChartOption = ref({
      title: {
        text: 'CPU使用率监控',
        left: 'center',
        textStyle: {
          fontSize: 14,
          color: '#303133'
        }
      },
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00']
      },
      yAxis: {
        type: 'value',
        max: 100,
        axisLabel: {
          formatter: '{value}%'
        }
      },
      series: [
        {
          name: 'CPU使用率',
          type: 'line',
          smooth: true,
          data: [35, 42, 38, 45, 52, 48, 55, 62, 58, 51, 47, 43],
          itemStyle: {
            color: '#409eff'
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
                { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
              ]
            }
          }
        }
      ]
    })

    // 内存图表配置
    const memoryChartOption = ref({
      title: {
        text: '内存使用率监控',
        left: 'center',
        textStyle: {
          fontSize: 14,
          color: '#303133'
        }
      },
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00']
      },
      yAxis: {
        type: 'value',
        max: 100,
        axisLabel: {
          formatter: '{value}%'
        }
      },
      series: [
        {
          name: '内存使用率',
          type: 'line',
          smooth: true,
          data: [65, 68, 72, 70, 75, 78, 82, 79, 76, 73, 69, 66],
          itemStyle: {
            color: '#e6a23c'
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(230, 162, 60, 0.3)' },
                { offset: 1, color: 'rgba(230, 162, 60, 0.1)' }
              ]
            }
          }
        }
      ]
    })

    // 日志列表
    const logList = ref([
      {
        timestamp: '2024-01-15 14:30:25',
        level: 'info',
        module: '用户管理',
        message: '用户登录成功',
        user: '张老师',
        ip: '192.168.1.100'
      },
      {
        timestamp: '2024-01-15 14:28:15',
        level: 'warn',
        module: '文件上传',
        message: '文件大小超过限制',
        user: '李助教',
        ip: '192.168.1.101'
      },
      {
        timestamp: '2024-01-15 14:25:42',
        level: 'error',
        module: '数据库',
        message: '数据库连接超时',
        user: '系统',
        ip: '127.0.0.1'
      },
      {
        timestamp: '2024-01-15 14:22:18',
        level: 'info',
        module: '课程管理',
        message: '课程创建成功',
        user: '王老师',
        ip: '192.168.1.102'
      },
      {
        timestamp: '2024-01-15 14:20:33',
        level: 'debug',
        module: 'API接口',
        message: 'API请求处理完成',
        user: '系统',
        ip: '127.0.0.1'
      }
    ])

    // 获取日志级别标签类型
    const getLogLevelType = (level) => {
      const typeMap = {
        'error': 'danger',
        'warn': 'warning',
        'info': 'primary',
        'debug': 'info'
      }
      return typeMap[level] || 'info'
    }

    // 刷新数据
    const refreshData = () => {
      ElMessage.success('数据刷新成功')
      // 模拟数据更新
      systemStatus.cpuUsage = Math.floor(Math.random() * 30) + 30
      systemStatus.memoryUsage = Math.floor(Math.random() * 20) + 60
      systemStatus.diskUsage = Math.floor(Math.random() * 10) + 70
    }

    // 导出日志
    const exportLogs = () => {
      ElMessage.success('日志导出成功')
    }

    // 搜索日志
    const searchLogs = () => {
      logLoading.value = true
      setTimeout(() => {
        logLoading.value = false
        ElMessage.success('日志搜索完成')
      }, 1000)
    }

    // 清空日志筛选
    const clearLogFilters = () => {
      logLevel.value = ''
      logDateRange.value = []
      searchLogs()
    }

    // 定时更新数据
    let updateTimer = null

    const startAutoUpdate = () => {
      updateTimer = setInterval(() => {
        // 模拟实时数据更新
        systemStatus.cpuUsage = Math.floor(Math.random() * 30) + 30
        systemStatus.memoryUsage = Math.floor(Math.random() * 20) + 60
        userStats.onlineUsers = Math.floor(Math.random() * 20) + 80
      }, 30000) // 30秒更新一次
    }

    const stopAutoUpdate = () => {
      if (updateTimer) {
        clearInterval(updateTimer)
        updateTimer = null
      }
    }

    onMounted(() => {
      startAutoUpdate()
    })

    onUnmounted(() => {
      stopAutoUpdate()
    })

    return {
      logLoading,
      cpuTimeRange,
      memoryTimeRange,
      logLevel,
      logDateRange,
      systemStatus,
      todayStats,
      userStats,
      errorStats,
      cpuChartOption,
      memoryChartOption,
      logList,
      getLogLevelType,
      refreshData,
      exportLogs,
      searchLogs,
      clearLogFilters
    }
  }
}
</script>

<style scoped>
.system-monitor {
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

.status-overview {
  margin-bottom: 20px;
}

.status-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
  height: 120px;
}

.status-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 24px;
  color: #fff;
}

.status-icon.success {
  background: #67c23a;
}

.status-icon.primary {
  background: #409eff;
}

.status-icon.warning {
  background: #e6a23c;
}

.status-icon.info {
  background: #909399;
}

.status-content {
  flex: 1;
}

.status-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.status-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 4px;
}

.status-desc {
  font-size: 12px;
  color: #909399;
}

.chart-section {
  margin-bottom: 20px;
}

.chart-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-header h3 {
  margin: 0;
  color: #303133;
  font-size: 16px;
}

.chart-container {
  height: 300px;
}

.stats-section {
  margin-bottom: 20px;
}

.stats-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
  height: 200px;
}

.stats-header h3 {
  margin: 0 0 20px 0;
  color: #303133;
  font-size: 16px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-label {
  color: #606266;
  font-size: 14px;
}

.stat-value {
  font-weight: bold;
  color: #303133;
  font-size: 14px;
}

.stat-value.error {
  color: #f56c6c;
}

.log-section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.log-header h3 {
  margin: 0;
  color: #303133;
  font-size: 16px;
}

.log-filters {
  display: flex;
  gap: 10px;
  align-items: center;
}

.log-table {
  max-height: 400px;
  overflow-y: auto;
}
</style> 