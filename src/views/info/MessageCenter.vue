<template>
  <div class="message-center">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>信息中心</h2>
      <el-button type="primary" @click="showSendDialog = true">
        <el-icon><Plus /></el-icon>
        发送消息
      </el-button>
    </div>

    <!-- 消息统计 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon unread">
            <el-icon><Message /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ unreadCount }}</div>
            <div class="stat-label">未读消息</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon total">
            <el-icon><Document /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ totalCount }}</div>
            <div class="stat-label">总消息数</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon sent">
            <el-icon><Promotion /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ sentCount }}</div>
            <div class="stat-label">已发送</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon received">
            <el-icon><Inbox /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ receivedCount }}</div>
            <div class="stat-label">已接收</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 消息列表 -->
    <div class="message-list-container">
      <div class="list-header">
        <h3>消息列表</h3>
        <div class="list-actions">
          <el-select v-model="filterType" placeholder="筛选类型" @change="filterMessages">
            <el-option label="全部消息" value="all" />
            <el-option label="未读消息" value="unread" />
            <el-option label="已读消息" value="read" />
          </el-select>
          <el-button @click="refreshMessages">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </div>

      <el-table
        :data="filteredMessages"
        style="width: 100%"
        v-loading="loading"
        @row-click="handleRowClick"
      >
        <el-table-column prop="messageId" label="消息ID" width="220" />
        <el-table-column label="状态" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.isRead === 1 ? 'success' : 'warning'">
              {{ scope.row.isRead === 1 ? '已读' : '未读' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="senderId" label="发送者" width="120" />
        <el-table-column prop="receiverId" label="接收者" width="120" />
        <el-table-column prop="messageContent" label="消息内容" show-overflow-tooltip />
        <el-table-column prop="createTime" label="发送时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button
              v-if="scope.row.isRead === 0"
              type="primary"
              size="small"
              @click.stop="handleMarkAsRead(scope.row.messageId)"
            >
              标记已读
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click.stop="handleDelete(scope.row.messageId)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 发送消息对话框 -->
    <el-dialog
      v-model="showSendDialog"
      title="发送消息"
      width="500px"
      :before-close="handleCloseDialog"
    >
      <el-form :model="messageForm" :rules="messageRules" ref="messageFormRef" label-width="80px">
        <el-form-item label="接收者" prop="receiverId">
          <el-input v-model="messageForm.receiverId" placeholder="请输入接收者ID" />
        </el-form-item>
        <el-form-item label="消息内容" prop="messageContent">
          <el-input
            v-model="messageForm.messageContent"
            type="textarea"
            :rows="4"
            placeholder="请输入消息内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showSendDialog = false">取消</el-button>
          <el-button type="primary" @click="handleSendMessage" :loading="sending">
            发送
          </el-button>
        </span>
      </template>
    </el-dialog>


  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { 
  sendMessage, 
  getMyMessages, 
  markAsRead, 
  deleteMessage 
} from '@/api/communication'
import { formatDate } from '@/utils'

export default {
  name: 'MessageCenter',
  setup() {
    const router = useRouter()
    const userStore = useUserStore()
    
    // 响应式数据
    const loading = ref(false)
    const sending = ref(false)
    const messages = ref([])
    const showSendDialog = ref(false)
    const filterType = ref('all')
    const currentPage = ref(1)
    const pageSize = ref(20)
    const total = ref(0)
    
    // 消息表单
    const messageForm = reactive({
      receiverId: '',
      messageContent: ''
    })
    
    const messageRules = {
      receiverId: [
        { required: true, message: '请输入接收者ID', trigger: 'blur' }
      ],
      messageContent: [
        { required: true, message: '请输入消息内容', trigger: 'blur' },
        { min: 1, max: 500, message: '消息内容长度在 1 到 500 个字符', trigger: 'blur' }
      ]
    }
    
    const messageFormRef = ref()
    
    // 计算属性
    const filteredMessages = computed(() => {
      if (filterType.value === 'all') {
        return messages.value
      } else if (filterType.value === 'unread') {
        return messages.value.filter(msg => msg.isRead === 0)
      } else if (filterType.value === 'read') {
        return messages.value.filter(msg => msg.isRead === 1)
      }
      return messages.value
    })
    
    const unreadCount = computed(() => {
      return messages.value.filter(msg => msg.isRead === 0).length
    })
    
    const totalCount = computed(() => messages.value.length)
    
    const sentCount = computed(() => {
      return messages.value.filter(msg => msg.senderId === userStore.userInfo.id).length
    })
    
    const receivedCount = computed(() => {
      return messages.value.filter(msg => msg.receiverId === userStore.userInfo.id).length
    })
    
    // 方法
    const loadMessages = async () => {
      loading.value = true
      try {
        const response = await getMyMessages(userStore.userInfo.id)
        if (response.code === 0 || response.code === 200) {
          messages.value = response.data || []
          total.value = messages.value.length
        }
      } catch (error) {
        ElMessage.error(error.message)
      } finally {
        loading.value = false
      }
    }
    
    const refreshMessages = () => {
      loadMessages()
    }
    
    const filterMessages = () => {
      currentPage.value = 1
    }
    
    const handleSendMessage = async () => {
      if (!messageFormRef.value) return
      
      try {
        await messageFormRef.value.validate()
        sending.value = true
        
        const messageData = {
          senderId: userStore.userInfo.id,
          receiverId: messageForm.receiverId,
          messageContent: messageForm.messageContent
        }
        
        const response = await sendMessage(messageData)
        if (response.code === 0 || response.code === 200) {
          ElMessage.success('消息发送成功')
          showSendDialog.value = false
          resetMessageForm()
          loadMessages()
        }
      } catch (error) {
        ElMessage.error(error.message)
      } finally {
        sending.value = false
      }
    }
    
    const handleMarkAsRead = async (messageId) => {
      try {
        const response = await markAsRead(messageId)
        if (response.code === 0 || response.code === 200) {
          ElMessage.success('标记已读成功')
          loadMessages()

        }
      } catch (error) {
        ElMessage.error(error.message)
      }
    }
    
    const handleDelete = async (messageId) => {
      try {
        await ElMessageBox.confirm('确定要删除这条消息吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        const response = await deleteMessage(messageId)
        if (response.code === 0 || response.code === 200) {
          ElMessage.success('删除成功')
          loadMessages()

        }
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error(error.message)
        }
      }
    }
    
    const handleRowClick = (row) => {
      // 跳转到消息详情页面
      router.push(`/dashboard/info/message-detail/${row.messageId}`)
    }
    
    const handleCloseDialog = () => {
      showSendDialog.value = false
      resetMessageForm()
    }
    
    const resetMessageForm = () => {
      messageForm.receiverId = ''
      messageForm.messageContent = ''
      if (messageFormRef.value) {
        messageFormRef.value.resetFields()
      }
    }
    
    const handleSizeChange = (val) => {
      pageSize.value = val
      currentPage.value = 1
    }
    
    const handleCurrentChange = (val) => {
      currentPage.value = val
    }
    
    // 生命周期
    onMounted(() => {
      loadMessages()
    })
    
    return {
      loading,
      sending,
      messages,
      showSendDialog,
      filterType,
      currentPage,
      pageSize,
      total,
      messageForm,
      messageRules,
      messageFormRef,
      filteredMessages,
      unreadCount,
      totalCount,
      sentCount,
      receivedCount,
      formatDate,
      refreshMessages,
      filterMessages,
      handleSendMessage,
      handleMarkAsRead,
      handleDelete,
      handleRowClick,
      handleCloseDialog,
      handleSizeChange,
      handleCurrentChange
    }
  }
}
</script>

<style scoped>
.message-center {
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

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 24px;
  color: #fff;
}

.stat-icon.unread {
  background: linear-gradient(135deg, #ff6b6b, #ee5a52);
}

.stat-icon.total {
  background: linear-gradient(135deg, #4ecdc4, #44a08d);
}

.stat-icon.sent {
  background: linear-gradient(135deg, #45b7d1, #96c93d);
}

.stat-icon.received {
  background: linear-gradient(135deg, #f093fb, #f5576c);
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.message-list-container {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.list-header {
  padding: 20px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.list-header h3 {
  margin: 0;
  color: #303133;
}

.list-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.pagination-container {
  padding: 20px;
  display: flex;
  justify-content: center;
}



.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 