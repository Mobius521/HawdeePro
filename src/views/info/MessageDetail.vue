<template>
  <div class="message-detail-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <el-button @click="goBack" class="back-btn">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <h2>消息详情</h2>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>

    <!-- 消息详情 -->
    <div v-else-if="message" class="message-detail-container">
      <div class="message-card">
        <!-- 消息头部 -->
        <div class="message-header">
          <div class="message-meta">
            <div class="sender-info">
              <el-avatar :size="48" :src="getAvatarUrl(message.senderId)">
                {{ getInitials(message.senderId) }}
              </el-avatar>
              <div class="sender-details">
                <h3>{{ message.senderId }}</h3>
                <p class="send-time">{{ formatDate(message.createTime) }}</p>
              </div>
            </div>
            <div class="message-status">
              <el-tag :type="message.isRead === 1 ? 'success' : 'warning'">
                {{ message.isRead === 1 ? '已读' : '未读' }}
              </el-tag>
            </div>
          </div>
        </div>

        <!-- 消息内容 -->
        <div class="message-content">
          <div class="content-text">{{ message.messageContent }}</div>
        </div>

        <!-- 消息操作 -->
        <div class="message-actions">
          <el-button
            v-if="message.isRead === 0"
            type="primary"
            @click="handleMarkAsRead"
            :loading="markingAsRead"
          >
            <el-icon><Check /></el-icon>
            标记已读
          </el-button>
          <el-button type="success" @click="handleReply">
            <el-icon><ChatDotRound /></el-icon>
            回复
          </el-button>
          <el-button type="danger" @click="handleDelete" :loading="deleting">
            <el-icon><Delete /></el-icon>
            删除
          </el-button>
        </div>
      </div>

      <!-- 消息信息 -->
      <div class="message-info-card">
        <h3>消息信息</h3>
        <div class="info-list">
          <div class="info-item">
            <label>消息ID：</label>
            <span>{{ message.messageId }}</span>
          </div>
          <div class="info-item">
            <label>发送者：</label>
            <span>{{ message.senderId }}</span>
          </div>
          <div class="info-item">
            <label>接收者：</label>
            <span>{{ message.receiverId }}</span>
          </div>
          <div class="info-item">
            <label>发送时间：</label>
            <span>{{ formatDate(message.createTime) }}</span>
          </div>
          <div class="info-item">
            <label>状态：</label>
            <el-tag :type="message.isRead === 1 ? 'success' : 'warning'">
              {{ message.isRead === 1 ? '已读' : '未读' }}
            </el-tag>
          </div>
        </div>
      </div>
    </div>

    <!-- 消息不存在 -->
    <div v-else class="not-found">
      <el-empty description="消息不存在或已被删除">
        <el-button type="primary" @click="goBack">返回消息列表</el-button>
      </el-empty>
    </div>

    <!-- 回复对话框 -->
    <el-dialog
      v-model="showReplyDialog"
      title="回复消息"
      width="500px"
      :before-close="handleCloseReplyDialog"
    >
      <el-form :model="replyForm" :rules="replyRules" ref="replyFormRef" label-width="80px">
        <el-form-item label="接收者" prop="receiverId">
          <el-input v-model="replyForm.receiverId" placeholder="请输入接收者ID" />
        </el-form-item>
        <el-form-item label="回复内容" prop="messageContent">
          <el-input
            v-model="replyForm.messageContent"
            type="textarea"
            :rows="4"
            placeholder="请输入回复内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showReplyDialog = false">取消</el-button>
          <el-button type="primary" @click="handleSendReply" :loading="sendingReply">
            发送回复
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { getMyMessages, markAsRead, deleteMessage, sendMessage } from '@/api/communication'
import { formatDate } from '@/utils'

