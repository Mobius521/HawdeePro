<template>
  <div class="course-audit">
    <div class="page-header">
      <h2>课程审核</h2>
      <div class="header-stats">
        <el-statistic title="待审核" :value="pendingCount" value-style="color: #e6a23c;" />
        <el-statistic title="已通过" :value="approvedCount" value-style="color: #67c23a;" />
        <el-statistic title="已拒绝" :value="rejectedCount" value-style="color: #f56c6c;" />
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-bar">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索课程名称/教师姓名"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-select v-model="searchForm.status" placeholder="审核状态" clearable>
            <el-option label="待审核" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select v-model="searchForm.category" placeholder="课程分类" clearable>
            <el-option label="计算机科学" value="computer" />
            <el-option label="数学" value="math" />
            <el-option label="物理" value="physics" />
            <el-option label="化学" value="chemistry" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 课程列表 -->
    <el-table :data="courseList" v-loading="loading" style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="courseName" label="课程名称" width="200" />
      <el-table-column prop="teacherName" label="教师姓名" width="120" />
      <el-table-column prop="category" label="分类" width="120">
        <template #default="{ row }">
          <el-tag>{{ row.category }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="课程描述" width="300" show-overflow-tooltip />
      <el-table-column prop="status" label="审核状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusTagType(row.status)">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="submitTime" label="提交时间" width="180" />
      <el-table-column prop="auditTime" label="审核时间" width="180" />
      <el-table-column prop="auditor" label="审核人" width="120" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleView(row)">
            查看
          </el-button>
          <el-button 
            v-if="row.status === 'pending'"
            type="success" 
            size="small" 
            @click="handleApprove(row)"
          >
            通过
          </el-button>
          <el-button 
            v-if="row.status === 'pending'"
            type="danger" 
            size="small" 
            @click="handleReject(row)"
          >
            拒绝
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="pagination.current"
        v-model:page-size="pagination.size"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 查看课程详情对话框 -->
    <el-dialog
      v-model="showViewDialog"
      title="课程详情"
      width="800px"
    >
      <div v-if="selectedCourse" class="course-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="课程名称">{{ selectedCourse.courseName }}</el-descriptions-item>
          <el-descriptions-item label="教师姓名">{{ selectedCourse.teacherName }}</el-descriptions-item>
          <el-descriptions-item label="课程分类">{{ selectedCourse.category }}</el-descriptions-item>
          <el-descriptions-item label="审核状态">
            <el-tag :type="getStatusTagType(selectedCourse.status)">
              {{ getStatusText(selectedCourse.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="提交时间">{{ selectedCourse.submitTime }}</el-descriptions-item>
          <el-descriptions-item label="审核时间">{{ selectedCourse.auditTime || '-' }}</el-descriptions-item>
          <el-descriptions-item label="审核人">{{ selectedCourse.auditor || '-' }}</el-descriptions-item>
          <el-descriptions-item label="审核意见">{{ selectedCourse.auditComment || '-' }}</el-descriptions-item>
        </el-descriptions>
        
        <div class="detail-section">
          <h4>课程描述</h4>
          <p>{{ selectedCourse.description }}</p>
        </div>
        
        <div class="detail-section">
          <h4>课程大纲</h4>
          <div v-if="selectedCourse.outline" class="outline-list">
            <div v-for="(item, index) in selectedCourse.outline" :key="index" class="outline-item">
              <span class="outline-number">{{ index + 1 }}.</span>
              <span class="outline-title">{{ item.title }}</span>
              <span class="outline-duration">{{ item.duration }}分钟</span>
            </div>
          </div>
          <p v-else>暂无课程大纲</p>
        </div>
        
        <div class="detail-section">
          <h4>课程资源</h4>
          <div v-if="selectedCourse.resources && selectedCourse.resources.length > 0" class="resource-list">
            <div v-for="resource in selectedCourse.resources" :key="resource.id" class="resource-item">
              <el-icon><Document /></el-icon>
              <span>{{ resource.name }}</span>
              <span class="resource-size">{{ resource.size }}</span>
            </div>
          </div>
          <p v-else>暂无课程资源</p>
        </div>
      </div>
    </el-dialog>

    <!-- 审核对话框 -->
    <el-dialog
      v-model="showAuditDialog"
      :title="auditAction === 'approve' ? '审核通过' : '审核拒绝'"
      width="500px"
    >
      <el-form
        ref="auditFormRef"
        :model="auditForm"
        :rules="auditRules"
        label-width="80px"
      >
        <el-form-item label="审核意见" prop="comment">
          <el-input
            v-model="auditForm.comment"
            type="textarea"
            :rows="4"
            :placeholder="auditAction === 'approve' ? '请输入通过意见（可选）' : '请输入拒绝原因'"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAuditDialog = false">取消</el-button>
        <el-button 
          :type="auditAction === 'approve' ? 'success' : 'danger'"
          @click="submitAudit"
          :loading="auditLoading"
        >
          {{ auditAction === 'approve' ? '通过' : '拒绝' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'CourseAudit',
  setup() {
    const loading = ref(false)
    const auditLoading = ref(false)
    const showViewDialog = ref(false)
    const showAuditDialog = ref(false)
    const auditFormRef = ref()
    const selectedCourse = ref(null)
    const auditAction = ref('approve')

    // 搜索表单
    const searchForm = reactive({
      keyword: '',
      status: '',
      category: '',
      dateRange: []
    })

    // 审核表单
    const auditForm = reactive({
      comment: ''
    })

    // 审核表单验证规则
    const auditRules = {
      comment: [
        { 
          required: true, 
          message: '请输入审核意见', 
          trigger: 'blur',
          validator: (rule, value, callback) => {
            if (auditAction.value === 'reject' && !value.trim()) {
              callback(new Error('拒绝时必须填写原因'))
            } else {
              callback()
            }
          }
        }
      ]
    }

    // 分页
    const pagination = reactive({
      current: 1,
      size: 10,
      total: 0
    })

    // 课程列表
    const courseList = ref([
      {
        id: 1,
        courseName: 'Web开发基础',
        teacherName: '张老师',
        category: '计算机科学',
        description: '本课程介绍Web开发的基础知识，包括HTML、CSS、JavaScript等核心技术。',
        status: 'pending',
        submitTime: '2024-01-15 10:30:00',
        auditTime: null,
        auditor: null,
        auditComment: null,
        outline: [
          { title: 'HTML基础', duration: 90 },
          { title: 'CSS样式', duration: 120 },
          { title: 'JavaScript编程', duration: 150 }
        ],
        resources: [
          { id: 1, name: '课程大纲.pdf', size: '2.5MB' },
          { id: 2, name: '示例代码.zip', size: '1.8MB' }
        ]
      },
      {
        id: 2,
        courseName: '数据结构与算法',
        teacherName: '李老师',
        category: '计算机科学',
        description: '深入学习数据结构与算法的核心概念和实现方法。',
        status: 'approved',
        submitTime: '2024-01-14 14:20:00',
        auditTime: '2024-01-15 09:15:00',
        auditor: '王管理员',
        auditComment: '课程内容完整，符合教学要求',
        outline: [
          { title: '线性表', duration: 120 },
          { title: '栈与队列', duration: 90 },
          { title: '树结构', duration: 180 }
        ],
        resources: [
          { id: 3, name: '算法演示.pptx', size: '5.2MB' }
        ]
      },
      {
        id: 3,
        courseName: '高等数学',
        teacherName: '王老师',
        category: '数学',
        description: '高等数学基础课程，涵盖微积分、线性代数等内容。',
        status: 'rejected',
        submitTime: '2024-01-13 16:45:00',
        auditTime: '2024-01-14 11:30:00',
        auditor: '王管理员',
        auditComment: '课程描述过于简单，需要补充详细内容',
        outline: [],
        resources: []
      }
    ])

    // 统计数据
    const pendingCount = computed(() => 
      courseList.value.filter(course => course.status === 'pending').length
    )
    const approvedCount = computed(() => 
      courseList.value.filter(course => course.status === 'approved').length
    )
    const rejectedCount = computed(() => 
      courseList.value.filter(course => course.status === 'rejected').length
    )

    // 获取状态文本
    const getStatusText = (status) => {
      const statusMap = {
        'pending': '待审核',
        'approved': '已通过',
        'rejected': '已拒绝'
      }
      return statusMap[status] || '未知'
    }

    // 获取状态标签类型
    const getStatusTagType = (status) => {
      const typeMap = {
        'pending': 'warning',
        'approved': 'success',
        'rejected': 'danger'
      }
      return typeMap[status] || 'info'
    }

    // 搜索
    const handleSearch = () => {
      pagination.current = 1
      loadCourseList()
    }

    // 重置搜索
    const handleReset = () => {
      Object.assign(searchForm, {
        keyword: '',
        status: '',
        category: '',
        dateRange: []
      })
      handleSearch()
    }

    // 加载课程列表
    const loadCourseList = () => {
      loading.value = true
      // 模拟API调用
      setTimeout(() => {
        loading.value = false
        pagination.total = courseList.value.length
      }, 1000)
    }

    // 查看课程详情
    const handleView = (row) => {
      selectedCourse.value = row
      showViewDialog.value = true
    }

    // 审核通过
    const handleApprove = (row) => {
      selectedCourse.value = row
      auditAction.value = 'approve'
      auditForm.comment = ''
      showAuditDialog.value = true
    }

    // 审核拒绝
    const handleReject = (row) => {
      selectedCourse.value = row
      auditAction.value = 'reject'
      auditForm.comment = ''
      showAuditDialog.value = true
    }

    // 提交审核
    const submitAudit = async () => {
      if (!auditFormRef.value) return

      try {
        await auditFormRef.value.validate()
        auditLoading.value = true

        // 模拟API调用
        setTimeout(() => {
          const course = courseList.value.find(c => c.id === selectedCourse.value.id)
          if (course) {
            course.status = auditAction.value === 'approve' ? 'approved' : 'rejected'
            course.auditTime = new Date().toLocaleString()
            course.auditor = '王管理员'
            course.auditComment = auditForm.comment

            ElMessage.success(
              auditAction.value === 'approve' ? '课程审核通过' : '课程审核拒绝'
            )
          }

          showAuditDialog.value = false
          auditLoading.value = false
        }, 1000)
      } catch (error) {
        auditLoading.value = false
        console.error('表单验证失败:', error)
      }
    }

    // 分页处理
    const handleSizeChange = (size) => {
      pagination.size = size
      pagination.current = 1
      loadCourseList()
    }

    const handleCurrentChange = (current) => {
      pagination.current = current
      loadCourseList()
    }

    onMounted(() => {
      loadCourseList()
    })

    return {
      loading,
      auditLoading,
      showViewDialog,
      showAuditDialog,
      auditFormRef,
      selectedCourse,
      auditAction,
      searchForm,
      auditForm,
      auditRules,
      pagination,
      courseList,
      pendingCount,
      approvedCount,
      rejectedCount,
      getStatusText,
      getStatusTagType,
      handleSearch,
      handleReset,
      handleView,
      handleApprove,
      handleReject,
      submitAudit,
      handleSizeChange,
      handleCurrentChange
    }
  }
}
</script>

<style scoped>
.course-audit {
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

.header-stats {
  display: flex;
  gap: 30px;
}

.search-bar {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding: 20px 0;
}

.course-detail {
  padding: 20px 0;
}

.detail-section {
  margin-top: 20px;
}

.detail-section h4 {
  margin: 0 0 10px 0;
  color: #303133;
  font-size: 16px;
}

.outline-list {
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.outline-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #ebeef5;
}

.outline-item:last-child {
  border-bottom: none;
}

.outline-number {
  width: 30px;
  color: #909399;
}

.outline-title {
  flex: 1;
  margin-left: 10px;
}

.outline-duration {
  color: #909399;
  font-size: 12px;
}

.resource-list {
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.resource-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #ebeef5;
}

.resource-item:last-child {
  border-bottom: none;
}

.resource-item .el-icon {
  margin-right: 8px;
  color: #409eff;
}

.resource-size {
  margin-left: auto;
  color: #909399;
  font-size: 12px;
}
</style> 