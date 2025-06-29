<template>
    <div class="homework-management">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-left">
          <h1>作业管理</h1>
          <p>管理所有作业，支持发布、查看、统计、修改等操作</p>
        </div>
        <div class="header-actions">
          <el-button type="primary" size="large" @click="showPublishDialog = true">
            <el-icon><Plus /></el-icon>
            发布作业
          </el-button>
          <el-button type="success" size="large" @click="showStatisticsDialog = true">
            <el-icon><DataAnalysis /></el-icon>
            统计分析
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
                  <div class="stats-label">作业总数</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stats-card">
              <div class="stats-content">
                <div class="stats-icon active">
                  <el-icon><Clock /></el-icon>
                </div>
                <div class="stats-info">
                  <div class="stats-number">{{ statistics.active }}</div>
                  <div class="stats-label">进行中</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stats-card">
              <div class="stats-content">
                <div class="stats-icon completed">
                  <el-icon><Check /></el-icon>
                </div>
                <div class="stats-info">
                  <div class="stats-number">{{ statistics.completed }}</div>
                  <div class="stats-label">已完成</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stats-card">
              <div class="stats-content">
                <div class="stats-icon overdue">
                  <el-icon><Warning /></el-icon>
                </div>
                <div class="stats-info">
                  <div class="stats-number">{{ statistics.overdue }}</div>
                  <div class="stats-label">已逾期</div>
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
                placeholder="搜索作业标题、描述..."
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
              <el-select v-model="searchForm.status" placeholder="选择状态" clearable @change="handleFilter">
                <el-option label="全部状态" value="" />
                <el-option label="进行中" value="进行中" />
                <el-option label="已完成" value="已完成" />
                <el-option label="已逾期" value="已逾期" />
              </el-select>
            </el-col>
            <el-col :span="4">
              <el-select v-model="searchForm.class" placeholder="选择班级" clearable @change="handleFilter">
                <el-option label="全部班级" value="" />
                <el-option label="计算机1班" value="计算机1班" />
                <el-option label="计算机2班" value="计算机2班" />
                <el-option label="数学1班" value="数学1班" />
                <el-option label="英语1班" value="英语1班" />
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
                <el-option label="发布时间" value="publishTime" />
                <el-option label="截止时间" value="deadline" />
                <el-option label="作业标题" value="title" />
                <el-option label="提交率" value="submitRate" />
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
      <div v-if="selectedHomeworks.length > 0" class="batch-operations">
        <div class="batch-info">
          <span>已选择 {{ selectedHomeworks.length }} 个作业</span>
        </div>
        <div class="batch-actions">
          <el-button size="small" @click="batchExtendDeadline">
            <el-icon><Clock /></el-icon>
            批量延期
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
  
      <!-- 作业列表 - 卡片视图 -->
      <div v-if="viewMode === 'card'" class="homeworks-grid">
        <el-row :gutter="20">
          <el-col :span="8" v-for="homework in filteredHomeworks" :key="homework.id">
            <el-card class="homework-card" :class="{ 'selected': selectedHomeworks.includes(homework.id) }">
              <template #header>
                <div class="card-header">
                  <el-checkbox
                    v-model="selectedHomeworks"
                    :label="homework.id"
                  />
                  <el-tag :type="getStatusType(homework.status)" size="small">
                    {{ homework.status }}
                  </el-tag>
                  <el-dropdown @command="handleCardAction">
                    <el-button size="small" text>
                      <el-icon><MoreFilled /></el-icon>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item :command="{action: 'detail', homework}">
                          <el-icon><View /></el-icon>
                          查看详情
                        </el-dropdown-item>
                        <el-dropdown-item :command="{action: 'statistics', homework}">
                          <el-icon><DataAnalysis /></el-icon>
                          查看统计
                        </el-dropdown-item>
                        <el-dropdown-item :command="{action: 'edit', homework}">
                          <el-icon><Edit /></el-icon>
                          修改作业
                        </el-dropdown-item>
                        <el-dropdown-item :command="{action: 'copy', homework}">
                          <el-icon><CopyDocument /></el-icon>
                          复制作业
                        </el-dropdown-item>
                        <el-dropdown-item :command="{action: 'delete', homework}" divided>
                          <el-icon><Delete /></el-icon>
                          删除作业
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </template>
  
              <div class="homework-info" @click="viewHomeworkDetail(homework)">
                <h3 class="homework-title">{{ homework.title }}</h3>
                <div class="homework-meta">
                  <div class="meta-item">
                    <el-icon><Collection /></el-icon>
                    <span>{{ homework.subject }}</span>
                  </div>
                  <div class="meta-item">
                    <el-icon><UserFilled /></el-icon>
                    <span>{{ homework.class }}</span>
                  </div>
                  <div class="meta-item">
                    <el-icon><DocumentChecked /></el-icon>
                    <span>{{ homework.paperTitle }}</span>
                  </div>
                  <div class="meta-item">
                    <el-icon><Timer /></el-icon>
                    <span>{{ homework.duration }}分钟</span>
                  </div>
                </div>
                <p class="homework-description">{{ homework.description || '暂无描述' }}</p>
  
                <!-- 进度条 -->
                <div class="progress-section">
                  <div class="progress-info">
                    <span>提交进度</span>
                    <span>{{ homework.submittedCount }}/{{ homework.totalStudents }}</span>
                  </div>
                  <el-progress
                    :percentage="homework.submitRate"
                    :color="getProgressColor(homework.submitRate)"
                    :stroke-width="8"
                  />
                </div>
  
                <div class="homework-stats">
                  <div class="stat-item">
                    <span class="stat-label">平均分：</span>
                    <span class="stat-value">{{ homework.averageScore || '--' }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">最高分：</span>
                    <span class="stat-value">{{ homework.maxScore || '--' }}</span>
                  </div>
                </div>
              </div>
  
              <template #footer>
                <div class="card-footer">
                  <div class="time-info">
                    <div class="publish-time">发布：{{ formatDate(homework.publishTime) }}</div>
                    <div class="deadline" :class="{ 'overdue': isOverdue(homework.deadline) }">
                      截止：{{ formatDate(homework.deadline) }}
                    </div>
                  </div>
                  <div class="card-actions">
                    <el-button size="small" type="primary" @click="viewHomeworkDetail(homework)">
                      <el-icon><View /></el-icon>
                      详情
                    </el-button>
                    <el-button size="small" @click="viewStatistics(homework)">
                      <el-icon><DataAnalysis /></el-icon>
                      统计
                    </el-button>
                    <el-button size="small" @click="editHomework(homework)">
                      <el-icon><Edit /></el-icon>
                      修改
                    </el-button>
                  </div>
                </div>
              </template>
            </el-card>
          </el-col>
        </el-row>
      </div>
  
      <!-- 作业列表 - 表格视图 -->
      <div v-if="viewMode === 'table'" class="homeworks-table">
        <el-table
          :data="filteredHomeworks"
          style="width: 100%"
          @selection-change="handleTableSelectionChange"
          row-key="id"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="title" label="作业标题" min-width="200">
            <template #default="{ row }">
              <div class="table-title">
                <span class="title-text" @click="viewHomeworkDetail(row)">{{ row.title }}</span>
                <el-tag :type="getStatusType(row.status)" size="small">{{ row.status }}</el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="subject" label="科目" width="100" />
          <el-table-column prop="class" label="班级" width="120" />
          <el-table-column prop="paperTitle" label="试卷" min-width="150" />
          <el-table-column label="提交进度" width="120">
            <template #default="{ row }">
              <div class="submit-progress">
                <span>{{ row.submittedCount }}/{{ row.totalStudents }}</span>
                <el-progress
                  :percentage="row.submitRate"
                  :stroke-width="6"
                  :show-text="false"
                />
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="averageScore" label="平均分" width="100">
            <template #default="{ row }">
              {{ row.averageScore || '--' }}
            </template>
          </el-table-column>
          <el-table-column prop="deadline" label="截止时间" width="180">
            <template #default="{ row }">
              <span :class="{ 'overdue-text': isOverdue(row.deadline) }">
                {{ formatDate(row.deadline) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button size="small" type="primary" @click="viewHomeworkDetail(row)">
                <el-icon><View /></el-icon>
                详情
              </el-button>
              <el-button size="small" @click="viewStatistics(row)">
                <el-icon><DataAnalysis /></el-icon>
                统计
              </el-button>
              <el-dropdown @command="handleTableAction">
                <el-button size="small">
                  更多
                  <el-icon><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item :command="{action: 'edit', homework: row}">
                      <el-icon><Edit /></el-icon>
                      修改
                    </el-dropdown-item>
                    <el-dropdown-item :command="{action: 'copy', homework: row}">
                      <el-icon><CopyDocument /></el-icon>
                      复制
                    </el-dropdown-item>
                    <el-dropdown-item :command="{action: 'extend', homework: row}">
                      <el-icon><Clock /></el-icon>
                      延期
                    </el-dropdown-item>
                    <el-dropdown-item :command="{action: 'delete', homework: row}" divided>
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
  
      <!-- 发布作业对话框 -->
      <el-dialog v-model="showPublishDialog" title="发布作业" width="800px">
        <el-form :model="publishForm" :rules="publishRules" ref="publishFormRef" label-width="100px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="作业标题" prop="title">
                <el-input v-model="publishForm.title" placeholder="请输入作业标题" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="科目" prop="subject">
                <el-select v-model="publishForm.subject" placeholder="请选择科目" style="width: 100%;">
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
            <el-col :span="12">
              <el-form-item label="班级" prop="class">
                <el-select v-model="publishForm.class" placeholder="请选择班级" style="width: 100%;">
                  <el-option label="计算机1班" value="计算机1班" />
                  <el-option label="计算机2班" value="计算机2班" />
                  <el-option label="数学1班" value="数学1班" />
                  <el-option label="英语1班" value="英语1班" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="截止时间" prop="deadline">
                <el-date-picker
                  v-model="publishForm.deadline"
                  type="datetime"
                  placeholder="选择截止时间"
                  style="width: 100%;"
                />
              </el-form-item>
            </el-col>
          </el-row>
  
          <el-form-item label="选择试卷" prop="paperId">
            <div class="paper-selection">
              <el-button @click="showPaperDialog = true">
                <el-icon><DocumentAdd /></el-icon>
                选择试卷
              </el-button>
              <div v-if="selectedPaper" class="selected-paper">
                <el-tag type="success" size="large" closable @close="clearSelectedPaper">
                  {{ selectedPaper.title }} ({{ selectedPaper.questionCount }}题, {{ selectedPaper.totalScore }}分)
                </el-tag>
              </div>
            </div>
          </el-form-item>
  
          <el-form-item label="作业描述">
            <el-input
              v-model="publishForm.description"
              type="textarea"
              :rows="3"
              placeholder="请输入作业描述（选填）"
            />
          </el-form-item>
  
          <el-form-item label="作业设置">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-checkbox v-model="publishForm.allowLateSubmit">允许逾期提交</el-checkbox>
              </el-col>
              <el-col :span="8">
                <el-checkbox v-model="publishForm.showScore">提交后显示分数</el-checkbox>
              </el-col>
              <el-col :span="8">
                <el-checkbox v-model="publishForm.allowMultipleSubmit">允许多次提交</el-checkbox>
              </el-col>
            </el-row>
          </el-form-item>
        </el-form>
  
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="showPublishDialog = false">取消</el-button>
            <el-button type="primary" @click="confirmPublish" :loading="publishing">发布作业</el-button>
          </span>
        </template>
      </el-dialog>
  
      <!-- 选择试卷对话框 -->
      <el-dialog v-model="showPaperDialog" title="选择试卷" width="900px">
        <div class="paper-list">
          <div class="paper-search">
            <el-input
              v-model="paperSearchKeyword"
              placeholder="搜索试卷..."
              clearable
              @input="filterPapers"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
  
          <div class="papers-grid">
            <el-row :gutter="15">
              <el-col :span="8" v-for="paper in filteredPapers" :key="paper.id">
                <div
                  class="paper-item"
                  :class="{ 'selected': selectedPaper && selectedPaper.id === paper.id }"
                  @click="selectPaper(paper)"
                >
                  <div class="paper-header">
                    <h4>{{ paper.title }}</h4>
                    <el-tag :type="paper.status === '已发布' ? 'success' : 'warning'" size="small">
                      {{ paper.status }}
                    </el-tag>
                  </div>
                  <div class="paper-info">
                    <div class="info-row">
                      <span>科目：{{ paper.subject }}</span>
                      <span>难度：{{ paper.difficulty }}</span>
                    </div>
                    <div class="info-row">
                      <span>题目：{{ paper.questionCount }}题</span>
                      <span>总分：{{ paper.totalScore }}分</span>
                    </div>
                    <div class="info-row">
                      <span>时长：{{ paper.estimatedTime }}分钟</span>
                    </div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </div>
  
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="showPaperDialog = false">取消</el-button>
            <el-button type="primary" @click="confirmSelectPaper" :disabled="!selectedPaper">确定选择</el-button>
          </span>
        </template>
      </el-dialog>
  
      <!-- 作业详情对话框 -->
      <el-dialog v-model="showDetailDialog" title="作业详情" width="1000px" top="5vh">
        <div v-if="currentHomework" class="homework-detail">
          <div class="detail-header">
            <h2>{{ currentHomework.title }}</h2>
            <div class="detail-meta">
              <el-tag :type="getStatusType(currentHomework.status)">{{ currentHomework.status }}</el-tag>
              <span>{{ currentHomework.subject }} - {{ currentHomework.class }}</span>
            </div>
          </div>
  
          <el-tabs v-model="activeTab">
            <el-tab-pane label="基本信息" name="info">
              <div class="info-section">
                <el-descriptions :column="2" border>
                  <el-descriptions-item label="作业标题">{{ currentHomework.title }}</el-descriptions-item>
                  <el-descriptions-item label="科目班级">{{ currentHomework.subject }} - {{ currentHomework.class }}</el-descriptions-item>
                  <el-descriptions-item label="使用试卷">{{ currentHomework.paperTitle }}</el-descriptions-item>
                  <el-descriptions-item label="作业时长">{{ currentHomework.duration }}分钟</el-descriptions-item>
                  <el-descriptions-item label="发布时间">{{ formatDate(currentHomework.publishTime) }}</el-descriptions-item>
                  <el-descriptions-item label="截止时间">{{ formatDate(currentHomework.deadline) }}</el-descriptions-item>
                  <el-descriptions-item label="提交进度">{{ currentHomework.submittedCount }}/{{ currentHomework.totalStudents }}</el-descriptions-item>
                  <el-descriptions-item label="提交率">{{ currentHomework.submitRate }}%</el-descriptions-item>
                  <el-descriptions-item label="作业描述" :span="2">{{ currentHomework.description || '无' }}</el-descriptions-item>
                </el-descriptions>
              </div>
            </el-tab-pane>
  
            <el-tab-pane label="提交记录" name="submissions">
              <div class="submissions-section">
                <el-table :data="currentHomework.submissions" style="width: 100%">
                  <el-table-column prop="studentName" label="学生姓名" width="120" />
                  <el-table-column prop="studentId" label="学号" width="120" />
                  <el-table-column prop="submitTime" label="提交时间" width="180">
                    <template #default="{ row }">
                      {{ row.submitTime ? formatDate(row.submitTime) : '--' }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="score" label="得分" width="100">
                    <template #default="{ row }">
                      {{ row.score !== null ? row.score : '--' }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="status" label="状态" width="100">
                    <template #default="{ row }">
                      <el-tag :type="getSubmissionStatusType(row.status)" size="small">
                        {{ row.status }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="150">
                    <template #default="{ row }">
                      <el-button v-if="row.status === '已提交'" size="small" @click="viewSubmission(row)">
                        查看答卷
                      </el-button>
                      <el-button v-if="row.status === '未提交'" size="small" type="warning" @click="remindStudent(row)">
                        提醒
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-tab-pane>
  
            <el-tab-pane label="成绩分析" name="analysis">
              <div class="analysis-section">
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-card title="成绩分布">
                      <div class="score-chart">
                        <div class="chart-placeholder">成绩分布图表</div>
                      </div>
                    </el-card>
                  </el-col>
                  <el-col :span="12">
                    <el-card title="统计数据">
                      <el-descriptions :column="1" border>
                        <el-descriptions-item label="平均分">{{ currentHomework.averageScore || '--' }}</el-descriptions-item>
                        <el-descriptions-item label="最高分">{{ currentHomework.maxScore || '--' }}</el-descriptions-item>
                        <el-descriptions-item label="最低分">{{ currentHomework.minScore || '--' }}</el-descriptions-item>
                        <el-descriptions-item label="及格率">{{ currentHomework.passRate || '--' }}%</el-descriptions-item>
                        <el-descriptions-item label="优秀率">{{ currentHomework.excellentRate || '--' }}%</el-descriptions-item>
                      </el-descriptions>
                    </el-card>
                  </el-col>
                </el-row>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-dialog>
  
      <!-- 统计分析对话框 -->
      <el-dialog v-model="showStatisticsDialog" title="作业统计分析" width="1200px" top="5vh">
        <div class="statistics-content">
          <el-row :gutter="20">
            <el-col :span="6">
              <el-card>
                <div class="stat-item-large">
                  <div class="stat-number">{{ overallStats.totalHomeworks }}</div>
                  <div class="stat-label">总作业数</div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card>
                <div class="stat-item-large">
                  <div class="stat-number">{{ overallStats.averageSubmitRate }}%</div>
                  <div class="stat-label">平均提交率</div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card>
                <div class="stat-item-large">
                  <div class="stat-number">{{ overallStats.averageScore }}</div>
                  <div class="stat-label">平均成绩</div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card>
                <div class="stat-item-large">
                  <div class="stat-number">{{ overallStats.onTimeRate }}%</div>
                  <div class="stat-label">按时完成率</div>
                </div>
              </el-card>
            </el-col>
          </el-row>
  
          <el-row :gutter="20" style="margin-top: 20px;">
            <el-col :span="12">
              <el-card title="各科目作业统计">
                <div class="chart-placeholder">科目统计图表</div>
              </el-card>
            </el-col>
            <el-col :span="12">
              <el-card title="作业完成趋势">
                <div class="chart-placeholder">完成趋势图表</div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </el-dialog>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, computed, onMounted } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import {
    Plus, DataAnalysis, Document, Clock, Check, Warning, Search, SortDown, SortUp,
    Download, Delete, MoreFilled, View, Edit, CopyDocument, Collection, UserFilled,
    DocumentChecked, Timer, ArrowDown, DocumentAdd
  } from '@element-plus/icons-vue'
  
  // 响应式数据
  const viewMode = ref('card')
  const currentPage = ref(1)
  const pageSize = ref(12)
  const totalCount = ref(0)
  const selectedHomeworks = ref([])
  const sortBy = ref('publishTime')
  const sortOrder = ref('desc')
  const showPublishDialog = ref(false)
  const showPaperDialog = ref(false)
  const showDetailDialog = ref(false)
  const showStatisticsDialog = ref(false)
  const publishing = ref(false)
  const currentHomework = ref(null)
  const activeTab = ref('info')
  const selectedPaper = ref(null)
  const paperSearchKeyword = ref('')
  
  // 表单引用
  const publishFormRef = ref()
  
  // 搜索表单
  const searchForm = reactive({
    keyword: '',
    subject: '',
    status: '',
    class: ''
  })
  
  // 发布表单
  const publishForm = reactive({
    title: '',
    subject: '',
    class: '',
    deadline: '',
    paperId: '',
    description: '',
    allowLateSubmit: false,
    showScore: true,
    allowMultipleSubmit: false
  })
  
  // 发布表单验证规则
  const publishRules = {
    title: [
      { required: true, message: '请输入作业标题', trigger: 'blur' }
    ],
    subject: [
      { required: true, message: '请选择科目', trigger: 'change' }
    ],
    class: [
      { required: true, message: '请选择班级', trigger: 'change' }
    ],
    deadline: [
      { required: true, message: '请选择截止时间', trigger: 'change' }
    ],
    paperId: [
      { required: true, message: '请选择试卷', trigger: 'change' }
    ]
  }
  
  // 统计数据
  const statistics = reactive({
    total: 48,
    active: 12,
    completed: 28,
    overdue: 8
  })
  
  // 整体统计数据
  const overallStats = reactive({
    totalHomeworks: 48,
    averageSubmitRate: 85,
    averageScore: 78.5,
    onTimeRate: 82
  })
  
  // 模拟作业数据
  const homeworks = ref([
    {
      id: 1,
      title: '高等数学第三章练习',
      subject: '数学',
      class: '计算机1班',
      paperTitle: '高等数学函数与极限练习题',
      paperId: 1,
      duration: 90,
      status: '进行中',
      publishTime: '2024-01-20 09:00:00',
      deadline: '2024-01-25 23:59:59',
      description: '请认真完成函数与极限相关题目',
      totalStudents: 45,
      submittedCount: 38,
      submitRate: 84,
      averageScore: 82.5,
      maxScore: 95,
      minScore: 65,
      passRate: 88,
      excellentRate: 35,
      allowLateSubmit: true,
      showScore: true,
      allowMultipleSubmit: false,
      submissions: [
        {
          studentId: '2021001',
          studentName: '张三',
          submitTime: '2024-01-22 14:30:00',
          score: 85,
          status: '已提交'
        },
        {
          studentId: '2021002',
          studentName: '李四',
          submitTime: null,
          score: null,
          status: '未提交'
        }
      ]
    },
    {
      id: 2,
      title: '计算机网络基础测试',
      subject: '计算机',
      class: '计算机2班',
      paperTitle: '计算机网络基础测试',
      paperId: 2,
      duration: 60,
      status: '已完成',
      publishTime: '2024-01-15 10:00:00',
      deadline: '2024-01-18 23:59:59',
      description: '计算机网络协议相关知识测试',
      totalStudents: 42,
      submittedCount: 42,
      submitRate: 100,
      averageScore: 76.8,
      maxScore: 92,
      minScore: 58,
      passRate: 85,
      excellentRate: 28,
      allowLateSubmit: false,
      showScore: true,
      allowMultipleSubmit: true,
      submissions: []
    },
    {
      id: 3,
      title: '英语阅读理解专项',
      subject: '英语',
      class: '英语1班',
      paperTitle: '英语阅读理解专项练习',
      paperId: 3,
      duration: 45,
      status: '已逾期',
      publishTime: '2024-01-10 08:00:00',
      deadline: '2024-01-12 23:59:59',
      description: '提高英语阅读理解能力',
      totalStudents: 38,
      submittedCount: 32,
      submitRate: 84,
      averageScore: 71.2,
      maxScore: 88,
      minScore: 45,
      passRate: 78,
      excellentRate: 22,
      allowLateSubmit: true,
      showScore: false,
      allowMultipleSubmit: false,
      submissions: []
    }
  ])
  
  // 模拟试卷数据
  const papers = ref([
    {
      id: 1,
      title: '高等数学函数与极限练习题',
      subject: '数学',
      difficulty: '中等',
      status: '已发布',
      questionCount: 25,
      totalScore: 100,
      estimatedTime: 90
    },
    {
      id: 2,
      title: '计算机网络基础测试',
      subject: '计算机',
      difficulty: '中等',
      status: '已发布',
      questionCount: 20,
      totalScore: 80,
      estimatedTime: 60
    },
    {
      id: 3,
      title: '英语阅读理解专项练习',
      subject: '英语',
      difficulty: '中等',
      status: '已发布',
      questionCount: 15,
      totalScore: 75,
      estimatedTime: 45
    }
  ])
  
  // 计算属性
  const filteredHomeworks = computed(() => {
    let result = [...homeworks.value]
  
    // 关键词搜索
    if (searchForm.keyword) {
      const keyword = searchForm.keyword.toLowerCase()
      result = result.filter(homework =>
        homework.title.toLowerCase().includes(keyword) ||
        (homework.description && homework.description.toLowerCase().includes(keyword))
      )
    }
  
    // 科目筛选
    if (searchForm.subject) {
      result = result.filter(homework => homework.subject === searchForm.subject)
    }
  
    // 状态筛选
    if (searchForm.status) {
      result = result.filter(homework => homework.status === searchForm.status)
    }
  
    // 班级筛选
    if (searchForm.class) {
      result = result.filter(homework => homework.class === searchForm.class)
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
  
  const filteredPapers = computed(() => {
    if (!paperSearchKeyword.value) {
      return papers.value.filter(paper => paper.status === '已发布')
    }
  
    const keyword = paperSearchKeyword.value.toLowerCase()
    return papers.value.filter(paper =>
      paper.status === '已发布' &&
      (paper.title.toLowerCase().includes(keyword) ||
       paper.subject.toLowerCase().includes(keyword))
    )
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
  
  const getSubmissionStatusType = (status) => {
    const statusMap = {
      '已提交': 'success',
      '未提交': 'warning',
      '逾期提交': 'danger'
    }
    return statusMap[status] || 'default'
  }
  
  const getProgressColor = (percentage) => {
    if (percentage >= 90) return '#67c23a'
    if (percentage >= 70) return '#e6a23c'
    return '#f56c6c'
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
  
  const isOverdue = (deadline) => {
    return new Date() > new Date(deadline)
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
  
  const handleTableSelectionChange = (selection) => {
    selectedHomeworks.value = selection.map(item => item.id)
  }
  
  const clearSelection = () => {
    selectedHomeworks.value = []
  }
  
  const handleCardAction = ({ action, homework }) => {
    switch (action) {
      case 'detail':
        viewHomeworkDetail(homework)
        break
      case 'statistics':
        viewStatistics(homework)
        break
      case 'edit':
        editHomework(homework)
        break
      case 'copy':
        copyHomework(homework)
        break
      case 'delete':
        deleteHomework(homework)
        break
    }
  }
  
  const handleTableAction = ({ action, homework }) => {
    switch (action) {
      case 'edit':
        editHomework(homework)
        break
      case 'copy':
        copyHomework(homework)
        break
      case 'extend':
        extendDeadline(homework)
        break
      case 'delete':
        deleteHomework(homework)
        break
    }
  }
  
  const viewHomeworkDetail = (homework) => {
    currentHomework.value = homework
    activeTab.value = 'info'
    showDetailDialog.value = true
  }
  
  const viewStatistics = (homework) => {
    currentHomework.value = homework
    activeTab.value = 'analysis'
    showDetailDialog.value = true
  }
  
  const editHomework = (homework) => {
    ElMessage.info(`编辑作业：${homework.title}`)
    // 这里可以打开编辑对话框或跳转到编辑页面
  }
  
  const copyHomework = async (homework) => {
    try {
      await ElMessageBox.confirm(
        `确定要复制作业"${homework.title}"吗？`,
        '确认复制',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info',
        }
      )
  
      const copiedHomework = {
        ...homework,
        id: Date.now(),
        title: homework.title + ' (副本)',
        status: '进行中',
        publishTime: new Date().toLocaleString(),
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleString(),
        submittedCount: 0,
        submitRate: 0
      }
  
      homeworks.value.unshift(copiedHomework)
      statistics.total++
      statistics.active++
  
      ElMessage.success('作业复制成功')
    } catch {
      ElMessage.info('已取消复制')
    }
  }
  
  const deleteHomework = async (homework) => {
    try {
      await ElMessageBox.confirm(
        `确定要删除作业"${homework.title}"吗？此操作不可恢复。`,
        '确认删除',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'error',
        }
      )
  
      const index = homeworks.value.findIndex(h => h.id === homework.id)
      if (index > -1) {
        homeworks.value.splice(index, 1)
        statistics.total--
  
        if (homework.status === '进行中') statistics.active--
        else if (homework.status === '已完成') statistics.completed--
        else if (homework.status === '已逾期') statistics.overdue--
  
        ElMessage.success('作业删除成功')
      }
    } catch {
      ElMessage.info('已取消删除')
    }
  }
  
  const extendDeadline = (homework) => {
    ElMessage.info(`延期作业：${homework.title}`)
    // 这里可以打开延期对话框
  }
  
  const batchExtendDeadline = () => {
    ElMessage.info('批量延期功能')
  }
  
  const batchExport = () => {
    ElMessage.info('批量导出功能')
  }
  
  const batchDelete = () => {
    ElMessage.info('批量删除功能')
  }
  
  const selectPaper = (paper) => {
    selectedPaper.value = paper
  }
  
  const confirmSelectPaper = () => {
    if (selectedPaper.value) {
      publishForm.paperId = selectedPaper.value.id
      showPaperDialog.value = false
    }
  }
  
  const clearSelectedPaper = () => {
    selectedPaper.value = null
    publishForm.paperId = ''
  }
  
  const filterPapers = () => {
    // 筛选逻辑已在计算属性中处理
  }
  
  const confirmPublish = async () => {
    if (!publishFormRef.value) return
  
    await publishFormRef.value.validate((valid) => {
      if (valid) {
        if (!selectedPaper.value) {
          ElMessage.warning('请选择试卷')
          return
        }
  
        publishing.value = true
  
        // 模拟发布作业
        setTimeout(() => {
          const newHomework = {
            id: Date.now(),
            title: publishForm.title,
            subject: publishForm.subject,
            class: publishForm.class,
            paperTitle: selectedPaper.value.title,
            paperId: selectedPaper.value.id,
            duration: selectedPaper.value.estimatedTime,
            status: '进行中',
            publishTime: new Date().toLocaleString(),
            deadline: publishForm.deadline,
            description: publishForm.description,
            totalStudents: 45, // 模拟学生数
            submittedCount: 0,
            submitRate: 0,
            averageScore: null,
            maxScore: null,
            minScore: null,
            passRate: null,
            excellentRate: null,
            allowLateSubmit: publishForm.allowLateSubmit,
            showScore: publishForm.showScore,
            allowMultipleSubmit: publishForm.allowMultipleSubmit,
            submissions: []
          }
  
          homeworks.value.unshift(newHomework)
          statistics.total++
          statistics.active++
  
          publishing.value = false
          showPublishDialog.value = false
  
          // 重置表单
          Object.assign(publishForm, {
            title: '',
            subject: '',
            class: '',
            deadline: '',
            paperId: '',
            description: '',
            allowLateSubmit: false,
            showScore: true,
            allowMultipleSubmit: false
          })
          selectedPaper.value = null
  
          ElMessage.success('作业发布成功')
        }, 2000)
      }
    })
  }
  
  const viewSubmission = (submission) => {
    ElMessage.info(`查看 ${submission.studentName} 的答卷`)
  }
  
  const remindStudent = (submission) => {
    ElMessage.success(`已提醒 ${submission.studentName} 完成作业`)
  }
  
  const handleSizeChange = (size) => {
    pageSize.value = size
    currentPage.value = 1
  }
  
  const handleCurrentChange = (page) => {
    currentPage.value = page
  }
  
  onMounted(() => {
    ElMessage.success('作业管理系统加载完成')
  })
  </script>
  
  <style scoped>
  .homework-management {
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
  
  .stats-icon.active {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  }
  
  .stats-icon.completed {
    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  }
  
  .stats-icon.overdue {
    background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
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
  
  .homeworks-grid {
    margin-bottom: 30px;
  }
  
  .homework-card {
    margin-bottom: 20px;
    border-radius: 12px;
    transition: all 0.3s;
    cursor: pointer;
  }
  
  .homework-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
  
  .homework-card.selected {
    border-color: #409eff;
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .homework-info {
    padding: 10px 0;
  }
  
  .homework-title {
    margin: 0 0 15px 0;
    color: #303133;
    font-size: 18px;
    font-weight: bold;
    line-height: 1.4;
  }
  
  .homework-meta {
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
  
  .homework-description {
    color: #909399;
    font-size: 14px;
    line-height: 1.5;
    margin: 15px 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .progress-section {
    margin: 15px 0;
  }
  
  .progress-info {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 14px;
    color: #606266;
  }
  
  .homework-stats {
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
  
  .publish-time, .deadline {
    margin-bottom: 2px;
  }
  
  .deadline.overdue {
    color: #f56c6c;
    font-weight: bold;
  }
  
  .card-actions {
    display: flex;
    gap: 8px;
  }
  
  .homeworks-table {
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
  
  .submit-progress {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  
  .overdue-text {
    color: #f56c6c;
    font-weight: bold;
  }
  
  .pagination-wrapper {
    display: flex;
    justify-content: center;
    padding: 20px 0;
  }
  
  .paper-selection {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  
  .selected-paper {
    display: flex;
    align-items: center;
  }
  
  .paper-list {
    max-height: 500px;
    overflow-y: auto;
  }
  
  .paper-search {
    margin-bottom: 20px;
  }
  
  .papers-grid {
    margin-top: 15px;
  }
  
  .paper-item {
    border: 2px solid #dcdfe6;
    border-radius: 8px;
    padding: 15px;
    cursor: pointer;
    transition: all 0.3s;
    margin-bottom: 15px;
  }
  
  .paper-item:hover {
    border-color: #409eff;
    transform: translateY(-1px);
  }
  
  .paper-item.selected {
    border-color: #409eff;
    background-color: #ecf5ff;
  }
  
  .paper-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  
  .paper-header h4 {
    margin: 0;
    color: #303133;
    font-size: 16px;
  }
  
  .paper-info {
    font-size: 14px;
    color: #606266;
  }
  
  .info-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
  }
  
  .homework-detail {
    max-height: 600px;
    overflow-y: auto;
  }
  
  .detail-header {
    text-align: center;
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 2px solid #ebeef5;
  }
  
  .detail-header h2 {
    margin: 0 0 15px 0;
    color: #303133;
  }
  
  .detail-meta {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px;
    color: #606266;
  }
  
  .info-section {
    padding: 20px 0;
  }
  
  .submissions-section {
    padding: 20px 0;
  }
  
  .analysis-section {
    padding: 20px 0;
  }
  
  .chart-placeholder {
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f7fa;
    border-radius: 8px;
    color: #909399;
    font-size: 16px;
  }
  
  .statistics-content {
    padding: 20px 0;
  }
  
  .stat-item-large {
    text-align: center;
    padding: 20px;
  }
  
  .stat-item-large .stat-number {
    font-size: 36px;
    font-weight: bold;
    color: #409eff;
    line-height: 1;
  }
  
  .stat-item-large .stat-label {
    color: #606266;
    font-size: 16px;
    margin-top: 10px;
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
    .homework-management {
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
  
    .homework-meta {
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
  
    .detail-meta {
      flex-direction: column;
      gap: 10px;
    }
  }
  </style>