export default {
  name: 'MessageDetail',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const userStore = useUserStore()
    
    const loading = ref(false)
    const markingAsRead = ref(false)
    const deleting = ref(false)
    const sendingReply = ref(false)
    const message = ref(null)
    const showReplyDialog = ref(false)
    
    // 回复表单
    const replyForm = reactive({
      receiverId: '',
      messageContent: ''
    })
    
    const replyRules = {
      receiverId: [
        { required: true, message: '请输入接收者ID', trigger: 'blur' }
      ],
      messageContent: [
        { required: true, message: '请输入回复内容', trigger: 'blur' },
        { min: 1, max: 500, message: '回复内容长度在 1 到 500 个字符', trigger: 'blur' }
      ]
    }
    
    const replyFormRef = ref()
    
    // 方法
    const loadMessage = async () => {
      const messageId = route.params.id
      if (!messageId) {
        ElMessage.error('消息ID不存在')
        return
      }
      
      loading.value = true
      try {
        const response = await getMyMessages(userStore.userId)
        if (response.code === 0 || response.code === 200) {
          const messages = response.data || []
          message.value = messages.find(msg => msg.messageId === messageId)
          
          if (!message.value) {
            ElMessage.error('消息不存在或已被删除')
          }
        }
      } catch (error) {
        ElMessage.error(error.message)
      } finally {
        loading.value = false
      }
    }
    
    const handleMarkAsRead = async () => {
      if (!message.value) return
      
      markingAsRead.value = true
      try {
        const response = await markAsRead(message.value.messageId)
        if (response.code === 0 || response.code === 200) {
          ElMessage.success('标记已读成功')
          message.value.isRead = 1
        }
      } catch (error) {
        ElMessage.error(error.message)
      } finally {
        markingAsRead.value = false
      }
    }
    
    const handleReply = () => {
      if (!message.value) return
      
      // 设置回复的接收者为原消息的发送者
      replyForm.receiverId = message.value.senderId
      replyForm.messageContent = ''
      showReplyDialog.value = true
    }
    
    const handleSendReply = async () => {
      if (!replyFormRef.value) return
      
      try {
        await replyFormRef.value.validate()
        sendingReply.value = true
        
        const messageData = {
          senderId: userStore.userId,
          receiverId: replyForm.receiverId,
          messageContent: replyForm.messageContent
        }
        
        const response = await sendMessage(messageData)
        if (response.code === 0 || response.code === 200) {
          ElMessage.success('回复发送成功')
          showReplyDialog.value = false
          resetReplyForm()
        }
      } catch (error) {
        ElMessage.error(error.message)
      } finally {
        sendingReply.value = false
      }
    }
    
    const handleDelete = async () => {
      if (!message.value) return
      
      try {
        await ElMessageBox.confirm('确定要删除这条消息吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        deleting.value = true
        const response = await deleteMessage(message.value.messageId)
        if (response.code === 0 || response.code === 200) {
          ElMessage.success('删除成功')
          goBack()
        }
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error(error.message)
        }
      } finally {
        deleting.value = false
      }
    }
    
    const handleCloseReplyDialog = () => {
      showReplyDialog.value = false
      resetReplyForm()
    }
    
    const resetReplyForm = () => {
      replyForm.receiverId = ''
      replyForm.messageContent = ''
      if (replyFormRef.value) {
        replyFormRef.value.resetFields()
      }
    }
    
    const goBack = () => {
      router.push('/info/message-center')
    }
    
    const getAvatarUrl = (userId) => {
      // 这里可以根据用户ID生成头像URL
      return ''
    }
    
    const getInitials = (userId) => {
      return userId.substring(0, 2).toUpperCase()
    }
    
    // 生命周期
    onMounted(() => {
      loadMessage()
    })
    
    return {
      loading,
      markingAsRead,
      deleting,
      sendingReply,
      message,
      showReplyDialog,
      replyForm,
      replyRules,
      replyFormRef,
      formatDate,
      handleMarkAsRead,
      handleReply,
      handleSendReply,
      handleDelete,
      handleCloseReplyDialog,
      goBack,
      getAvatarUrl,
      getInitials
    }
  }
}
</script>

<style scoped>
.message-detail-page {
  padding: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  gap: 15px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 5px;
}

.loading-container {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.message-detail-container {
  display: grid;
  gap: 20px;
  grid-template-columns: 1fr 300px;
}

.message-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.message-header {
  padding: 20px;
  border-bottom: 1px solid #ebeef5;
}

.message-meta {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.sender-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.sender-details h3 {
  margin: 0 0 5px 0;
  color: #303133;
  font-size: 16px;
}

.send-time {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.message-content {
  padding: 20px;
}

.content-text {
  font-size: 16px;
  line-height: 1.6;
  color: #303133;
  white-space: pre-wrap;
}

.message-actions {
  padding: 20px;
  border-top: 1px solid #ebeef5;
  display: flex;
  gap: 10px;
}

.message-info-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  height: fit-content;
}

.message-info-card h3 {
  margin: 0 0 20px 0;
  color: #303133;
  font-size: 16px;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.info-item label {
  font-weight: 500;
  color: #606266;
  min-width: 80px;
}

.info-item span {
  color: #303133;
}

.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 768px) {
  .message-detail-container {
    grid-template-columns: 1fr;
  }
  
  .message-meta {
    flex-direction: column;
    gap: 15px;
  }
  
  .message-actions {
    flex-direction: column;
  }
}
</style> 