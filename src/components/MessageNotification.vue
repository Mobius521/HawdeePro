<template>
  <div class="message-notification">
    <el-badge :value="unreadCount" :hidden="unreadCount === 0" type="danger">
      <el-button
        type="text"
        class="notification-btn"
        @click="showMessageDropdown = !showMessageDropdown"
      >
        <el-icon size="20">
          <Message />
        </el-icon>
      </el-button>
    </el-badge>

    <!-- 消息下拉菜单 -->
    <el-dropdown
      v-model="showMessageDropdown"
      trigger="click"
      placement="bottom-end"
      @command="handleCommand"
    >
      <span class="el-dropdown-link">
        <el-icon class="el-icon--right">
          <arrow-down />
        </el-icon>
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="view-all">
            <el-icon><Document /></el-icon>
            查看所有消息
          </el-dropdown-item>
          <el-dropdown-item command="send-message">
            <el-icon><Plus /></el-icon>
            发送消息
          </el-dropdown-item>
          <el-dropdown-item divided command="mark-all-read">
            <el-icon><Check /></el-icon>
            全部标记已读
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <!-- 快速消息预览 -->
    <div v-if="showMessageDropdown" class="message-preview">
      <div class="preview-header">
        <span>最近消息</span>
        <el-button type="text" size="small" @click="showMessageDropdown = false">
          <el-icon><Close /></el-icon>
        </el-button>
      </div>
      <div class="preview-content">
        <div v-if="recentMessages.length === 0" class="no-messages">
          <el-icon><Inbox /></el-icon>
          <p>暂无消息</p>
        </div>
        <div
          v-for="message in recentMessages"
          :key="message.messageId"
          class="message-item"
          :class="{ unread: message.isRead === 0 }"
          @click="handleMessageClick(message)"
        >
          <div class="message-avatar">
            <el-avatar :size="32" :src="getAvatarUrl(message.senderId)">
              {{ getInitials(message.senderId) }}
            </el-avatar>
          </div>
          <div class="message-info">
            <div class="message-sender">{{ message.senderId }}</div>
            <div class="message-content">{{ truncateContent(message.messageContent) }}</div>
            <div class="message-time">{{ formatTime(message.createTime) }}</div>
          </div>
          <div v-if="message.isRead === 0" class="unread-indicator"></div>
        </div>
      </div>
      <div class="preview-footer">
        <el-button type="primary" size="small" @click="goToMessageCenter">
          进入消息中心
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getMyMessages, markAsRead } from '@/api/communication'

export default {
  name: 'MessageNotification',
  setup() {
    const router = useRouter()
    const userStore = useUserStore()
    
    const showMessageDropdown = ref(false)
    const messages = ref([])
    const loading = ref(false)
    
    // 计算属性
    const unreadCount = computed(() => {
      return messages.value.filter(msg => msg.isRead === 0).length
    })
    
    const recentMessages = computed(() => {
      return messages.value.slice(0, 5) // 只显示最近5条消息
    })
    
    // 方法
    const loadMessages = async () => {
      if (!userStore.userId) return
      
      loading.value = true
      try {
        const response = await getMyMessages(userStore.userId)
        if (response.code === 0 || response.code === 200) {
          messages.value = response.data || []
        }
      } catch (error) {
        console.error('加载消息失败:', error)
      } finally {
        loading.value = false
      }
    }
    
    const handleCommand = (command) => {
      switch (command) {
        case 'view-all':
          goToMessageCenter()
          break
        case 'send-message':
          goToMessageCenter('send')
          break
        case 'mark-all-read':
          markAllAsRead()
          break
      }
      showMessageDropdown.value = false
    }
    
    const goToMessageCenter = (action = '') => {
      router.push({
        path: '/info/message-center',
        query: action ? { action } : {}
      })
    }
    
    const handleMessageClick = async (message) => {
      if (message.isRead === 0) {
        try {
          await markAsRead(message.messageId)
          message.isRead = 1
        } catch (error) {
          console.error('标记已读失败:', error)
        }
      }
      goToMessageCenter()
    }
    
    const markAllAsRead = async () => {
      const unreadMessages = messages.value.filter(msg => msg.isRead === 0)
      for (const message of unreadMessages) {
        try {
          await markAsRead(message.messageId)
          message.isRead = 1
        } catch (error) {
          console.error('标记已读失败:', error)
        }
      }
    }
    
    const truncateContent = (content) => {
      return content.length > 50 ? content.substring(0, 50) + '...' : content
    }
    
    const formatTime = (time) => {
      const date = new Date(time)
      const now = new Date()
      const diff = now - date
      
      if (diff < 60000) { // 1分钟内
        return '刚刚'
      } else if (diff < 3600000) { // 1小时内
        return Math.floor(diff / 60000) + '分钟前'
      } else if (diff < 86400000) { // 1天内
        return Math.floor(diff / 3600000) + '小时前'
      } else {
        return date.toLocaleDateString()
      }
    }
    
    const getAvatarUrl = (userId) => {
      // 这里可以根据用户ID生成头像URL
      return ''
    }
    
    const getInitials = (userId) => {
      return userId.substring(0, 2).toUpperCase()
    }
    
    // 定时刷新消息
    let refreshTimer = null
    
    const startRefreshTimer = () => {
      refreshTimer = setInterval(() => {
        loadMessages()
      }, 30000) // 每30秒刷新一次
    }
    
    const stopRefreshTimer = () => {
      if (refreshTimer) {
        clearInterval(refreshTimer)
        refreshTimer = null
      }
    }
    
    // 生命周期
    onMounted(() => {
      loadMessages()
      startRefreshTimer()
    })
    
    onUnmounted(() => {
      stopRefreshTimer()
    })
    
    return {
      showMessageDropdown,
      messages,
      loading,
      unreadCount,
      recentMessages,
      handleCommand,
      goToMessageCenter,
      handleMessageClick,
      markAllAsRead,
      truncateContent,
      formatTime,
      getAvatarUrl,
      getInitials
    }
  }
}
</script>

<style scoped>
.message-notification {
  position: relative;
  display: inline-block;
}

.notification-btn {
  color: #606266;
  padding: 8px;
}

.notification-btn:hover {
  color: #409eff;
}

.message-preview {
  position: absolute;
  top: 100%;
  right: 0;
  width: 320px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  margin-top: 8px;
}

.preview-header {
  padding: 12px 16px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
  color: #303133;
}

.preview-content {
  max-height: 300px;
  overflow-y: auto;
}

.no-messages {
  padding: 40px 20px;
  text-align: center;
  color: #909399;
}

.no-messages .el-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.message-item {
  padding: 12px 16px;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  display: flex;
  align-items: flex-start;
  position: relative;
  transition: background-color 0.2s;
}

.message-item:hover {
  background-color: #f5f7fa;
}

.message-item.unread {
  background-color: #f0f9ff;
}

.message-item.unread:hover {
  background-color: #e0f2fe;
}

.message-avatar {
  margin-right: 12px;
  flex-shrink: 0;
}

.message-info {
  flex: 1;
  min-width: 0;
}

.message-sender {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
  font-size: 14px;
}

.message-content {
  color: #606266;
  font-size: 13px;
  line-height: 1.4;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.message-time {
  color: #909399;
  font-size: 12px;
}

.unread-indicator {
  position: absolute;
  top: 12px;
  right: 16px;
  width: 8px;
  height: 8px;
  background-color: #f56c6c;
  border-radius: 50%;
}

.preview-footer {
  padding: 12px 16px;
  border-top: 1px solid #ebeef5;
  text-align: center;
}

.el-dropdown-link {
  display: none;
}
</style> 