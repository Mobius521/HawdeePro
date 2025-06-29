<template>
  <div class="log-management">
    <!-- 日志列表 -->
    <el-table :data="logList" style="width: 100%">
      <el-table-column prop="username" label="用户姓名" min-width="150" />
      <el-table-column prop="action" label="操作类型" width="150" />
      <el-table-column prop="time" label="操作时间" width="200" />
      <el-table-column prop="description" label="操作描述" min-width="300" />
    </el-table>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'LogManagement',
  setup() {
    const logList = ref([
      {
        username: 'teacher1',
        action: '创建课程',
        time: '2024-06-25 10:00:00',
        description: '创建了名为“数据结构”的课程'
      },
      {
        username: 'teacher2',
        action: '发布作业',
        time: '2024-06-24 14:30:00',
        description: '为“操作系统”课程发布了作业'
      }
    ])
    return {
      logList
    }
  }
}
</script>