<template>
    <el-card>
      <!-- 顶部筛选栏 -->
      <div class="toolbar">
        <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="截止日期" />
        <el-input v-model="searchUser" placeholder="请输入用户名" style="width: 240px" clearable />
        <el-button type="primary" @click="loadSubmissions">查询</el-button>
        <el-button type="danger" @click="batchDelete">批量删除</el-button>
      </div>
  
      <!-- 表格展示 -->
      <el-table :data="submissions" border style="margin-top: 20px" @selection-change="handleSelection">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="assignmentTitle" label="作业" />
        <el-table-column prop="studentName" label="学生" />
        <el-table-column prop="type" label="类型" />
        <el-table-column prop="filename" label="文件名" />
        <el-table-column prop="score" label="得分">
          <template #default="scope">
            <el-input v-model="scope.row.score" size="small" style="width: 60px" />
          </template>
        </el-table-column>
        <el-table-column prop="comment" label="评价">
          <template #default="scope">
            <el-input v-model="scope.row.comment" size="small" />
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="批注">
          <template #default="scope">
            <el-input v-model="scope.row.remark" size="small" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" @click="download(scope.row)">下载</el-button>
            <el-button size="small" type="success" @click="submitScore(scope.row)">打分</el-button>
            <el-button size="small" type="warning" @click="print(scope.row)">打印</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import axios from 'axios'
  
  const dateRange = ref([])
  const searchUser = ref('')
  const submissions = ref([])
  const selected = ref([])
  
  const loadSubmissions = async () => {
    const res = await axios.get('/api/submissions', {
      params: {
        startDate: dateRange.value?.[0],
        endDate: dateRange.value?.[1],
        username: searchUser.value
      }
    })
    submissions.value = res.data.data
  }
  
  const handleSelection = (val) => {
    selected.value = val
  }
  
  const submitScore = async (row) => {
    await axios.put(`/api/submissions/${row.id}`, {
      score: row.score,
      comment: row.comment,
      remark: row.remark
    })
    ElMessage.success('打分成功')
    await loadSubmissions()
  }
  
  const batchDelete = () => {
    ElMessageBox.confirm('确定批量删除所选记录？', '提示').then(async () => {
      const ids = selected.value.map(item => item.id)
      await axios.post('/api/submissions/deleteBatch', ids)
      ElMessage.success('删除成功')
      await loadSubmissions()
    })
  }
  
  const download = (row) => {
    window.open(`/api/submissions/${row.id}/download`, '_blank')
  }
  
  const print = (row) => {
    window.open(`/api/submissions/${row.id}/print`, '_blank')
  }
  
  onMounted(loadSubmissions)
  </script>
  
  <style scoped>
  .toolbar {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    margin-bottom: 20px;
  }
  </style>
  